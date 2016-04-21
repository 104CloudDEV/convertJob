var AWS = require('aws-sdk'),
    https = require('https'),
    fs = require('fs'),
    config = require('../config'),
    dir = config.getTempFloderPath()

var s3 

module.exports = {
    getFile : function(s3ObjKey, callback){
        console.log(s3ObjKey)  
        //create /tmp
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir)
        }

        var params = {Bucket: config.getUserUploadS3bucket(), Key: s3ObjKey};
        var fileName = s3ObjKey.substring(s3ObjKey.lastIndexOf('/')+1, s3ObjKey.length) // s3ObjKey = a1c/63a/9f3/fe361b575c904448abd9d60cac97360611.jpg
        var file = fs.createWriteStream(dir + '/' + fileName)

        s3.getObject(params).createReadStream().pipe(file)

        
        file.on('finish', function() {
            console.log('file: ready')
            callback(null, fileName)
        })
    },


    upload : function(source, targetKey, callback){
        
        fs.readFile(source, function (err, data) {
            if (err) callback(err, null)

            var params = {
                Bucket: config.getConvertedS3bucket(), 
                Key: targetKey, 
                Body: data,
                ACL: 'public-read'
            };
            //console.log('params:' + JSON.stringify(params));
            
            s3.upload(params, function(err, data) {
                    if(err) callback(err, null)
                    console.log(data);
                }).on('httpUploadProgress', function(evt) {
                    //console.log(evt);   // upload progress
                }).send(function(err, data) {
                    if(err)callback(err, null)
                    
                    console.log("Upload done!\tETag:" + data.ETag)
                    callback(null, data);
            })
        })
    },
    audioFlow : function(){
    }
}

//This is for self test credentials, use EC2 role or local file.
fs.stat(config.getCredentialsPath(), function(err, stat) {
    if(err == null) {
        AWS.config.loadFromPath(config.getCredentialsPath()) // Load credentials from local json file
        s3 = new AWS.S3()  // Instantiate s3 client  
    } else {
        AWS.config.update(config.getRegion())      //sample: {region: 'ap-northeast-1'}
        s3 = new AWS.S3()   // Instantiate s3 client  
    }
});


