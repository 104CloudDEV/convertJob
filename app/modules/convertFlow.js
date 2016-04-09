var s3 = require('./s3'),
	colors = require('colors')

module.exports = {
	imgFlow : function(filePath, convertPrem, callback){
		console.log(filePath)  
		console.log(convertPrem.toString())

		s3.getFile(filePath, function(err, data){
			if(err) callback(err, null)
			if(data=='sucess'){
				console.log(colors.cyan('get file done'))
				//do convert


				callback(null, 'sucess')
			}
		})
	},
	mediaFlow : function(){
	},
	audioFlow : function(){
	}
}