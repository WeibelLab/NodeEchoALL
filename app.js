#!/usr/bin/env node
'use strict'

// modules
const dgram = require('dgram');

// logging
var winston =  require('winston');
const myFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

var expressWinston = require('express-winston');
var loglist = [];
const stream = require('stream');
const memoryLogStream = new stream.Writable();
memoryLogStream._write = (chunk, encoding, next) => {
     loglist.push(chunk.toString());
		 loglist = loglist.slice(-40);
     next()
}

const streamTransport = new winston.transports.Stream({ 'stream': memoryLogStream, 'timestamp':true, 'json':false })

var logger  = winston.createLogger(
{
	  format: winston.format.combine(
		
    winston.format.timestamp(),
    myFormat
    ),
    transports: [
      new (winston.transports.Console)({'timestamp':true}),
		  streamTransport]
});

const sanitizeHtml = require('sanitize-html');

const httpPort = process.env.HTTPPORT || 3000  // HTTP is TCP you fool ;)
const udpPort = process.env.UDPPORT || 3004


// utils
var StringBuffer = require("stringbuffer");

// application data
const express    = require('express')
const httpServer = express()
const udpServer  = dgram.createSocket('udp4');
httpServer.set('trust proxy', true);
httpServer.use((req, res, next) =>
{
 logger.info("[HTTP] Received "+req.method+" "+req.originalUrl+" from " + req.connection.remoteAddress);
 next();
});

// http server callbacks
httpServer.use('/echo', (req, res) =>
{
 logger.info("[HTTP] Received "+req.method+" /echo request from " + req.ip + " with the following content[40]: " + req.originalUrl.substring(0,40));
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
		sb.append("<html><head><title>Logs</title></head><body><h3>Logs generated at ");
		sb.append(Date());
		sb.append("</h3><body>");
		for (let i =loglist.length-1; i >=0; --i)
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

httpServer.use((req, res) =>
{
  res.send(";]");
});

//
// ================================================== UDP ==================================================================
//



udpServer.on('error', (err) => {
	logger.error("UDP 'server' could not start " + err);
  udpServer.close();
});

udpServer.on('message', (msg, rinfo) => {
	logger.info(`UDP ${udpPort} got: ${msg} from ${rinfo.address}:${rinfo.port}`)
  udpServer.send(msg, rinfo.port, rinfo.address);
});

udpServer.on('listening', () => {
  const address = udpServer.address();
  logger.info(`UDP listening at ${address.port}`);
});



//
// ================================================== STARTING EVERYTHING ==================================================================
//


udpServer.bind(udpPort);

httpServer.listen(httpPort, () => {
  logger.info("HTTP Server listening on port " + httpPort)
})

