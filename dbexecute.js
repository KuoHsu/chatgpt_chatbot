const mariadb = require('mariadb');


class dbData {

    constructor() {
        this.from = 'none';
        this.user_id = '0';
        this.user_name = 'no-user';
        this.group_id = null;
        this.group_name = null;
        this.request = 'none';
        this.response = 'none';
        this.type = 0;
    }
    setUserFrom = (from) =>{
        this.from = from;
    }

    setUserId = (userId) =>{
        this.user_id = userId;
    }

    setUserName = (userName) =>{
        this.user_name = userName;
    }
    setGroupId = (groupId) =>{
        this.group_id = groupId;
    }
    setGroupName = (groupName) =>{
        this.group_name = groupName;
    }
    setRequest = (request) =>{
        this.request = request;
    }
    setResponse = (response) =>{
        this.response = response;
    }
    setType = (type) =>{
        if (type == 'text') {
            this.type = 1;
        } else if (type == 'img') {
            this.type = 2;
        }
    }
    isGroup = () =>{
        return this.group_id != null ? true : false;
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
        return this.conn.isValid();
    }

    appendQArecord = async (data) => {

        try {
            if (!this.connectIsExist()){
                await this.connect();
            }
            let insertSuccess = false;
            let userIndex = await this.getUserIndex(data.user_id,data.from);
            let userIsExistFlag = userIndex == null ? false:true;
            let groupIndex = null;
            
    
            if (!userIsExistFlag) {
                userIsExistFlag = await this.appendUser(data.user_id,data.user_name,data.from);
                userIndex = await this.getUserIndex(data.user_id,data.from);
            }
    
            if(data.isGroup()){
                let groupIsExistFlag = false;
                groupIndex = await this.getUserIndex(data.group_id,data.from);
                groupIsExistFlag = groupIndex == undefined ? false:true;
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
                    insertSuccess = true;
                }
            }

            return insertSuccess;
        } catch (error) {
            console.error(error);
        }
        
        
    }


    getUserIndex = async (user_id, from) => {
        let query = await this.conn.query('SELECT u.user_index as uindex FROM user_info u WHERE u.user_id = ? AND u.`from` = ?', [user_id,from]);
        return query[0] == null ? null : query[0].uindex;

    }

    appendUser = async (user_id, user_name, from) => {
        let userAppendQuery = await this.conn.query('INSERT INTO user_info (user_id, `from`, username) VALUES (?,?,?)',[user_id,from,user_name]);
        let ok = userAppendQuery.warningStatus == 0;
        return ok;
    }

    getGroupIndex = async (group_id, from) => {
        let query = await this.conn.query('SELECT g.group_index as gindex FROM group_info g WHERE g.group_id = ? AND g.`from` = ?', [group_id,from]);
        return query[0] == null ? null : query[0].gindex;
    }

    appendGroup = async (group_id, group_name, from) => {
        let groupAppendQuery = await this.conn.query('INSERT INTO group_info (group_id, `from`, group_name) VALUES (?,?,?)',[group_id,from,group_name]);
        let ok = groupAppendQuery.warningStatus == 0;
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


