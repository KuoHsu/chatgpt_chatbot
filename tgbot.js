const db = require('./connection.js');


const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');


const ping = require('node-http-ping');


const { Configuration, OpenAIApi } = require('openai');


/*console.log(db);
var dbExecutor = new db.dbExecutor(db.dbConfiguration);
dbExecutor.connect();*/




//chatgpt的api key設定
const AIconfiguration = new Configuration({
    apiKey: "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",//chatgpt的api key
  });
  
  
  
  
  const openAi = new OpenAIApi(AIconfiguration);
  
//5651291575:AAGKtRApJbdnrsDj0LCwzpEc_FjouD_MYys(測試機)
//5812256168:AAGswJmRga8LPXF5siPTmrSChHhaXel4qCE //telegramBot的token(智障1號)
var Tg_token = '5812256168:AAGswJmRga8LPXF5siPTmrSChHhaXel4qCE'; 
var bot = new TelegramBot(Tg_token, {polling: true});
var onoff = 1;





const aiserver_req_config = {
    baseURL:'http://127.0.0.1:8080',
    responseType:'text',
    contentType:'application/json'
}


const tgBotReplyText = async (msg,match) => {
    if(onoff == 0)return;
    
    let chatId = msg.chat.id; 
    let messageId = msg.message_id;
    let q = match[1];

    bot.sendChatAction(chatId,'typing');


    let aiServerIsRunning = ping('127.0.0.1',8080);
    aiServerIsRunning.then(async (m) =>{
        try {
            let send_Data = {};
            send_Data.userid = msg.from.id;
            send_Data.username = 'telegram_anonymous';//msg.from.username;
            send_Data.request = q;
            send_Data.groupid = msg.chat.type == 'group' ? msg.chat.id : null;
            send_Data.groupname = msg.chat.type == 'group' ? msg.chat.title : null;
            send_Data.from = 'telegram';
            send_Data.type = 'text';

            let aiReply = await axios.post('/telegram/text',send_Data,aiserver_req_config);
            let aiReplyText = aiReply.data;
            bot.sendMessage(chatId, aiReplyText,{reply_to_message_id:messageId}); 
        
        } catch (error) {
            console.error(error);
        }
    },()=>{
        bot.sendMessage(chatId, '--[維護中，暫時無法互動。]--',{reply_to_message_id:messageId});
    });



    
}

const tgBotReplyImage = async (msg, match) => {
    if (onoff == 0)return;

    let chatId = msg.chat.id; 
    let messageId = msg.message_id;
    let imgprop = match[1];

    bot.sendChatAction(chatId,'upload_photo');


    let aiServerIsRunning = ping('127.0.0.1',8080);
    aiServerIsRunning.then(async (m) =>{
        try {
            let send_Data = {};
            send_Data.userid = msg.from.id;
            send_Data.username = msg.from.username;
            send_Data.request = imgprop;
            send_Data.groupid = msg.chat.type == 'group' ? msg.chat.id : null;
            send_Data.groupname = msg.chat.type == 'group' ? msg.chat.title : null;

            send_Data.from = 'telegram';
            send_Data.type = 'img';

            let ai_reply = await axios.post('/telegram/img',send_Data,aiserver_req_config);
            let imgURL = ai_reply.data;
            if(imgURL== 'error'){
                bot.sendMessage(chatId,"窩不知道你在講什麼。",{reply_to_message_id:messageId});
            }else{
                let imgData = await axios.get(imgURL,{responseType:'arraybuffer'});
                let img = Buffer.from(imgData.data,'binary');
                bot.sendPhoto(chatId,img,{reply_to_message_id:messageId});
            }

        
        } catch (error) {
            console.error(error);
        }
    },()=>{
        bot.sendMessage(chatId, '--[維護中，暫時無法互動。]--',{reply_to_message_id:messageId});
    });

}






bot.onText(/\@chatgpt_test01_bot (.+)/,tgBotReplyText);
 
bot.onText(/\/gpt (.+)/,tgBotReplyText);

bot.onText(/\/img (.+)/,tgBotReplyImage);

bot.onText(/\/on/,(msg)=>{
    onoff = 1;
    var chatId = msg.chat.id; 
    bot.sendMessage(chatId, '好喔，現在我可以講話了。'); 
});

bot.onText(/\/off/,(msg)=>{
    onoff = 0;
    var chatId = msg.chat.id; 
    bot.sendMessage(chatId, '好喔，我閉嘴。');
});

bot.onText(/\/list/,(msg)=>{
    var chatId = msg.chat.id; 
    var cmdList = 'gpt - 跟chatGPT講話\non - 讓機器人可以講話\noff - 讓機器人閉嘴\nlist - 條列出所有可用的指令';
    bot.sendMessage(chatId, cmdList);
});

bot.onText(/\/test/,(msg)=>{
    var chatId = msg.chat.id; 
    var reply = '200';
    bot.sendMessage(chatId, reply);
});

console.log('Process running');
/*
參考資料




用 Node.js 建立你的第一個 OpenAI LINE Bot 聊天機器人
https://israynotarray.com/nodejs/20221210/1224824056/

[教學] 如何用 node.js 建立一個簡單的 Telegram Bot？
https://blog.3bro.info/archives/nodejs-simple-telegram-bot-tutorial/

Day 16-開始製作Telegram聊天機器人吧！
https://ithelp.ithome.com.tw/articles/10244411
Day 17
https://ithelp.ithome.com.tw/articles/10245264
Day 18
https://ithelp.ithome.com.tw/articles/10245532


telegram-bot on node module
https://github.com/yagop/node-telegram-bot-api/blob/master/doc/api.md#TelegramBot+onText


node image buffer
https://stackoverflow.com/questions/57044639/nodejs-saving-an-image-sent-over-http-post-as-stream-to-a-file-system


丟到GCP
https://www.letswrite.tw/gcp-node/

要去開通付款帳號權限
build api也要開
佈署到雲端上指令 gcloud app deploy
啟動(瀏覽) gcloud app browse

gcp帳號
codekuo711@gmail.com

app管理頁面(服務)
https://console.cloud.google.com/appengine?project=openaiontelegram&serviceId=default

app管理頁面(VM)
https://console.cloud.google.com/compute/instances?authuser=1&project=openaiontelegram

https://ssh.cloud.google.com/v2/ssh/projects/openㄔaiontelegram/zones/asia-east1-a/instances/chatgpt-telegrambot?authuser=1&hl=zh_TW&projectNumber=440054835868&useAdminProxy=true&troubleshoot4005Enabled=true&troubleshoot255Enabled=true&regional=true


linebot 管理頁面
https://developers.line.biz/console/channel/1657799814/messaging-api

gcp linux vm 安裝ngrok

https://dashboard.ngrok.com/get-started/setup
https://medium.com/%E5%B7%A5%E7%A8%8B%E9%9A%A8%E5%AF%AB%E7%AD%86%E8%A8%98/create-a-line-chatbot-on-gcp-ecc3c9d2674d
https://www.delftstack.com/zh-tw/howto/linux/how-to-use-wget-command-in-linux/

sudo apt install wget
wget https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip
sudo apt install unzip
unzip ngrok-stable-linux-amd64.zip
./ngrok authtoken [your_token]


*/

/*
pm2
https://pm2.keymetrics.io/
*/
//pm2 start tgbot.js --name=tgbot 
//pm2 start linebot.js --name=linebot 
//pm2 start ai_server.js --name=aiserver 