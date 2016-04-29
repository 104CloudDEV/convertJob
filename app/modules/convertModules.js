var easy = require('easyimage'),
	exec = require('child_process').exec,
	ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static'),
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
	},
	screenshots: function(s3ObjKey, targetArray, callback) {
		var fileFullName = s3ObjKey.substring(s3ObjKey.lastIndexOf('/')+1, s3ObjKey.length) // s3ObjKey = a1c/63a/9f3/fe361b575c904448abd9d60cac97360611.jpg
		    fileName = fileFullName.substring(0, fileFullName.indexOf('.'))
		    keyPrefix = s3ObjKey.substring(0, s3ObjKey.lastIndexOf('/')+1)

		var ffmpegCommand = 'ffmpeg -i '+dir+'/'+fileFullName +' -ss 3 -vframes 1 -an -s 480x320 -y ' + dir+'/'+fileName+'.jpg' 

		console.log('ffmpegCommand: ' + ffmpegCommand);

		exec(ffmpegCommand, function (error, stdout, stderr) {
  			//console.log('stdout: ' + stdout);
  			//console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
				callback(error, null)
			}else{
				console.log(keyPrefix+'/'+fileName + '.jpg');
				s3.upload(dir+'/'+fileName + '.jpg', keyPrefix+fileName + '.jpg', function(err, data){
					if(err) callback(err, null)
					
					callback(null, 'sucess')
					
				})
			}
		})
	},
	videoConvert: function(s3ObjKey, targetArray, callback) {
		//String command = "ffmpeg -y -i " + src + " -strict experimental -c:v libx264 -b:v 800k -r 29.97 -maxrate 800k -c:a aac -ar 44100 -bufsize 2048k -g 15 -movflags faststart -profile:v baseline " + dest ;
		//command = "ffmpeg -y -i " + filePath + " -strict experimental -c:v libx264 -profile:v high -level " + level + " -preset slow -crf 23 -pix_fmt yuv420p -vf scale=trunc(oh*a/2)*2:" + resolution + " -c:a aac -ar 44100 -threads 0 -movflags +faststart " + newFilePathStr;
		var fileFullName = s3ObjKey.substring(s3ObjKey.lastIndexOf('/')+1, s3ObjKey.length), // s3ObjKey = a1c/63a/9f3/fe361b575c904448abd9d60cac97360611.jpg
		    fileName = fileFullName.substring(0, fileFullName.indexOf('.')),
		    keyPrefix = s3ObjKey.substring(0, s3ObjKey.lastIndexOf('/')+1),
		    rotation = '0',
		    level = '3.0',
		    resolution = '480',
		    ffmpegCommand

		ffprobe(dir+'/'+fileFullName, { path: ffprobeStatic.path }, function (err, info) {
			if (err) return done(err);
			//console.log(JSON.stringify(info));
			//console.log(info);

			//String resolution = quality.toLowerCase().replace("p", "");		// 480p => 480
			//String level = resolution.equals("720") ? "3.1" : "3.0";

			if(info.streams[0].tags.rotate){
			  	rotation = info.streams[0].tags.rotate
			}
			//newFilePathStr = filePathStr.substring(0, filePathStr.length() - 4) + "_v1_480p.mp4";
			  
			var newFileName =  fileName+'_v1_'+resolution+'p.mp4'
			switch (rotation) {
				case '90':
					ffmpegCommand = "ffmpeg -y -i " +dir+'/'+fileFullName + " -strict experimental -c:v libx264 -profile:v high -level " + level + " -preset slow -crf 23 -pix_fmt yuv420p -vf \"transpose=1[out];[out]scale=trunc(oh*a/2)*2:" + resolution + "\" -metadata:s:v:0 rotate=0 -c:a aac -ar 44100 -threads 0 -movflags +faststart " + dir + '/' + newFileName
					break;
				case '-90':
				case '270':
					ffmpegCommand = "ffmpeg -y -i " +dir+'/'+fileFullName + " -strict experimental -c:v libx264 -profile:v high -level " + level + " -preset slow -crf 23 -pix_fmt yuv420p -vf \"transpose=2[out];[out]scale=trunc(oh*a/2)*2:" + resolution + "\" -metadata:s:v:0 rotate=0 -c:a aac -ar 44100 -threads 0 -movflags +faststart " + dir + '/' + newFileName
					break;
				default:
					ffmpegCommand = "ffmpeg -y -i "+dir+'/'+fileFullName + " -strict experimental -c:v libx264 -profile:v high -level " + level + " -preset slow -crf 23 -pix_fmt yuv420p -vf \"scale=trunc(oh*a/2)*2:" + resolution + "\" -c:a aac -ar 44100 -threads 0 -movflags +faststart " + dir + '/' + newFileName
			}

			console.log('ffmpegCommand: ' + ffmpegCommand);
			exec(ffmpegCommand, function (error, stdout, stderr) {
	  			//console.log('stdout: ' + stdout);
	  			//console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('exec error: ' + error);
					callback(error, null)
				}else{
					s3.upload(dir+'/'+newFileName, keyPrefix+newFileName, function(err, data){
						if(err) callback(err, null)
						
						callback(null, 'sucess')
						
					})
				}
			})
		})
	},
	audioConvert: function(s3ObjKey, callback) {
		var fileFullName = s3ObjKey.substring(s3ObjKey.lastIndexOf('/')+1, s3ObjKey.length), // s3ObjKey = a1c/63a/9f3/fe361b575c904448abd9d60cac97360611.jpg
		    fileName = fileFullName.substring(0, fileFullName.indexOf('.')),
		    keyPrefix = s3ObjKey.substring(0, s3ObjKey.lastIndexOf('/')+1),
		    newFileName =  fileName+'_v1_128k.m4a',
		    ffmpegCommand		

		ffmpegCommand = "ffmpeg -y -threads 0 -i " +dir+'/'+fileFullName + " -vn -c:a aac -strict experimental -b:a 128k -ar 44100 -movflags faststart " + dir + '/' + newFileName
		
		console.log('ffmpegCommand: ' + ffmpegCommand);
		exec(ffmpegCommand, function (error, stdout, stderr) {
			if (error !== null) {
				console.log('exec error: ' + error);
				callback(error, null)
			}else{
				s3.upload(dir+'/'+newFileName, keyPrefix+newFileName, function(err, data){
					if(err) callback(err, null)
					
					callback(null, 'sucess')
					
				})
			}
		})
	}
}