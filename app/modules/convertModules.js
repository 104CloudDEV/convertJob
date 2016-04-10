var easy = require('easyimage'),
    config = require('../config'),
    s3 = require('./s3'),
    dir = config.getTempFloderPath()


var _this = module.exports = {
	resizeImg: function(s3ObjKey, targetArray, index, callback) {
		var fileFullName = s3ObjKey.substring(s3ObjKey.lastIndexOf('/')+1, s3ObjKey.length) // s3ObjKey = a1c/63a/9f3/fe361b575c904448abd9d60cac97360611.jpg

		easy.info(dir+'/'+fileFullName).then(
			function (imginfo) {
				//console.log(imginfo)
				var fileName = fileFullName.substring(0, fileFullName.indexOf('.'))
				    fileNameExt = fileFullName.substring(fileFullName.indexOf('.')+1, fileFullName.length)

				var options = {
					src: dir+'/'+fileFullName,
					dst: dir+'/'+fileName+'_'+targetArray[index].tag+'.'+fileNameExt,
					width: targetArray[index].width,
					height: imginfo.height / imginfo.width * targetArray[index].width
				}

				easy.resize(options).then(
					function (file) {
						//console.log('convert OK : ' + JSON.stringify(file))
						console.log('Convert done! \tnew file:' + file.name)
						var keyPrefix = s3ObjKey.substring(0, s3ObjKey.lastIndexOf('/')+1) 
						
						s3.upload(file.path, keyPrefix+file.name, function(err, data){
							if(err) callback(err, null)

							//console.log(data);
							if (index < targetArray.length - 1){
							
								_this.resizeImg(s3ObjKey, targetArray, index + 1, callback)  // Recursive ~~~~
							
							}else{
								callback(null, 'sucess')
							}
						})

						
					}, function (err) {
						console.log(err)
						callback(err, null)
					}
				)
			},function (err) {
				console.log(err)
				callback(err, null)
			}
		)
	}
}