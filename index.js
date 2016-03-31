var colors = require('colors'),
    AWS = require('aws-sdk');
    config = require('./config');

var sqsQueueUrl = config.getSQSParameter(),
    testCredentialsParams = {QueueNamePrefix: 'docapi'},
    sqs;

AWS.config.update({region: 'ap-northeast-1'});
sqs = new AWS.SQS(); // Instantiate SQS client

var _this = module.exports = {
    readMessage : function(){
        //console.log(colors.cyan('readMessage'));
        sqs.receiveMessage({
                QueueUrl: sqsQueueUrl,
                MaxNumberOfMessages: 1, // how many messages do we wanna retrieve?
                VisibilityTimeout: 30, // seconds - how long we want a lock on this job
                WaitTimeSeconds: 20 // seconds - how long should we wait for a message?
            }, function(err, data) {
                if(!err){
                    // If there are any messages to get
                    if (data.Messages) {
                        //console.log(data);
                        // Get all messages (should be the only one since we said to only get one above)
                        for (var msgIndex in data.Messages){
                            var msg = data.Messages[msgIndex].Body
                            console.log(msg);

                            // Now this is where you'd do something with this message
                            //doSomethingCool(body, message);  // whatever you wanna do

                            // Clean up after yourself... delete this message from the queue, so it's not executed again
                            //removeFromQueue(data.Messages[msgIndex].ReceiptHandle);  // We'll do this in a second
                        } 
                        _this.readMessage(); // loop~
                    }else{
                        console.log(colors.cyan('wait for queue'));
                        _this.readMessage(); // If no data, loop ~
                    }
                }else{
                    //Need send email to alert someone
                    console.log(colors.red(err));
                }
            });
    },

    removeFromQueue:function(ReceiptHandle) {
        sqs.deleteMessage({
                QueueUrl: sqsQueueUrl,
                ReceiptHandle: ReceiptHandle, 
            }, function(err, data) {
                if(err) console.log(err, err.stack); // an error occurred
                else console.log(data);           // successful response
            });
    }
}

//This is for self test credentials, use EC2 role or local file.
sqs.listQueues(testCredentialsParams, function(err, data) {
    if(err){ 
        console.log(colors.red(err.message)); // an error occurred
        console.log(colors.cyan('Get local credentials' + config.getCredentialsPath()))
        AWS.config.loadFromPath(config.getCredentialsPath()); // Load credentials from local json file
        sqs = new AWS.SQS(); 
        _this.readMessage();
    }else{
        console.log(colors.cyan('EC2 credentials'))
        _this.readMessage();
    }     
});
