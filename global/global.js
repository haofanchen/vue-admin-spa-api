var MongoClient =require('mongodb').MongoClient;

//封装成为内部函数
function _connent(callback) {
     var url='mongodb://127.0.0.1:27017/test';
    //连接数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(err, db);
    });
}

// 插入数据
exports.insertOne=function(collectionName,data,callback){
    _connent(function(err,db){
         db.collection(collectionName).insert(data,function(err,result){
            callback(err,result);
            db.close();
         })
    })
}

// 查找数据
exports.find = function (collectionName, json, callback) {
    var result = [];    //结果数组
   
    //返回的数据对象
    let resData = {
          "resultCode": "0",
          "resultMsg": "",
          "data": {
            "currPage": 1,
            "total": null,
            
            "pageSize": 10,
            "data": result
             
          }
        };

    //连接数据库，连接之后查找所有
    _connent(function (err, db) {
        
        //db.userInfo.find().skip(10);查询10条以后的数据
        //db.userInfo.find().limit(5);查询前5条数据
        let limi = Number(json.pageSize); //每页多少条
        let ski = (Number(json.currPage)-1)*limi
        //var cursor = db.collection(collectionName).find(JSON).skip(ski).limit(limi);
        // var cursor = db.collection(collectionName).find(JSON);
        var cursor; //查询结果
        if(json.studentName){
            //模糊查询
            cursor = db.collection(collectionName).find({"studentName": {$regex: json.studentName, $options:'i'}}).skip(ski).limit(limi);
            db.collection(collectionName).find({"studentName": {$regex: json.studentName, $options:'i'}}).count({},function(err, count){
                resData.data.total = count
                console.log('总条数为：',resData.data.total)
            })
        }else{
            //查询全部
            cursor = db.collection(collectionName).find({}).skip(ski).limit(limi);
            db.collection(collectionName).find().count({},function(err, count){
                resData.data.total = count
                console.log('总条数为：',resData.data.total)
            })
        }
        
        
        // 第一种写法 begin
        cursor.toArray(function(err , items){
            console.log('查询学生表数据11：',items)
            //重置接口返回的数据
            resData.data.data = items;
            //resData.data.total = db.collection(collectionName).find({}).count(); //查询总条数
            //修改分页数据后 陷入死循环已解决 2017.9.9 lss
            resData.data.currPage = Number(json.currPage);
            resData.data.pageSize = Number(json.pageSize);
            
            //截取对应多少条到多少条 给前端送回
            //resData.data.data = resData.data.data.slice(ski,limi)
            callback(null, resData);
            db.close(); //关闭数据库

        });
        return false;
        // 第一种写法 end

        cursor.each(function (err, doc) {
            
            if (err) {
                callback(err, null);
                db.close(); //关闭数据库
                return;
            }
            if (doc != null) {
                result.push(doc);   //放入结果数组
            } else {
                console.log('查询学生表数据：',result)
                resData.data.total = result.length;
                //遍历结束，没有更多的文档了
                //截取对应多少条到多少条 给前端送回
                resData.data.data = resData.data.data.slice(ski,limi)
                callback(null, resData);
                db.close(); //关闭数据库
            }
        });
    });
}

// 查找单条数据
exports.findItem = function (collectionName, json, callback) {
    var result = [];    //结果数组
    console.log('单条查找传参为======',json);
    //返回的数据对象
    let resData = {
          "resultCode": "0",
          "resultMsg": "",
          "data": null
        };

    //连接数据库，连接之后查找所有
    _connent(function (err, db) {
        db.collection(collectionName).findOne(json,function (err, items){
            
            console.log(json,'全部数据：',items);
            resData.data = items;
            callback(null, resData);
            db.close()
            
        });
         
        
       
    });
}

//删除
exports.deleteMany = function (collectionName, json, callback) {
    console.log('删除传参为,',json)
    _connent(function (err, db) {
        //删除
        db.collection(collectionName).deleteMany(
            json,
            function (err, results) {
                callback(err, results);
                db.close(); //关闭数据库
            }
        );
    });
}

//修改
exports.updateMany = function (collectionName, json1, json2, callback) {

    _connent(function (err, db) {
        db.collection(collectionName).updateMany(
            json1,
            json2,
            function (err, results) {
                callback(err, results);
                db.close();
            });
    })
}

    
    

