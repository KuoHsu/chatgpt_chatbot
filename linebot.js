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


bot.on('message',async (event)=>{
    if(event.message.type != 'text')return;
    
    let aiServerIsRunning = ping(config.chatgptServices.host,config.chatgptServices.port);
    aiServerIsRunning.then(async (m) =>{
        try {
            let send_Data = {};
            send_Data.userid = event.source.userId;
            send_Data.username = 'line_anonymous';
            send_Data.request = event.message.text;
            send_Data.groupid = null;
            send_Data.groupname = null;
            send_Data.from = 'line';

            let aiReply = await axios.post('/line/text',send_Data,aiserver_req_config);
            let aiReplyText = aiReply.data;
            event.reply(aiReplyText);

   
        
        } catch (error) {
            console.error(error);
        }
    },()=>{
        event.reply("--[維護中，暫時無法互動。]--");
    });
    
});




bot.listen(config.linebot.URLpath,process.env.PORT || config.linebot.port,()=>{console.log('linebot server running ..')});