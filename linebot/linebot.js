const linebot = require('linebot');
const lineProfile = require('@line/bot-sdk');
const http = require('http');
const ping = require('node-http-ping');



const linebotConfig = {
    channelId: '1657799814',
    channelSecret: '29874618a8cccddce7febbedfcaf24bf',
    channelAccessToken: 'sDJpJEAB83T99UALegbze+zEpfwZRrdM/ZcMm8aPlIGyu0BHxfwQn2iigUFIQwahwGmTFFwMT/0SylB0iytHq0YYFkbBzr8ED9gAj16p0mpboQBcT4dJp2nIXySetO0TsXvc4Rly7Tb7xkdL2B9gHQdB04t89/1O/w1cDnyilFU='
}
var bot = linebot(linebotConfig);
var lineP = new lineProfile.Client({channelAccessToken:linebotConfig.channelAccessToken});

const req_text__option = {
    host:'35.221.202.154',
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
    if(event.message.text == "/200"){event.reply('200!');return;}
    let aiServerIsRunning = ping('35.221.202.154',8080);
    aiServerIsRunning.then(async (m) =>{
        try {
            let send_Data = {};
            send_Data.userid = event.source.userid;
            //let userProfile = await lineP.getProfile(send_Data.userid);
            send_Data.username = 'line_anonymous';
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




bot.listen('/linebot',process.env.PORT || 5000 ,()=>{console.log('linebot server running at 127.0.0.1:5000/linebot ..')});