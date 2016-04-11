module.exports = {
	getSQSParameter :  function(){
		var sqsParameter = {
                //QueueUrl: 'https://sqs.ap-northeast-1.amazonaws.com/838559313065/docapi-jobs-linux-hi',
                QueueUrl: 'https://sqs.ap-northeast-1.amazonaws.com/838559313065/docapi-jobs-linux-low',
                MaxNumberOfMessages: 1,     // how many messages do we wanna retrieve?
                VisibilityTimeout: 30,      // seconds - how long we want a lock on this job
                WaitTimeSeconds: 20         // seconds - how long should we wait for a message?
            }
        return sqsParameter	
	},
	getCredentialsPath: function(){
		var credentialsPath = './aws.credentials.json'
		return credentialsPath		
	},
	getRegion: function(){
		var region = {region: 'ap-northeast-1'}
		return region;		
	},
	getUserUploadS3: function(){
		var options = {
		  hostname  : 's3-ap-northeast-1.amazonaws.com',
		  port      : 443,
		  path      : '/e104-doc-api-file-store',
		  method    : 'GET'
		}
		return options
	},
	getTempFloderPath: function(){
		var path = './tmp'
		return path
	},
	getConvertedS3bucket: function(){
		var bucket = 'e104-doc-api-file-store-converted'
		return bucket
	}
};