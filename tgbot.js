const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const ping = require('node-http-ping');


  
//5651291575:AAGKtRApJbdnrsDj0LCwzpEc_FjouD_MYys(測試機)
//5812256168:AAGswJmRga8LPXF5siPTmrSChHhaXel4qCE //telegramBot的token(智障1號)
var Tg_token = '<your tlelegram bot token>'; 
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
