#!/usr/bin/env node
'use strict'

// modules
const dgram = require('dgram');

// logging
var winston = require('winston');
var expressWinston = require('express-winston');
var loglist = [];
const stream = require('stream');
const memoryLogStream = new stream.Writable();
memoryLogStream._write = (chunk, encoding, next) => {
     loglist.push(chunk.toString());
		 loglist = loglist.slice(-40);
     next()
}

const streamTransport = new winston.transports.Stream({ stream: memoryLogStream })

var logger  = winston.createLogger({
    transports: [
      new (winston.transports.Console)({'timestamp':true}),
		  streamTransport]
});

const sanitizeHtml = require('sanitize-html');

const httpPort = process.env.HTTPPORT || 3000
const tcpPort = process.env.TCPPORT || 3002
const udpPort = process.env.UDPPORT || 3004


// utils
var StringBuffer = require("stringbuffer");

// application data
const express    = require('express')
const httpServer = express()
const udpServer  = dgram.createSocket('udp4');

httpServer.use(expressWinston.logger({
      transports: [
        new winston.transports.Console()
      ],
      expressFormat: true
    }));

// http server callbacks
httpServer.use('/echo', (req, res) =>
{
 winston.log("info","[HTTP] Received "+req.method+" /echo request from " + req.ip + " with the following content[40]: " + req.originalUrl.substring(0,40));
 res.send(req.originalUrl);
});

// shows the last information logged by the server
var lastLogOperation = Date.now();
var lastLogString = "";
httpServer.get('/logs', (req, res) =>
{
	// if it has been a second, then we create a new list
	if (Date.now() - lastLogOperation > 1000)
	{
		lastLogOperation = Date.now();
		var sb = new StringBuffer();
		sb.append("<html><head><title>Logs</title></head><body><h3>Logs until");
		sb.append(Date());
		sb.append("</h3><body>");
		for (let i =0; i < loglist.length; ++i)
		{
			sb.append("<li>");
			sb.append(sanitizeHtml(loglist[i]));
			sb.append("</li>");
		}
		sb.append("</body></html>");
		
		lastLogString = sb.toString();
		lastLogOperation = Date.now();
		res.send(lastLogString)
	} else {
		res.send(lastLogString);
	}
});


httpServer.get('/myip', (req, res) =>
{
  res.send("Hello, your IP is "+req.ip);
});

//
// starting all servers
//

httpServer.listen(httpPort, () => {
  winston.log("info","HTTP Server listening on port " + httpPort)
})

