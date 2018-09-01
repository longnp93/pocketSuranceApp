var awsIot = require('aws-iot-device-sdk');
// Config
var device = awsIot.device({
   keyPath: '155c4b35b5-private.pem.key',
  certPath: '155c4b35b5-certificate.pem.crt',
    caPath: 'root-ca.crt',
	clientId: '123',
	accessKeyId:'AKIAIKNQ5G5GILWKYU2A',
	secretKey: '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',
      host: 'a2l64fyd9kpfof.iot.us-west-2.amazonaws.com'
});//982bfe03693622bf2c938592afe20204c604624033903122ff0735bbc0cfc55c
// Connect
var name = "Temperature";
device
  .on('connect', function() {
    console.log('Connected');
    /*device.subscribe("topic1");
	device.publish("topic1", JSON.stringify({
	  message: 'hello1'
	}))*/
	device.subscribe('$aws/things/' + name + '/shadow/update/delta');
	device.subscribe('$aws/things/' + name + '/shadow/update');
	device.subscribe('$aws/things/' + name + '/shadow/update/accepted');
	device.subscribe('$aws/things/' + name + '/shadow/update/documents');
	device.subscribe('$aws/things/' + name + '/shadow/update/rejected');
	});
// Receiving a message from any topic that this device is subscribed to.
device.on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });
// Error
device.on('error', function(error) {
    console.log('Error: ', error);
  });
/*
var aws = require('aws-sdk');
var lambda = new aws.Lambda({
  region: 'us-west-2' //change to your region
});

lambda.invoke({
  FunctionName: 'name_of_your_lambda_function',
  Payload: JSON.stringify(event, null, 2) // pass params
}, function(error, data) {
  if (error) {
    context.done('error', error);
  }
  if(data.Payload){
   context.succeed(data.Payload)
  }
});
var http = require('http');

exports.handler = function(event, context) {
  console.log('start request to ' + event.url)
  http.get(event.url, function(res) {
    console.log("Got response: " + res.statusCode);
    context.succeed();
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
    context.done(null, 'FAILURE');
  });

  console.log('end request to ' + event.url);
}

var jsonObject = JSON.stringify(event);

    // the post options
    var optionspost = {
        host: 'the_host',
        path: '/the_path',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };

    var reqPost = https.request(optionspost, function(res) {
        console.log("statusCode: ", res.statusCode);
        res.on('data', function (chunk) {
            body += chunk;
        });
        context.succeed('Blah');
    });

    reqPost.write(jsonObject);
    reqPost.end();
*/