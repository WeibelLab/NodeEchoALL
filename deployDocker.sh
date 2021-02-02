#!/bin/bash

# This script deploys this system to docker

if [ $# -lt 2 ]; then
  echo -e "Usage: $0 <nodejs http port> <nodejs udp port>"
  echo -e "\t<nodejs http port>: Port where NodeJs should listen"
  echo -e "\t<udp port>: External port that binds to the container's internal port"
  exit 1
fi

if [ "$(whoami)" != "root" ]; then
  echo "For now, you need to run this script as root. Trying using sudo"
  exit 1
fi


APP_HTTP_PORT_INTERNAL=3000
APP_HTTP_PORT_EXTERNAL=$1
APP_UDP_PORT_INTERNAL=3004
APP_UDP_PORT_EXTERNAL=$2


# creates strng for nginx config file
#nginx_config_file="
#server {
#    listen 80;
#
#    server_name $APP_URL;
#
#    location / {
#        proxy_pass http://127.0.0.1:$APP_HTTP_PORT_EXTERNAL;
#        proxy_set_header X-Real-IP \$remote_addr;
#        proxy_set_header Host \$host;
#        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
#         # WebSocket support
#        proxy_http_version 1.1;
#        proxy_set_header Upgrade \$http_upgrade;
#        proxy_set_header Connection \"Upgrade\";
#
#        proxy_connect_timeout 1d;
#        proxy_send_timeout 1d;
#        proxy_read_timeout 1d;
#   }
#}"

#echo "$nginx_config_file" > /etc/nginx/sites-enabled/$APP_URL 

# Restarting nginx
#service nginx restart
#echo "Restarted nginx"

# Remove any instances
docker stop nodeechoall
docker rm nodeechoall

# Launch Docker
docker run -d -t \
--name nodeechoall \
--restart unless-stopped \
-p $APP_HTTP_PORT_EXTERNAL:$APP_HTTP_PORT_INTERNAL \
-p $APP_UDP_PORT_EXTERNAL:$APP_UDP_PORT_INTERNAL\/udp \
"weibellab/nodeechoall"

echo "Launched Docker"

