process.title = 'convertJob'

var colors = require('colors'),
    AWS = require('aws-sdk'),
    fs = require('fs'),
    config = require('./config'),
    convertFlow = require('./modules/convertFlow')

var sqsQueueUrl = config.getSQSParameter(),
    sqs

var _this = module.exports = {
    readMessage : function(){
        sqs.receiveMessage(sqsQueueUrl, function(err, data) {
            if(err) {   //Need send email to alert someone
                console.log(colors.red(err))
                return
            }

            // If there are any messages to get
            if (data.Messages) {
                //console.log(data);
                // Get all messages (should be the only one since we said to only get one above)
                for (var msgIndex in data.Messages){
                    // Now this is where you'd do something with this message
                    var msg = data.Messages[msgIndex].Body
                    
                    if(msg==''||msg=='{}'||msg=='[]'){
                        console.log(colors.red("sqs data is null"))
                        //Clean up after yourself... delete this message from the queue, so it's not executed again
                        _this.removeFromQueue(data.Messages[msgIndex].ReceiptHandle);  // We'll do this in a second
                        _this.readMessage()
                        return
                    }else{
                        msg = JSON.parse(msg)
                    }
                    
                    if(msg.filePath && msg.contentType){
                        var mediaType = msg.filePath.substring(msg.filePath.indexOf('.')+1 , msg.filePath.length).toLowerCase()
                        
                        //1: Image。送至 Linux::HighPriorityQueue
                        //2: document   包含 MS Office 與 PDF 格式；Office -> Windows，PDF -> Windows ，詳細流程待確認，目前為 Office -> PDF -> Image。(所有文件轉檔都是由Windows jobs接手處裡)
                        //3: Video  送至 Linux::LowPriorityQueue，Worker 應先取出首 frame、上傳、再對影片內容轉檔。要注意 Task 處理時限，以免被誤認為執行失敗。
                        //4: Audio  Do nothing ?
                        switch (msg.contentType){
                            case 1:
                                if(!msg.convertItems[0].body){
                                    console.log(colors.red("sqs formate no body"))
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
                            case 3:
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
                            case 4:
                                convertFlow.audioFlow(msg.filePath, function(err, result) {
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
                            default:
                                console.log(colors.red("unsupport media Type"))
                                console.log(colors.cyan('wait for queue'))
                                _this.readMessage()    // Recursive ~~~~
                        }
                    }else{
                        console.log(data.Messages)

                        // maybe send something to another queue
                        console.log(colors.red("sqs formate no filePath"))
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

        })
    },

    removeFromQueue : function(ReceiptHandle) {
        //console.log(ReceiptHandle)
        sqs.deleteMessage({
                QueueUrl: sqsQueueUrl.QueueUrl,
                ReceiptHandle: ReceiptHandle, 
            }, function(err, data) {
                if(err) console.log(err, err.stack);    // an error occurred
                //else console.log(data)                  // successful response
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
