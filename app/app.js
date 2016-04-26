process.title = 'convertJob'

var colors = require('colors'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    config = require('./config'),
    convertFlow = require('./modules/convertFlow')

var sqsQueueUrl,
    sqs

var _this = module.exports = {
    readMessage : function(){
        sqs.receiveMessage(config.getSQSParameter(), function(err, data) {
            if(!err){
                // If there are any messages to get
                if (data.Messages) {
                    //console.log(data);
                    // Get all messages (should be the only one since we said to only get one above)
                    for (var msgIndex in data.Messages){
                        // Now this is where you'd do something with this message
                        var msg = JSON.parse(data.Messages[msgIndex].Body)
                        console.log(data.Messages)
                        if(msg.filePath){
                            var mediaType = msg.filePath.substring(msg.filePath.indexOf('.')+1 , msg.filePath.length).toLowerCase()
                            switch (mediaType){
                                case 'jpg':
                                case 'png':
                                case 'gif':
                                    if(!msg.convertItems[0].body){
                                        console.log(colors.red("sqs formate error"))
                                        console.log(colors.cyan('wait for queue'))
                                        _this.readMessage()    // Recursive ~~~~
                                    
                                    }else{

                                        convertFlow.imgFlow(msg.filePath, msg.convertItems[0].body.extra.multiAction, function(err, result) {
                                            if(err){  // an error occurred
                                                console.log(err, err.stack)
                                            } else{
                                                console.log(colors.cyan('Job done!'))   // successful response

                                                //Clean up after yourself... delete this message from the queue, so it's not executed again
                                                _this.removeFromQueue(data.Messages[msgIndex].ReceiptHandle);  // We'll do this in a second
                                            }

                                            console.log(colors.cyan('wait for queue'))
                                            _this.readMessage()    // Recursive ~~~~
                                        }) 

                                    }
                                    break
                                case 'avi':
                                case 'wmv':
                                case 'mov':
                                    convertFlow.mediaFlow(msg.filePath, null, function(err, result) {
                                        if(err){  // an error occurred
                                            console.log(err, err.stack)
                                        } else{
                                            console.log(colors.cyan('Job done!'))   // successful response
                                            //Clean up after yourself... delete this message from the queue, so it's not executed again
                                            _this.removeFromQueue(data.Messages[msgIndex].ReceiptHandle);  // We'll do this in a second
                                        }

                                        console.log(colors.cyan('wait for queue'))
                                        _this.readMessage()    // Recursive ~~~~
                                    }) 
                                    break
                                case 'mp3':
                                    convertFlow.audioFlow()
                                    break
                                default:
                                    console.log(colors.red("unsupport media Type"))
                                    console.log(colors.cyan('wait for queue'))
                                    _this.readMessage()    // Recursive ~~~~
                            }
                        }else{
                            // maybe send something to another queue
                            console.log(colors.red("sqs formate error"))
                            console.log(colors.cyan('wait for queue'))
                            _this.readMessage()    // Recursive ~~~~
                        }
                        // Clean up after yourself... delete this message from the queue, so it's not executed again
                        //_this.removeFromQueue(data.Messages[msgIndex].ReceiptHandle);  // We'll do this in a second
                    }

                   
                }else{
                    console.log(colors.cyan('wait for queue'))
                    _this.readMessage(); // If no data, recursive ~
                }
            }else{
                //Need send email to alert someone
                console.log(colors.red(err))
            }
        })
    },

    removeFromQueue : function(ReceiptHandle) {
        //console.log(ReceiptHandle)
        sqs.deleteMessage({
                QueueUrl: config.getSQSParameter().QueueUrl,
                ReceiptHandle: ReceiptHandle, 
            }, function(err, data) {
                if(err) console.log(err, err.stack);    // an error occurred
                else console.log(data)                  // successful response
            })
    }
}

//This is for self test credentials, use EC2 role or local file.
fs.stat(config.getCredentialsPath(), function(err, stat) {
    if(err == null) {
        AWS.config.loadFromPath(config.getCredentialsPath()) // Load credentials from local json file
        sqs = new AWS.SQS()    // Instantiate SQS client  
        console.log(colors.cyan('wait for queue'))
        _this.readMessage()    //Recursive go~
    } else {
        AWS.config.update(config.getRegion())      //sample: {region: 'ap-northeast-1'}
        sqs = new AWS.SQS()                        // Instantiate SQS client
        console.log(colors.cyan('EC2 credentials'))
        _this.readMessage()   //Recursive go~
    }
});
