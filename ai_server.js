const { Configuration, OpenAIApi } = require('openai');
const express = require('express');
const db = require('./connection.js');

console.log(db);
var dbExecutor = new db.dbExecutor(db.dbConfiguration);
dbExecutor.connect();







//chatgpt的api key設定
const AIconfiguration = new Configuration({
    apiKey: "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",//chatgpt的api key
  });
const openAi = new OpenAIApi(AIconfiguration);

const openAIreplyText = async function(qMsg){
    
    let replyText = "";


    try {
        const response = await openAi.createCompletion({
            model: "text-davinci-003",
            temperature:0.9,
            prompt: qMsg ,
            max_tokens: 500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6
          });
          replyText = response.data.choices[0].text;
          replyText = replyText.match('(.*\n+)?([\\S\\s]+)')[2];
    } catch (error) {
        console.error(error);
        replyText = "我不知道";
    }
    return replyText;
};


const openAIreplyImg = async function(qMsg){
    
    let imageUrl = ''
    try {
        let  response = await openAi.createImage({
            prompt:qMsg,
            n:1,
            size:"512x512",
        });
        imageUrl = response.data.data[0].url;
    } catch (error) {
        imageUrl = 'error';
    }
    
    console.log(imageUrl);
    return imageUrl;

};

var ex_app = express();
ex_app.use(express.json());

ex_app.post('/line/text', async(req,res)=>{
    /*req.body
    {
        userid: <line-message-api userid>,
        username: <line-message-api username>,
        request: <user' question>,
        from: 'line',
        groupid:,
        groupname
    }
    
    */
    console.log(req.body);
    let q = req.body.request;
    let ai_reply = await openAIreplyText(q);

    let restoreRecord = req.body;
    restoreRecord.response = ai_reply;
    restoreRecord.type = 'text';

    console.log(restoreRecord);

    let data = new db.dbData(restoreRecord);
    dbExecutor.appendQArecord(data);

    res.send(ai_reply);

});


ex_app.post('/telegram/text', async(req,res)=>{
    /*req.body
    {
        userid: ,
        userName: ,
        text: ,
        from: 'telegram'
    }
    
    */
    console.log(req.body);
    let q = req.body.request;
    let ai_reply = await openAIreplyText(q);

 
    res.send(ai_reply);

    let restoreRecord = req.body;
    restoreRecord.response = ai_reply;
    restoreRecord.type = 'text';

    console.log(restoreRecord);

    let data = new db.dbData(restoreRecord);
    dbExecutor.appendQArecord(data);



    console.log(data);

});

ex_app.post('/telegram/img', async(req,res)=>{
    /*req.body
    {
        userid: <line-message-api userid>,
        userName: <line-message-api username>,
        text: <user' question>,
        from: 'line'
    }
    
    */
    console.log(req.body);
    let q = req.body.request;
    let imgUrl = await openAIreplyImg(q);


    let restoreRecord = req.body;
    restoreRecord.response = imgUrl;
    restoreRecord.type = 'img';

    console.log(restoreRecord);

    let data = new db.dbData(restoreRecord);
    dbExecutor.appendQArecord(data);


    res.send(imgUrl);


    console.log(data);
});

ex_app.listen(8080,()=>{console.log('ai_server running at 127.0.0.1:8080..')});