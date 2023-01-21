const mariadb = require('mariadb');


class dbData {

    constructor(data) {
        this.user_id = data.userid;
        this.user_name = data.username;
        this.group_id = data.groupid;
        this.group_name = data.groupname;
        this.request = data.request;
        this.response = data.response;
        this.type = 0;
        if (data.type == 'text') {
            this.type = 1;
        } else if (data.type == 'img') {
            this.type = 2;
        }
        this.isGroup = data.groupid != null ? true:false;
        this.from = data.from;
    }
}


class dbExecutor {
    constructor(config) {
        this.config = config;
        this.conn = null;
        this.isConnect = false;
        this.connectionPool = mariadb.createPool(this.config);
    }

    connect = async () => {
        
        try {
            this.conn = await this.connectionPool.getConnection();
            if (this.conn) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }

    };

    connectIsExist = async () =>{
        if (!this.conn){
            await this.connect();
        }
    }

    appendQArecord = async (data) => {

        this.connectIsExist();
        let userIndex = await this.getUserIndex(data.user_id,data.from);
        let userIsExistFlag = userIndex == null ? false:true;
        let groupIsExistFlag = true;
        let groupIndex = null;

        if (!userIsExistFlag) {
            userIsExistFlag = await this.appendUser(data.user_id,data.user_name,data.from);
            userIndex = await this.getUserIndex(data.user_id,data.from);
        }

        if(data.isGroup){
            groupIsExistFlag = false;
            groupIndex = await this.getUserIndex(data.group_id,data.from);
            groupIsExistFlag = groupIndex == null? false:true;
            if(!groupIsExistFlag){
                groupIsExistFlag = await this.appendGroup(data.group_id,data.group_name,data.from);
                groupIndex = await this.getUserIndex(data.group_id,data.from);
            }

        }

        if(userIsExistFlag && groupIsExistFlag){
            let date = this.getDateTime();
            let inserData = [userIndex, groupIndex, data.request, data.response, date, data.type];
            let QArecordAppendQuery = await this.conn.query('INSERT INTO qa_info (user_index,group_index,request,response,datetime,type) VALUES (?,?,?,?,?,?)',inserData);
            if(QArecordAppendQuery.warningStatus == 0){
                console.log('qa insert sucess.');
            }else{
                console.log('qa insert defeat.');

            }
        }
        
    }


    getUserIndex = async (user_id, from) => {
        let query = await this.conn.query('SELECT u.user_index as uindex FROM user_info u WHERE u.user_id = ? AND u.`from` = ?', [user_id,from]);
        return query[0] == null ? null : query[0].uindex;

    }

    appendUser = async (user_id, user_name, from) => {
        let userAppendQuery = await this.conn.query('INSERT INTO user_info (user_id, `from`, username) VALUES (?,?,?)',[user_id,from,user_name]);
        let ok = userAppendQuery.warningStatus == 0;
        console.log('add user ' + ok);
        return ok;
    }

    getGroupIndex = async (group_id, from) => {
        let query = await this.conn.query('SELECT g.group_index as gindex FROM group_info g WHERE g.group_id = ? AND g.`from` = ?', [group_id,from]);
        return query[0] == null ? null : query[0].gindex;
    }

    appendGroup = async (group_id, group_name, from) => {
        let groupAppendQuery = await this.conn.query('INSERT INTO group_info (group_id, `from`, group_name) VALUES (?,?,?)',[group_id,from,group_name]);
        let ok = groupAppendQuery.warningStatus == 0;
        console.log('add group ' + ok);
        return ok;
    }

    getDateTime = () => {
        let d = new Date();
        let Y = d.getFullYear();
        let M = d.getMonth()+1;
        let D = d.getDate();
        let h =d.getHours();
        let m =d.getMinutes();
        let s =d.getSeconds();
        
        let ds = Y + '-' + M + '-' + D + ' ' + h + ':' + m +':' + s;
        return ds;
    }
};

module.exports = {dbExecutor: dbExecutor, dbData: dbData };


