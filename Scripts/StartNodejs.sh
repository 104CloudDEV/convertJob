#/bin/sh

NoteApp="convertJob/app/app.js"

Node_Base=/opt/node
Node_Root=$Node_Base/root
Node_Log=$Node_Base/logs

PID_FILE="$Node_Log/forever.pid"

cd $Node_Base

if [ -e $PID_FILE ];then

	PATH=$PATH:$Node_Base/bin ; export FOREVER_ROOT=$Node_Log ; $Node_Base/bin/forever stop `cat $PID_FILE`

	sleep 1

fi

while [ ! -e $PID_FILE ]
do

	PATH=$PATH:$Node_Base/bin ; export FOREVER_ROOT=$Node_Log ; $Node_Base/bin/forever start -o $Node_Log/forever.log -e $Node_Log/forever_err.log --pidFile $PID_FILE -a $Node_Root/$NoteApp

	sleep 1
done
