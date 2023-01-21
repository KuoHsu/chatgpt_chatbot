const { Configuration, OpenAIApi } = require('openai');
const express = require('express');
const db = require('./connection.js');
const fs = require('fs');


const config = JSON.parse(fs.readFileSync('./config.json'));



//chatgpt的api key設定
const AIconfiguration = new Configuration({
    apiKey: config.openai.apiKey,//chatgpt的api key
  });
const openAi = new OpenAIApi(AIconfiguration);
var dbExecutor  = null;


const connectToDB = () =>{
    if(config.database.using == "Y"){
        dbExecutor = new db.dbExecutor(config.database);
        dbExecutor.connect();
    }
}








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
    
    return imageUrl;

};




var ex_app = express();
ex_app.use(express.json());

ex_app.post('/line/text', async(req,res)=>{
    let q = req.body.request;
    let ai_reply = await openAIreplyText(q);
    res.send(ai_reply);

    
    if(config.database.using == 'Y'){
        let restoreRecord = req.body;
        restoreRecord.response = ai_reply;
        restoreRecord.type = 'text';
        let data = new db.dbData(restoreRecord);
        dbExecutor.appendQArecord(data);
    }
   


});


ex_app.post('/telegram/text', async(req,res)=>{
    let q = req.body.request;
    let ai_reply = await openAIreplyText(q);
    res.send(ai_reply);


    if(config.database.using == 'Y'){
        let restoreRecord = req.body;
        restoreRecord.response = ai_reply;
        restoreRecord.type = 'text';
        let data = new db.dbData(restoreRecord);
        dbExecutor.appendQArecord(data);
    }

});

ex_app.post('/telegram/img', async(req,res)=>{
    console.log(req.body);
    let q = req.body.request;
    let imgUrl = await openAIreplyImg(q);
    res.send(imgUrl);


    if(config.database.using == 'Y'){
        let restoreRecord = req.body;
        restoreRecord.response = ai_reply;
        restoreRecord.type = 'img';
        let data = new db.dbData(restoreRecord);
        dbExecutor.appendQArecord(data);
    }
});

ex_app.listen(config.chatgptServices.port,()=>{console.log('ai_server running..')});
connectToDB();