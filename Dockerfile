FROM node:8
# using node v8 base container

# app directory in the container
WORKDIR /usr/src/app

# install app dependencies
COPY package*.json ./
RUN npm install
# RUN npm install -g forever

# copies all the files from this folder
COPY . .

# exposes http port
EXPOSE 3000

# exposes tcp port
EXPOSE 3002

# exposes udp port
EXPOSE 3004

# starts node js 
CMD ["npm", "start"]
