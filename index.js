const express = require('express')
const app = express()
var WebSocketServer = require('websocket').server;
const http = require('http');
const https = require('https');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

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
        console.log(JSON.stringify(req.body));
        var optionspost = {
            host: req.body.host,
            method: 'POST',
            path: req.body.path,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        var reqPost = https.request(optionspost, function(res) {
            //console.log("statusCode: ", res.statusCode);
            res.on('data', function(d) {
                oriRes.send(d);
            });
        });
        reqPost.write(JSON.stringify(req.body.body));
        reqPost.end();

    }
});
var WSS = require('ws').Server;
var test = function(ws) {
    app.post('/acquireNotification', function(req, res) {
        var json = JSON.stringify(req.body);
        if (!json) {
            json = JSON.stringify({
                'type': 'success',
                'component': 'websocket',
                'msg': 'I loop notification'
            });
        }
        app.locals.wss.clients.forEach(function each(client) {
            client.send(json);
            console.log('Sent: ' + json);
        });
        console.log('1');
        //console.log('Received: ' + JSON.stringify(json));
    });
};
app.post('/requestWebsocket', (req, oriRes) => {
    app.locals.wss = new WSS({
        port: 1337
    });
    app.locals.wss.on('connection', function(socket) {
        console.log('Opened connection ');
        var broadcast = function(json) { // wss.clients is an array of all connected clients
            if (!json) {
                json = JSON.stringify({
                    'type': 'success',
                    'component': 'websocket',
                    'msg': 'I loop notification'
                });
            }
            wss.clients.forEach(function each(client) {
                client.send(json);
                console.log('Sent: ' + json);
            });
        };

        // Send data back to the client
        /*socket.send(JSON.stringify({
            'type': 'success',
            'component': 'websocket',
            'msg': 'Websocket is connected'
        }));*/

        // When data is received
        socket.on('message', function(message) {
            //var utf8Data = JSON.parse(message.utf8Data);
            /*app.post('/acquireNotification', function(req, res) {
                var json = JSON.stringify(req.body);
                broadcast(json);
                console.log('1');
                //console.log('Received: ' + JSON.stringify(json));
            });
            broadcast(message);*/
            test(app.locals.wss);
        });

        // The connection was closed
        socket.on('close', function() {
            app.locals.wss.clients.forEach(function each(ws) {
                if (ws.isAlive === false) return ws.terminate();
            });
            app.locals.wss.close();

            console.log('Closed Connection ');
        });
        /*app.post('/acquireNotification', function(req, res) {
            var json = JSON.stringify(req.body);
            broadcast(json);
            console.log('2');
            //console.log('Received: ' + JSON.stringify(json));
        });*/
        app.locals.wss.clients.forEach(function each(client) {

            console.log('Client');
        });

        //setInterval(broadcast, 3000);
    });

});
/*app.post('/requestWebsocket', (req, oriRes) => {

    var server = http.createServer(function(request, response) {
        // process HTTP request. Since we're writing just WebSockets
        // server we don't have to implement anything.
    });
    /*server.listen(req.body.port, function() {
        console.log('liste port ' + req.body.port.toString());
    });*/
/*server.listen(1337, function() {
    console.log('liste port 1337');
});
// create the server
var wsServer = new WebSocketServer({
    httpServer: server
});
console.log("create the server")
// WebSocket server
wsServer.on('connection', function(request) {
    console.log('request');
    var connection = request.accept(null, request.origin);

    app.post('/acquireNotification', function(req, res) {
        console.log(JSON.stringify(req.body));
        connection.sendUTF(JSON.stringify(req.body));
        res.send('success');
    });

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        console.log(JSON.stringify(message));
        if (message.type === 'utf8') {
            // process WebSocket message
            var utf8Data = JSON.parse(message.utf8Data);
            connection.sendUTF(JSON.stringify(utf8Data));
        }

    });
    server.close();
    connection.on('close', function() {
        // close user connection
        //console.log(JSON.stringify(server.clients));

        server.close();
        console.log('close');
    });
    connection.sendUTF(JSON.stringify({
        'type': 'success',
        'component': 'websocket',
        'msg': 'Websocket is connected'
    }));
});
oriRes.send('success request new webSocket');

});*/
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