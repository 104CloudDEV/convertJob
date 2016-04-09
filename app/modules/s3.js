var AWS = require('aws-sdk'),
    https = require('https'),
    fs = require('fs'),
    config = require('../config'),
    dir = config.getTempFloderPath()

module.exports = {
    getFile : function(s3ObjKey, callback){
        console.log(s3ObjKey)  
        //create /tmp
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir)
        }

        var fileName = s3ObjKey.substring(s3ObjKey.lastIndexOf('/')+1, s3ObjKey.length) // s3ObjKey = a1c/63a/9f3/fe361b575c904448abd9d60cac97360611.jpg
        var file = fs.createWriteStream(dir + '/' + fileName)
        var options = config.getUserUploadS3()
        options.path = options.path+'/'+s3ObjKey

        var req = https.request(options, function(res) {
            console.log("statusCode: ", res.statusCode)
            
            //console.log("headers: ", res.headers)
            //res.on('data', function(d) {
                //file.write(d)
            //})

            // call back need wait file ready
            file.on('finish', function() {
                //console.log('file: ready')
                callback(null, fileName)
            })

            res.pipe(file);
        })

        req.end()

        req.on('error', function(e) {
          //console.error(e);
          callback(e, null)
        })
    },
    mediaFlow : function(){
    },
    audioFlow : function(){
    }
}