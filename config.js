module.exports = {
	getSQSParameter : function(){
		var sqsQueueUrl = 'https://sqs.ap-northeast-1.amazonaws.com/838559313065/docapi-jobs-linux-hi';
		return sqsQueueUrl;		
	},
	getCredentialsPath: function(){
		var credentialsPath = './aws.credentials.json';
		return credentialsPath;		
	},
};