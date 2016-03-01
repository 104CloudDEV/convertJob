var colors = require('colors'),
	AWS = require('aws-sdk');

var awsCredentialsPath = './aws.credentials.json',
    sqsQueueUrl = 'https://sqs.ap-northeast-1.amazonaws.com/838559313065/104sqsTest',
    sqs;

//AWS.config.loadFromPath(awsCredentialsPath); // Load credentials from local json file
AWS.config.update({region: 'ap-northeast-1'});
sqs = new AWS.SQS(); // Instantiate SQS client

function readMessage() {
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
			    		//console.log(data.Messages[msgIndex]);
			    		var msg = data.Messages[msgIndex].Body
			    		console.log(msg);

			    		// Now this is where you'd do something with this message
			      		//doSomethingCool(body, message);  // whatever you wanna do

			      		// Clean up after yourself... delete this message from the queue, so it's not executed again
			      		removeFromQueue(data.Messages[msgIndex].ReceiptHandle);  // We'll do this in a second
			    	} 
			    	readMessage(); // loop~
			   	}else{
			   		console.log(colors.cyan('wait for queue'));
			   		readMessage(); // If no data, loop ~
			   	}
			}else{
				//Need send email to alert someone
				console.log(colors.red(err));
			}
		});
}

function removeFromQueue(ReceiptHandle) {
	sqs.deleteMessage({
			QueueUrl: sqsQueueUrl,
			ReceiptHandle: ReceiptHandle, 
		}, function(err, data) {
		 	if(err) console.log(err, err.stack); // an error occurred
		 	else console.log(data);           // successful response
		});
}

readMessage();
