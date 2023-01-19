linebot跟telegrambot會分別放在app engine跟compute engine是因為linebot找到的套件需要設定webhook，telegram則不用

linebot會放在gcp的app engine主要是要解決webhook需要使用有https的URL來當傳送對象，簡單來說，搞不到一個可以正常使用的domain
原本使用的是ngrok，可以在本地跑也可以在雲端跑，但問題是免費的一段時間就會自動換網址，無法長期使用
所以後來去no ip申請domain，但不知道為什麼綁了VM的IP卻無法訪問，no ip應該有附帶設定DNS?
後來又搞了gcp的附載平衡(有SSL)，但前後端路由嘎不起來，無法正常轉發

telegram找到的套件不需要設定webhook，不知道背後的原理(有另外一台伺服器在背後運作?)
直接丟到gcp的VM上

VM環境是用linux，光是從本地(windows)搬到雲端(linux)就得把環境全部重弄，什麼npm，資料庫
資料庫還要記錄一下sql指令，才能生成一模一樣的資料庫
是不是該學docker了
但光一個node的docker就很大了(好幾G)

資料庫倒沒遇到什麼問題，就是後來因為多加了一個line，資料表改動比較麻煩，直接用gui生成指令貼上
什麼alter modify add remove..
然後又踩到編碼設定的雷，因為有emoij這種比較新型的字元，要改成utf8mb4才能正常儲存(撈資料出來也才能正常顯示)


主要是因為需要接DB，不然一個bot一個檔案就夠了，了不起再多一個專門向ai發請求的檔案


途中開發沒有用git做版控，寫完就忘，也沒辦法紀錄寫到哪裡


github:
https://github.com/KuoHsu/chatgpt_bot




manage account: codekuo711@gmail.com
project: openaiontelegram
	gcp compute engine (VM)
	ip 35.221.202.154
	
	telegram_bot port: none
	ai_services port: 8080

	
	https://console.cloud.google.com/compute/instances?authuser=1&project=openaiontelegram
	vm環境 maridb, node, 相關套件

	maridb linux安裝
	sudo yum update
	sudo yum install mariadb-server
	sudo systemctl enable mariadb
	sudo systemctl start mariadb
	systemctl status mariadb
	sudo mysql_secure_installation

	匯出/匯入資料庫
	https://www.jinnsblog.com/2018/04/mysql-export-import-db-table.html

project: openai-linebot
	gcp app engine
	url: https://openai-linebot.df.r.appspot.com
	service url: https://openai-linebot.df.r.appspot.com/linebot
	line webhook https://developers.line.biz/console/channel/1657799814/messaging-api



telegrambot 
token(測試機): 5651291575:AAGKtRApJbdnrsDj0LCwzpEc_FjouD_MYys
token(智障一號，上線版): 5812256168:AAGswJmRga8LPXF5siPTmrSChHhaXel4qCE

linebot
account: pk9987581
channelId: '1657799814',
channelSecret: '29874618a8cccddce7febbedfcaf24bf',
channelAccessToken: 'sDJpJEAB83T99UALegbze+zEpfwZRrdM/ZcMm8aPlIGyu0BHxfwQn2iigUFIQwahwGmTFFwMT/0SylB0iytHq0YYFkbBzr8ED9gAj16p0mpboQBcT4dJp2nIXySetO0TsXvc4Rly7Tb7xkdL2B9gHQdB04t89/1O/w1cDnyilFU='




openai_chatgpt
api key(codekuo711): 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
api key(pk9987581): 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

gcp主機:8080

接收格式
路由: /telegram/text ,/line/text
方法: Post
資料傳送格式: json
資料傳送內容: {
userid: 從平台獲取的userid，用在識別資料庫中的使用者
username: 從平台獲取的username，使用者儲存在資料庫中的名稱
request: 使用者向chatgpt送出的文字
groupid: 使用者傳送訊息當下所處的群組的ID，若沒有群組必須設定為null
groupname: 使用者傳送訊息當下所處的群組的名稱，若沒有群組必須設定為null
from: 使用者的來源(telegram或是line)
type: 使用者向chatgpt要求的格式，在此為text
}
回傳資料格式: text
資料傳送內容: chatgpt回傳的文字內容




路由: /telegram/img
方法: Post
資料傳送格式: json
資料傳送內容: {
userid: 從平台獲取的userid，用在識別資料庫中的使用者
username: 從平台獲取的username，使用者儲存在資料庫中的名稱
request: 使用者向chatgpt送出的圖片要素
groupid: 使用者傳送訊息當下所處的群組的ID，可以為null
groupname: 使用者傳送訊息當下所處的群組的名稱，可以為null
from: 使用者的來源(telegram)
type: 使用者向chatgpt要求的格式，在此為img
}
回傳資料格式: text
資料傳送內容: chatgpt產生的圖片的URL




account = codekuo711@gmail.com
disable_usage_reporting = False
project = openai-linebot

gcloud app deploy





gcloud compute project-info add-metadata --metadata google-compute-default-region=asia-east1,google-compute-default-zone=asia-east1-a



127.0.0.1:3306
root
mar987@1234

db name openai_bot_telegram


programUser: botdbuser, bot9987

manageUser: root, mar987@55467


create table user_info(user_index INT NOT NULL autoincrement,user_id varchar(50) NOT NULL, from varchar(14) NOT NULL,username varchar(50) NOT NULL,PRIMARY KEY (user_index));
create table group_info(group_id INT NOT NULL,name varchar(50),PRIMARY KEY (group_id));
create table q_type(type_id INT NOT NULL,description varchar(20),PRIMARY KEY (type_id));
create table qa_info(qa_index INT NOT NULL AUTO_INCREMENT,user_id INT NOT NULL,group_id INT NULL,request varchar(1000) NOT NULL,response varchar(1000) NOT NULL,datetime datetime NOT NULL,type INT NOT NULL,PRIMARY KEY (qa_index),FOREIGN KEY (user_id) REFERENCES user_info (user_id),FOREIGN KEY (group_id) REFERENCES group_info (group_id),FOREIGN KEY (type) REFERENCES q_type (type_id));



create table "user_info"(
	user_id INT NOT NULL,
	username varchar(50),
	PRIMARY KEY (user_id)
)

create table "group_info"(
	group_id INT NOT NULL,
	name varchar(50),
	PRIMARY KEY (group_id)
)

create table "q_type"(
	type_id INT NOT NULL,
	description varchar(20),
	PRIMARY KEY (type_id)
)

type: 1, Question and answer
type: 2, Generate images based on parameters
INSERT into q_type VALUE (1,'Question and answer'),(2,'Generate images based on parameters')


create table "qa_info"(
	qa_index INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	group_id INT NULL,
	request varchar(1000) NOT NULL,
	response varchar(1000) NOT NULL,
	datetime datetime NOT NULL,
	type INT NOT NULL,
	PRIMARY KEY (qa_index),
	FOREIGN KEY (user_id) REFERENCES user_info (user_id),
	FOREIGN KEY (group_id) REFERENCES group_info (group_id),
	FOREIGN KEY (type) REFERENCES q_type (type_id),
)

table group_info
	[p]id:int(group_id),
	name:vchar(50)

table q_type
	[p]typeCode:int,
	description:vchar(20)

	
table user_info
	[p]id:int(from_id),
	username:vchar(50)

	


table qa_info
	qaindex


	[p]index:int(000000), 
	[f]from:int(from_id), 
	[f]group:int(group_id),
	request:vchar(1000),
	response:vchar(1000),
	datetime:Datetime,
	[f]type:int(requestType),
	tokenamount:int(costToken),


