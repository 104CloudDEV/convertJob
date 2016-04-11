var colors = require('colors'),
	s3 = require('./s3'),
    convert = require('./convertModules'),
    config = require('../config'),
    fs = require('fs'),
    dir = config.getTempFloderPath()

var _this = module.exports = {
	imgFlow : function(s3ObjKey, convertPrem, callback){
		//console.log(s3ObjKey)  
		s3.getFile(s3ObjKey, function(err, fileFullName){
			if(err) callback(err, null)
			if(fileFullName){
				console.log(colors.cyan('get file done'))
				
				//do convert
				convert.resizeImg(s3ObjKey, convertPrem, 0, function(err, newfileName){
					if(err) callback(err, null)
					
					_this.deleteFolderRecursive(dir, function(err, data){
						callback(null, 'sucess')
					});
				});
			}
		})
	},
	mediaFlow : function(s3ObjKey, convertPrem, callback){
		s3.getFile(s3ObjKey, function(err, fileFullName){
			if(err) callback(err, null)
			if(fileFullName){
				console.log(colors.cyan('get file done'))
				
				//get first frame
				convert.screenshots(s3ObjKey, convertPrem , function(err, newfileName){
					//convert
					console.log(colors.cyan('screenshots done'))
				})

			}
		})
	},
	audioFlow : function(){
	},
	deleteFolderRecursive: function(path, callback){
		if(fs.existsSync(path)) {
    		fs.readdirSync(path).forEach(function(file,index){
      				var curPath = path + "/" + file;
      				if(fs.lstatSync(curPath).isDirectory()) { // recurse
        				_this.deleteFolderRecursive(curPath);
	      			} else { // delete file
	        			fs.unlinkSync(curPath);
	      			}
    			});
    		fs.rmdirSync(path);
  		}
  		callback(null, 'sucess')
	}
}