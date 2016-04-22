#!/bin/bash
case "$1" in
	-h|--help)
         echo "No help Document :P"       
         exit 0
         ;;
	start)
		if [ -f "./app/stop" ]
		then
		rm ./app/stop
		fi

		if [ -f "./app/running" ]
		then
			echo "The job is running"
		else
			/opt/node/bin/node ./app/app.js
			echo "The job start"
		fi
		;;
	stop)
		if [ -f "./app/stop" ]
		then
			echo "The job will stop when job done"
		else
			touch ./app/stop
			echo "The job will stop when job done"
		fi
esac