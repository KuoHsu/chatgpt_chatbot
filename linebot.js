const linebot = require('linebot');
const axios = require('axios');
const ping = require('node-http-ping');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json'));


const linebotConfig = {
    channelId: config.linebot.channelId,
    channelSecret: config.linebot.channelSecret,
    channelAccessToken: config.linebot.channelAccessToken
}


var bot = linebot(linebotConfig);


const aiserver_req_config = {
    baseURL:'http://' + config.chatgptServices.host + ':' + config.chatgptServices.port,
    responseType:'text',
    contentType:'application/json'
}

const getSendData = (event) =>{
    let data = {};
    data.userid = event.source.userId;
    data.username = 'line_anonymous';
    data.request = event.message.text;
    data.groupid = null;
    data.groupname = null;
    data.from = 'line';
    return data;
}


bot.on('message',async (event)=>{
    if(event.message.type != 'text')return;
    
    let aiServerIsRunning = ping(config.chatgptServices.host,config.chatgptServices.port);
    aiServerIsRunning.then(async (m) =>{
        try {
            
            let send_Data = getSendData(event);
            let aiReply = await axios.post('/line/text',send_Data,aiserver_req_config);
            let aiReplyText = aiReply.data;
            event.reply(aiReplyText);

   
        
        } catch (error) {
            console.error(error);
        }
    },()=>{
        event.reply("Can\'t find chatGPT server.");
    });
    
});




bot.listen(config.linebot.URLpath,process.env.PORT || config.linebot.port,()=>{console.log('linebot server running ..')});