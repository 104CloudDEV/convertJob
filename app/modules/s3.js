var AWS = require('aws-sdk'),
    https = require('https'),
    fs = require('fs'),
    config = require('../config'),
    dir = './tmp';



module.exports = {
    getFile : function(filePath, callback){
        console.log(filePath)  
        //create /tmp
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir)
        }

        var file = fs.createWriteStream(dir + '/' + filePath.substring(filePath.lastIndexOf('/')+1, filePath.length))
        var options = config.getUserUploadS3()
        options.path = options.path+'/'+filePath

        var req = https.request(options, function(res) {
            console.log("statusCode: ", res.statusCode)
            
            //console.log("headers: ", res.headers)
            //res.on('data', function(d) {
                //file.write(d)
            //})

            // call back need wait file ready
            file.on('finish', function() {
                //console.log('file: ready')
                callback(null, 'sucess')
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