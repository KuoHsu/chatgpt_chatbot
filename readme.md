# ChatGPT chatbot on telegram and line

This program is the bot that can provide user chat with chatGPT-ai on telegram and line, and also can provide owner record user's chatrecord (this features is optional).

---

#### **Runtime environment**


| services                     | Runtime | version  |
| ------------------------------ | --------- | ---------- |
| chatGPT services and chatbot | nodeJS  | v18.12.1 |
| database                     | mariaDB | v10.10.2 |

---

#### **Building bot**

To build the line-bot, see [https://developers.line.biz/en/docs/messaging-api/building-bot/#set-up-bot-on-line-developers-console](https://)

To build the telegram-bot, see [https://learn.microsoft.com/en-us/azure/bot-service/bot-service-channel-connect-telegram?view=azure-bot-service-4.0](https://)

---

#### **Setting configuration**

Before using, check [config.json](./config.json) is setting, this file include telegram-bot's token, line-bot's setting, and other setting, so don't forget.
If you don't want to record user's chatrecord, just setting option 'database.using' to 'N' in this file.

---

#### **Running services**

**Run chatGPT chatbot**

This server is the router between bot and chatGPT, and this server include record features.<br>
command: `node ai_server.js`

**Run telegram-bot services**

command: `node tgbot.js`

**Run line-bot services**

command: `node linebot.js`
