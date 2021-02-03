# NodeEchoAll
HTTP (TCP) and UDP echo servers for testing networking tools

## Deploying
 - First, create a docker container with the name `weibellab/nodeechoall`
```docker build -t weibellab/nodeechoall .```
 - Then, launch it by specifying the HTTP and UDP ports
```deployDocker.sh HTTP_PORT UDP_PORT```
 - Profit!


## UDP Interface
The UDP echoes user messages back to the user that sent them. You can use the python3 script `udpecho.py` to test it

```
$ python udpecho.py -c SERVER PORT
udp echo client ready, reading stdin
hello
client received b'hello\n' from ('SERVER', PORT)
```

## HTTP interface
### /myip
Returns your IP as seen by the server

### /logs
Prints the last 40 log messages seen by the server. This url can help you check whether or not your UDP or TCP requests are making it to the server.

### /echo
Echos anything in the request header. For example, let's suppose that your server is running at SERVER:PORT. Using [ncat](https://nmap.org/ncat/), you can get the server to echo the HTTP path back to you

```
$ ncat <SERVER> <PORT>
GET /echo/danilo/tests HTTP/1.1
```
After pressing Enter (`\n`) a couple of times, you get

```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 18
ETag: W/"12-t5XM4EgL+lcVrBgbX3adzICFJ2U"
Date: Wed, 03 Feb 2021 00:04:12 GMT
Connection: keep-alive

/echo/danilo/tests
```
