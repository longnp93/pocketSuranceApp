$.ajax({
    url: "/requestWebsocket",
    type: "POST",
    data: {
        port: 1337
    },
    success: function(response, status, http) {
        console.log('success');
    }
});
$(document).ready(function() {
    // Open a connection
    window.socket = new WebSocket('ws://ec2-34-218-247-117.us-west-2.compute.amazonaws.com:1337');

    // When a connection is made
    socket.onopen = function() {
        /*console.log('Opened connection ');

        // send data to the server
        var json = JSON.stringify({ message: 'Hello ' });
        socket.send(json);*/
        socket.send(JSON.stringify({
            'type': 'success',
            'component': 'websocket',
            'msg': 'Websocket is connected'
        }));
    }
	
	$('#myModal').on('hidden.bs.modal', function () {
		// do something…
		document.getElementById("camera_image_confirmation").style.display = "none";
	});
	
	$('#theftModal').on('hidden.bs.modal', function () {
		// do something…
		document.getElementById("theft_camera_image_confirmation").style.display = "none";
	});

    // When data is received
    socket.onmessage = function(message) {
        var sDeviceName, value, oDevice, iLength, json;
		try {
            json = JSON.parse(message.data);
        } catch (e) {
			if(window.test && window.test.match(/ire/g)){
				document.getElementById("camera_image_confirmation").style.display = "initial";
				document.getElementById("camera_image_confirmation").src = 'data:image/jpeg;base64,'+message.data;
				window.test =''
			} else if (window.test && window.test === 'Theft'){
				document.getElementById("theft_camera_image_confirmation").style.display = "initial";
				document.getElementById("theft_camera_image_confirmation").src = 'data:image/jpeg;base64,'+message.data;
				$('#theftModal').appendTo("body").modal('show');
				window.test =''
			}
            //console.log('This doesn\'t look like a valid JSON: ',
            //    message.data);
            return;
        }
        // handle incoming message
        //document.getElementById("websocketMsg").innerHTML = document.getElementById("websocketMsg").innerHTML + "<br>" + message.data;

        if (json.component && json.component === "websocket") {
            webSocketConnectedFlag = true;
            binding.createAndShowNotification(json.type || 'info', binding.handleMsg(json), 'top', 'right');
        }
        if (json.component && json.component === "devices") {
            binding.showDeviceStatus(json.devices);
        }
        if (json.component && json.component === "device") {
            sDeviceName = json.device;
            angular.element($("#pocketSurancecontent")).scope().$apply(function($scope) {
                $scope.device[sDeviceName] = json.value;
            });
        }
        if (json.component && json.component === "notification") {
			window.test = json.category;
            binding.createAndShowNotification(json.type || 'info', binding.handleMsg(json), 'top', 'right');
        }
        if (json.component && json.component === "confirmation") {
            document.getElementById("confirmationTitle").innerText = "Fire Confirmation" || "Confirmation";
            document.getElementById("confirmationBody").innerText = binding.handleMsg(json) || "Confirmation";
            binding.handleModalColor(json.type);
            $('#myModal').appendTo("body").modal('show');
        }
    }

    // A connection could not be made
    socket.onerror = function(event) {
        console.log(event);
    }

    // A connection was closed
    socket.onclose = function(code, reason) {
        socket.close();
        console.log(code, reason);
    }

    // Close the connection when the window is closed
    window.addEventListener('beforeunload', function() {
        socket.close();
    });
    /*    var iPort = window.location.pathname === "/notifications.html" ? 1338 : 1337
        window.WebSocket = window.WebSocket || window.MozWebSocket;
        window.webSocketConnectedFlag = false;
        //window.webSocketConnection = new WebSocket('ws://ec2-34-218-247-117.us-west-2.compute.amazonaws.com:'+ iPort.toString());
        window.webSocketConnection = new WebSocket('ws://ec2-34-218-247-117.us-west-2.compute.amazonaws.com:1337');
    	webSocketConnection.onopen = function() {
            // connection is opened and ready to use
            //connection.send("Client request");
        };
    	webSocketConnection.onclose  = function() {
            // connection is opened and ready to use
            //connection.send("Client request");
    		console.log("close connection");
        };

        webSocketConnection.onerror = function(error) {};
    	window.addEventListener('beforeunload', function() {
    		window.webSocketConnection.close();
    	});
        webSocketConnection.onmessage = function(message) {
            try {
                var json = JSON.parse(message.data);
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ',
                    message.data);
                return;
            }
            // handle incoming message
            //document.getElementById("websocketMsg").innerHTML = document.getElementById("websocketMsg").innerHTML + "<br>" + message.data;

            if (json.component && json.component === "websocket") {
                webSocketConnectedFlag = true;
                binding.createAndShowNotification(json.type || 'info', binding.handleMsg(json), 'top', 'right');
            }
            if (json.component && json.component === "device") {
                var sDeviceName = json.device;
                angular.element($("#pocketSurancecontent")).scope().$apply(function($scope) {
                    $scope.device[sDeviceName] = json.value;
                });
            }
            if (json.component && json.component === "notification") {
                binding.createAndShowNotification(json.type || 'info', binding.handleMsg(json), 'top', 'right');
            }
            if (json.component && json.component === "confirmation") {
                document.getElementById("confirmationTitle").innerText = json.category + " Confirmation" || "Confirmation";
                document.getElementById("confirmationBody").innerText = binding.handleMsg(json) || "Confirmation";
                binding.handleModalColor(json.type);
                $('#myModal').appendTo("body").modal('show');
            }
        };
    */
});
window.appPocketSurance = angular.module('pocketSurance', []);
appPocketSurance.controller('dashboardCtrl', function($scope) {
    $scope.device = {
        Temperature: 50,
        Siren: "ON",
        Flame: "NONE",
        Smoke: 50,
        Door: "ON",
        Motion: "NONE",
        SecurityAlert: "OFF"
    };
    $scope.notificationCount = 0;
    $scope.notifications = [];
    $scope.confirmations = [];
    /*[{
    	msg: "hi",
    	type: "danger"
    },{
    	msg: "hi1",
    	type: "warning"
    }];*/
    binding.updateAllDeviceStatus();
    binding.getAlerts();
    $scope.updateDeviceStatus = function(sDevice, value) {
        var scope = angular.element($("#pocketSurancecontent")).scope(),
            newValue;
        if (value) {
            newValue = value;
        } else {
            newValue = scope.device[sDevice] == 'ON' ? 0 : 1;
        }

        var sBody = {
            type: "boolean",
            value: newValue,
            device: sDevice
        };
        $.ajax({
            url: "/makeRequestToAWSAPI",
            type: "POST",
            data: {
                type: "post",
                host: "8b14v76959.execute-api.us-west-2.amazonaws.com",
                path: "/prod",
                body: JSON.stringify(sBody)
            },
            success: function(response, status, http) {
                if (response) {
                    binding.updateAllDeviceStatus();
                }
            }
        });

        if (sDevice === 'SecurityAlert' && newValue === 0) {
            $.ajax({
                url: "/makeRequestToAWSAPI",
                type: "POST",
                data: {
                    type: "post",
                    host: "8b14v76959.execute-api.us-west-2.amazonaws.com",
                    path: "/prod",
                    body: JSON.stringify({
                        type: "boolean",
                        value: 0,
                        device: 'Siren'
                    })
                },
                success: function(response, status, http) {
                    if (response) {
                        binding.updateAllDeviceStatus();
                    }
                }
            });
        }
    };

    $scope.confirmation = {
        body: ' There is a potential of fire. Temperature sensor detects abnomal temperature. Please check your home!',
        title: 'Fire Confirmation'
    };

    $scope.requestWebsocket = function(sComponent, sType, sData) {
        if (webSocketConnectedFlag) {
            socket.send(JSON.stringify({
                type: sType || 'info',
                component: sComponent,
                msg: sData || 'Client request - ' + Date.now().toString()
            }));
        }
    };
    $scope.confirmNotification = function() {
        //binding.createAndShowNotification('info', 'I confirm dialog', 'top', 'right');
        //angular.element($("#pocketSurancecontent")).scope().$apply(function($scope) {
        //		$scope.updateDeviceStatus('Siren', 1);
        //});
        var scope = angular.element($("#pocketSurancecontent")).scope();
        scope.updateDeviceStatus('Siren', 1);
        $('#myModal').modal('toggle');
    };
    $scope.disproveNotification = function() {
        binding.createAndShowNotification('info', 'I disprove confirm dialog', 'top', 'right');
        $('#myModal').modal('toggle');
    };
	$scope.updateAllDeviceStatus = function() {
		binding.updateAllDeviceStatus();
	};

});
// activate collapse right menu when the windows is resized
$(window).resize(function() {

});

