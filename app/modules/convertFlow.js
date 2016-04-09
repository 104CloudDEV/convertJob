var colors = require('colors'),
	s3 = require('./s3'),
    convert = require('./convertModules'),
    config = require('../config'),
    dir = config.getTempFloderPath()

module.exports = {
	imgFlow : function(s3ObjKey, convertPrem, callback){
		//console.log(s3ObjKey)  
		s3.getFile(s3ObjKey, function(err, fileFullName){
			if(err) callback(err, null)
			if(fileFullName){
				console.log(colors.cyan('get file done'))
				//do convert
				convert.resizeImg(fileFullName, convertPrem, 0, function(err, newfileName){
					console.log(colors.cyan('convert OK'))
					callback(null, 'sucess')
				});
			}
		})
	},
	mediaFlow : function(){
	},
	audioFlow : function(){
	}
}