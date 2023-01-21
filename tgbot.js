const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const ping = require('node-http-ping');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json'));
  
var Tg_token = config.telegrambot.token; 
var bot = new TelegramBot(Tg_token, {polling: true});

const aiserver_req_config = {
    baseURL:'http://' + config.chatgptServices.host + ':' + config.chatgptServices.port,
    responseType:'text',
    contentType:'application/json'
}

const getSendData = (msg,request) =>{
    let data = {};
    data.userid = msg.from.id;
    data.username = 'telegram_anonymous';//msg.from.username;
    data.request = request;
    data.groupid = msg.chat.type == 'group' ? msg.chat.id : null;
    data.groupname = msg.chat.type == 'group' ? msg.chat.title : null;
    data.from = 'telegram';
    return data;
}

const tgBotReplyText = async (msg,match) => {
    
    let chatId = msg.chat.id; 
    let messageId = msg.message_id;
    let send_Data = getSendData(msg,match[1]);

    bot.sendChatAction(chatId,'typing');


    let aiServerIsRunning = ping(config.chatgptServices.host,config.chatgptServices.port);
    aiServerIsRunning.then(async (m) =>{
        try {
            send_Data.type = 'text';

            let aiReply = await axios.post('/telegram/text',send_Data,aiserver_req_config);
            let aiReplyText = aiReply.data;
            bot.sendMessage(chatId, aiReplyText,{reply_to_message_id:messageId}); 
        
        } catch (error) {
            console.error(error);
        }
    },()=>{
        bot.sendMessage(chatId, 'Can\'t find chatGPT server.',{reply_to_message_id:messageId});
    });



    
}

const tgBotReplyImage = async (msg, match) => {

    let chatId = msg.chat.id; 
    let messageId = msg.message_id;
    let send_Data = getSendData(msg,match[1]);

    bot.sendChatAction(chatId,'upload_photo');


    let aiServerIsRunning = ping(config.chatgptServices.host,config.chatgptServices.port);
    aiServerIsRunning.then(async (m) =>{
        try {
            send_Data.type = 'img';

            let ai_reply = await axios.post('/telegram/img',send_Data,aiserver_req_config);
            let imgURL = ai_reply.data;
            if(imgURL== 'error'){
                bot.sendMessage(chatId,"chatGPT error",{reply_to_message_id:messageId});
            }else{
                let imgData = await axios.get(imgURL,{responseType:'arraybuffer'});
                let img = Buffer.from(imgData.data,'binary');
                bot.sendPhoto(chatId,img,{reply_to_message_id:messageId});
            }

        
        } catch (error) {
            console.error(error);
        }
    },()=>{
        bot.sendMessage(chatId, 'Can\'t find chatGPT server.',{reply_to_message_id:messageId});
    });

}






bot.onText(/\/gpt (.+)/,tgBotReplyText);

bot.onText(/\/img (.+)/,tgBotReplyImage);


console.log('telegram-bot running');
