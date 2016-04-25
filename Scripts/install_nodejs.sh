#/bin/sh
# Create by Clive

S3Bucket="e104-automation-apn1"
SubPath="codedeploy-src"
Notejs="nodejs_4.4.3.tgz"

### Prepare Envirment

SRCDIR=/resource

if [ ! -d $SRCDIR ];then
	mkdir -p $SRCDIR
fi

cd $SRCDIR

### Install nodejs

DESDIR=/opt/node

if [ ! -d $DESDIR ];then

	mkdir $DESDIR

	aws s3 cp s3://$S3Bucket/$SubPath/servicepkg/nodejs/$Notejs $SRCDIR

	tar -zxpf $Notejs -C $DESDIR

	rm -rf $SRCDIR/*

fi
