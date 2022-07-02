#!/bin/sh
echo "register scheduler"

(crontab -l 2>/dev/null | sed 's/0\t2/*\t*/' ) | crontab -
