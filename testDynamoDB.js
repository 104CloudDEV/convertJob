var colors = require('colors'),
	AWS = require('aws-sdk');

var awsCredentialsPath = './aws.credentials.json';
var dynamodb;

AWS.config.loadFromPath(awsCredentialsPath); // Load credentials from local json file
AWS.config.apiVersions = {
  dynamodb: '2012-08-10',
  // other service API versions
};

dynamodb = new AWS.DynamoDB();

var params = {
    TableName: 'docMata',
    Item: {
        fileId: {'S':'b9b8957c-d31b-11e5-ab30-625662870761'},
        Bucket: {'S':'104doctest'},
        key: {'S':'image/image_scale.jpg'}
    }
};

console.log("Adding a new item...");
dynamodb.putItem(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", err);
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});