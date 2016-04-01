module.exports = {
	getSQSParameter :  function(){
		var sqsParameter = {
                QueueUrl: 'https://sqs.ap-northeast-1.amazonaws.com/838559313065/docapi-jobs-linux-hi',
                MaxNumberOfMessages: 1,     // how many messages do we wanna retrieve?
                VisibilityTimeout: 30,      // seconds - how long we want a lock on this job
                WaitTimeSeconds: 20         // seconds - how long should we wait for a message?
            }
        return sqsParameter;	
	},
	getCredentialsPath: function(){
		var credentialsPath = './aws.credentials.json';
		return credentialsPath;		
	},
	getRegion: function(){
		var region = {region: 'ap-northeast-1'};
		return region;		
	},
};