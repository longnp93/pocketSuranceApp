const express = require('express')
const app = express()
var WebSocketServer = require('websocket').server;
const http = require('http');
const fs = require("fs");
const https = require('https');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies
var bIsPubSubRegister = false;
var awsIot = require('aws-iot-device-sdk');
// Config
var device = awsIot.device({
    keyPath: '155c4b35b5-private.pem.key',
    certPath: '155c4b35b5-certificate.pem.crt',
    caPath: 'root-ca.crt',
    clientId: 'app',
    accessKeyId: 'AKIAIKNQ5G5GILWKYU2A',
    secretKey: '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',
    host: 'a2l64fyd9kpfof.iot.us-west-2.amazonaws.com'
});
// Connect
//var name = "Temperature";
device.on('connect', function() {
    console.log('AWS IoT Connected');
    device.subscribe("fireData");
    //device.subscribe("realFireAlert");
    device.subscribe("notification");
    device.subscribe("confirmation");
});
// Receiving a message from any topic that this device is subscribed to.


var registerPubSubAWS = function() {
    if (!bIsPubSubRegister) {
        device.on('message', function(topic, payload) {
            app.locals.wss.clients.forEach(function each(client) {
                client.send(payload.toString());
                console.log('Sent: ' + payload.toString());
            });
        });
        // Error
        device.on('error', function(error) {
            console.log('Error: ', error);
        });
        app.post('/camera', function(req, res) {
            var data = [];
	    console.log(JSON.stringify(req.data))
            req.on('data', function(chunk) {
                data.push(chunk);
            }).on('end', function() {
                //at this point data is an array of Buffers
                //so Buffer.concat() can make us a new Buffer
                //of all of them together
                var buffer = Buffer.concat(data);
		/*fs.writeFile("camera_images/out.png", buffer , "binary", function(err) {
  			console.log(err); // writes out file without error, but it's not a valid image
		});*/
                app.locals.wss.clients.forEach(function each(client) {
                    client.send(buffer.toString('base64'));
                });
                res.send('success');
            });
        });
        bIsPubSubRegister = true;
        console.log('Register pub/ sub AWS IOT');
    }
};
var WSS = require('ws').Server;
var registerAPI = function() {
    app.post('/acquireNotification', function(req, res) {
        var json = JSON.stringify(req.body);
        if (json) {
            app.locals.wss.clients.forEach(function each(client) {
                client.send(json);
                console.log('Sent: ' + json);
            });
        }
        res.send('success');
    });

};
app.post('/requestWebsocket', (req, oriRes) => {
    app.locals.wss = new WSS({
        port: 1337
    });
    app.locals.wss.on('connection', function(socket) {
        console.log('Opened websocket connection ');

        // When data is received
        socket.on('message', function(message) {
            app.locals.wss.clients.forEach(function each(client) {
                client.send(message);
                console.log('Sent: ' + message);
            });
            registerPubSubAWS();
            //registerAPI();
        });

        // The connection was closed
        socket.on('close', function() {
            app.locals.wss.clients.forEach(function each(ws) {
                if (ws.isAlive === false) return ws.terminate();
            });
            app.locals.wss.close();

            console.log('Closed Connection ');
        });
    });
    oriRes.send('success');
});
app.post('/makeRequestToAWSAPI', (req, oriRes) => {
    if (req.body.type === "get") {
        https.get(req.body.url, (res) => {
            //console.log('statusCode:', res.statusCode);
            //console.log('headers:', res.headers);
            res.on('data', (d) => {
                //process.stdout.write(d);
                oriRes.send(d);
            });

        }).on('error', (e) => {
            console.error(e);
        });
    } else {
        var optionspost = {
            host: req.body.host,
            method: 'POST',
            path: req.body.path,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        var reqPost = https.request(optionspost, function(res) {
            console.log("statusCode: ", res.statusCode);
            res.on('data', function(d) {
                oriRes.send(d);
            });
        });
        reqPost.write(req.body.body);
        reqPost.end();

    }
});
app.use(express.static('dashboard'))
app.listen(3000, () => console.log('Server running on port 3000'))