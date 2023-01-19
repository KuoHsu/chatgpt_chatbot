const linebot = require('linebot');
const lineProfile = require('@line/bot-sdk');
const http = require('http');
const ping = require('node-http-ping');



const linebotConfig = {
    channelId: '<channelid>',
    channelSecret: '<channelSecret>',
    channelAccessToken: '<channelAccessToken>'
}


var bot = linebot(linebotConfig);
var lineP = new lineProfile.Client({channelAccessToken:linebotConfig.channelAccessToken});

const req_text__option = {
    host:'127.0.0.1',
    port:8080,
    path:'/line/text',
    method:'POST',
    headers:{'Content-Type':'application/json'}
}

const generateRequest = (event) =>{
    return http.request(req_text__option,(res)=>{
        let reply_data = '';
        res.on('data',(data)=>{
            reply_data+=data;
        });
        res.on('end',()=>{
            event.reply(reply_data);
        });

        res.on('error',()=>{
            console.error('https request error.');
        });

    });
}



bot.on('message',async (event)=>{
    if(event.message.type != 'text')return;
    
    let aiServerIsRunning = ping('127.0.0.1',8080);
    aiServerIsRunning.then(async (m) =>{
        try {
            let send_Data = {};
            send_Data.userid = event.source.userId;
            let userProfile = await lineP.getProfile(send_Data.userid);
            send_Data.username = userProfile.displayName;
            send_Data.request = event.message.text;
            send_Data.groupid = null;
            send_Data.groupname = null;
            send_Data.from = 'line';
            let req = generateRequest(event);
            let send_data_json = JSON.stringify(send_Data);
            req.write(send_data_json);
            req.end();
        
        } catch (error) {
            console.error(error);
        }
    },()=>{
        event.reply("--[維護中，暫時無法互動。]--");
    });
    
});




bot.listen('/linebot',80,()=>{console.log('linebot server running ..')});