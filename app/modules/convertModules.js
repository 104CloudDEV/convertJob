var easy = require('easyimage'),
    config = require('../config'),
    dir = config.getTempFloderPath()


var _this = module.exports = {
	resizeImg: function(fileFullName, targetArray, index, callback) {
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
						console.log('convert OK : ' + options.dst)
						if (index < targetArray.length - 1){
							_this.resizeImg(fileFullName, targetArray, index + 1, callback)  // Recursive ~~~~
						}else{
							callback()
						}
					}, function (err) {
						console.log(err);
						callback(err);
						return
					}
				)

			},function (err) {
				console.log(err)
				callback(err)
				return
			}
		)
	}
}