binding = {
    updateAllDeviceStatus: function() {
        $.ajax({
            url: "/makeRequestToAWSAPI",
            type: "POST",
            data: {
                "type": "get",
                "url": "https://np8rwrm7k5.execute-api.us-west-2.amazonaws.com/prod"
            },
            success: function(response, status, http) {
                if (response) {
                    binding.showDeviceStatus(JSON.parse(response));
                    binding.createAndShowNotification('success', 'All devices are up-to-date.', 'top', 'right');
                }
            }
        });
    },
    getAlerts: function() {
        $.ajax({
            url: "/makeRequestToAWSAPI",
            type: "POST",
            data: {
                "type": "get",
                "url": "https://ue60qoxdu8.execute-api.us-west-2.amazonaws.com/prod"
            },
            success: function(response, status, http) {
                if (response) {
                    var oResponse = JSON.parse(response),
                        oItem, aConfirmation = [],
                        aNotification = [];
                    var iLength = oResponse.Count;
                    while (iLength--) {
                        oItem = oResponse.Items[iLength];
                        if (oItem.component && oItem.component === "confirmation") {
                            aConfirmation.push(oItem);
                        } else {
                            aNotification.push(oItem);
                        }
                    }
                    angular.element($("#pocketSurancecontent")).scope().$apply(function($scope) {
                        $scope.notifications = aNotification;
                        $scope.confirmations = aConfirmation;
                        $scope.notificationCount = aNotification.length;
                    });
                }
            }
        });
    },
    showDeviceStatus: function(aDevices) {
        var iLength = aDevices.length,
            oDevice, sDeviceName, value;
        while (iLength--) {
            oDevice = aDevices[iLength];
            sDeviceName = oDevice.device;
            switch (sDeviceName) {
                case 'Siren':
                    value = oDevice.value ? 'ON' : 'OFF';
                    break;
                case 'Door':
                    value = oDevice.value ? 'OPEN' : 'CLOSE';
                    break;
                case 'Flame':
                    value = oDevice.value ? 'DETECTED' : 'NONE';
                    break;
                case 'Motion':
                    value = oDevice.value ? 'DETECTED' : 'NONE';
                    break;
                case 'SecurityAlert':
                    value = oDevice.value ? 'ON' : 'OFF';
                    break;
                default:
                    value = oDevice.value
                    break;
            }

            angular.element($("#pocketSurancecontent")).scope().$apply(function($scope) {
                $scope.device[sDeviceName] = value;
            });
        }
    },
    createAndShowNotification: function(sType, sMsg, sFrom, sAlign) {
        var iTimer = 5000;
        switch (sType) {
            case 'info':
                sIcon = 'ti-info';
                break;
            case 'success':
                sIcon = 'ti-check';
                break;
            case 'warning':
                sIcon = 'ti-alert';
                iTimer = 20000;
                break;
            case 'danger':
                sIcon = 'ti-hand-stop';
                iTimer = 99999999;
                break;
            default:
                sIcon = 'ti-info';
        }
        $.notify({
            icon: sIcon,
            message: sMsg
        }, {
            type: sType,
            timer: iTimer,
            placement: {
                from: sFrom,
                align: sAlign
            }
        });
    },
    handleMsg: function(oData) {
        var sDetailMsg = '',
            sMsg = '',
            sTimestamp = '';
        if (oData.data) {
            sDetailMsg = " - Detail: " + JSON.stringify(oData.data);
        }
        if (oData.timestamp) {
            sTimestamp = new Date(oData.timestamp).toLocaleString() + " - ";
        }
        sMsg = sTimestamp + oData.msg; // + sDetailMsg;
        return sMsg;
    },
    handleModalColor: function(sType) {
        var modalHeader = document.getElementsByClassName("modal-header")[0],
            sClassName = '';
        if (modalHeader) {
            switch (sType) {
                case 'info':
                    sClassName = 'modal-header-info';
                    break;
                case 'success':
                    sClassName = 'modal-header-success';
                    break;
                case 'warning':
                    sClassName = 'modal-header-warning';
                    break;
                case 'danger':
                    sClassName = 'modal-header-danger';
                    break;
                default:
                    sClassName = 'modal-header-primary';
            }
            if (modalHeader.classList.length === 1) {
                modalHeader.classList.add(sClassName);
            } else {
                modalHeader.classList.remove(modalHeader.classList[1]);
                modalHeader.classList.add(sClassName);
            }
        }
    }
}