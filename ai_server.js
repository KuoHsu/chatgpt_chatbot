const { Configuration, OpenAIApi } = require('openai');
const express = require('express');
const db = require('./dbexecute.js');
const fs = require('fs');


const config = JSON.parse(fs.readFileSync('./config.json'));



//chatgpt的api key設定
const AIconfiguration = new Configuration({
    apiKey: config.openai.apiKey,//chatgpt的api key
  });
const openAi = new OpenAIApi(AIconfiguration);
var dbExecutor  = null;


const connectToDB = async() =>{
    if(config.database.using == "Y"){
        dbExecutor = new db.dbExecutor(config.database);
        let isConnect = await dbExecutor.connect();
        return isConnect;
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

const appendQArecord = async(data) =>{
    if(config.database.using == 'Y'){
       let appendSuccess = await dbExecutor.appendQArecord(data);
       console.log(appendSuccess == true? 'appendRecordSuccess': 'appendRecordFail');
    }
}

const getDBformatData = (reqBody,response,type) =>{
    let data = new db.dbData();
    data.setUserFrom(reqBody.from);
    data.setUserId(reqBody.userid);
    data.setUserName(reqBody.username);
    data.setGroupId(reqBody.groupid);
    data.setGroupName(reqBody.groupname);
    data.setRequest(reqBody.request);
    data.setResponse(response);
    data.setType(type);
    return data;
}



var ex_app = express();
ex_app.use(express.json());

ex_app.post('/line/text', async(req,res)=>{
    let q = req.body.request;
    let ai_reply = await openAIreplyText(q);
    res.send(ai_reply);

    let data = getDBformatData(req,ai_reply,'text');
    appendQArecord(data);
});


ex_app.post('/telegram/text', async(req,res)=>{
    let q = req.body.request;
    let ai_reply = await openAIreplyText(q);
    res.send(ai_reply);


    let data = getDBformatData(req,ai_reply,'text');
    appendQArecord(data);

});

ex_app.post('/telegram/img', async(req,res)=>{
    console.log(req.body);
    let q = req.body.request;
    let imgUrl = await openAIreplyImg(q);
    res.send(imgUrl);


    let data = getDBformatData(req,imgUrl,'img');
    appendQArecord(data);
});

console.log(connectToDB() == true ? 'connect db success':'connect db fail');
ex_app.listen(config.chatgptServices.port,()=>{console.log('ai_server running..')});