#/bin/sh

NoteApp="convertJob/app/app.js"

Node_Base=/opt/node
Node_Root=$Node_Base/root
Node_Log=$Node_Base/logs

PID_FILE="$Node_Log/forever.pid"

REGION="ap-northeast-1"

ID=`curl http://169.254.169.254/latest/meta-data/instance-id`
AutoScalingGroup=`aws autoscaling --region ap-northeast-1 describe-auto-scaling-instances --instance-ids $ID | grep AutoScalingGroupName | awk -F "\"" '{print $4}'`

cd $Node_Base

if [ -e $PID_FILE ];then

	export PATH=$PATH:$Node_Base/bin:/opt/ffmpeg/bin ; export FOREVER_ROOT=$Node_Log ; $Node_Base/bin/forever stop `cat $PID_FILE`

	sleep 1

fi

while [ ! -e $PID_FILE ]
do

	export PATH=$PATH:$Node_Base/bin:/opt/ffmpeg/bin ; export FOREVER_ROOT=$Node_Log ; export AutoScalingGroup=$AutoScalingGroup ; $Node_Base/bin/forever start -o $Node_Log/forever.log -e $Node_Log/forever_err.log --pidFile $PID_FILE -a $Node_Root/$NoteApp

	sleep 1
done
