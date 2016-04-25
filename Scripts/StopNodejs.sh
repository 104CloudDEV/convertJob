#/bin/sh

Node_Base=/opt/node
Node_Root=$Node_Base/root
Node_Log=$Node_Base/logs

PID_FILE="$Node_Log/forever.pid"

cd $Node_Base

if [ -e $PID_FILE ];then

	export PATH=$PATH:$Node_Base/bin:/opt/ffmpeg/bin ; export FOREVER_ROOT=$Node_Log ; $Node_Base/bin/forever stop `cat $PID_FILE`

fi
