const express = require('express')
const app = express()
var WebSocketServer = require('websocket').server;
var http = require('http');
var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets
    // server we don't have to implement anything.
});
server.listen(1337, function() {
    console.log('liste port 1337');
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});
// WebSocket server
wsServer.on('request', function(request) {
    console.log('request');
    var connection = request.accept(null, request.origin);
    app.get('/getRequest', (req, res) => {
        //res.send('HEY!')
        connection.sendUTF(JSON.stringify({
            hallo: 'Server communicates to you'
        }));
        res.send('Successful!');
    });

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        console.log(JSON.stringify(message));
        if (message.type === 'utf8') {
            // process WebSocket message
		var utf8Data = JSON.parse(message.utf8Data);
            connection.sendUTF(JSON.stringify({
	        component: utf8Data.component,
		type: utf8Data.type,
              data: 'Server respond: ' + JSON.stringify(utf8Data .data)
	    }));
        }
	
    });

    connection.on('close', function(connection) {
        // close user connection
        console.log('close');
    });
    connection.sendUTF(JSON.stringify({'component':'websocket','data':'connected'}));
});
/*
var awsIot = require('aws-iot-device-sdk');
var sFireAlertTopic = "fireAlert";
// Config
var device = awsIot.device({
});

device.on('connect', function() {
    console.log('Connected');
    device.subscribe(sFireAlertTopic);
});
// Receiving a message from any topic that this device is subscribed to.
device.on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
    if (topic === sFireAlertTopic) {
        console.log("I should activate Buzzer!");
    }
});
// Error
device.on('error', function(error) {
    console.log('Error: ', error);
});*/

app.use(express.static('dashboard'))
app.listen(3000, () => console.log('Server running on port 3000'))