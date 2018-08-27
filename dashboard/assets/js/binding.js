$(document).ready(function() {
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    window.webSocketConnectedFlag = false;
    window.webSocketConnection = new WebSocket('ws://ec2-34-218-247-117.us-west-2.compute.amazonaws.com:1337');
    webSocketConnection.onopen = function() {
        // connection is opened and ready to use
        /*$.ajax({
            url: "/getRequest",
            type: "GET",
            dataType: "text",
            success: function(response, status, http) {
                if (response) {
                    document.getElementById("notification").innerHTML = document.getElementById("notification").innerHTML + "Receive Response: " + response + "<br>";
                }
            }
        });*/
        //connection.send("Client request");
    };

    webSocketConnection.onerror = function(error) {};
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
            binding.createAndShowNotification('success', json.data, 10000, 'top', 'right');
        }
        if (json.component && json.component === "notification") {
            binding.createAndShowNotification('success', json.data, 10000, 'top', 'right');
        }
        if (json.component && json.component === "confirmation") {
			angular.element($("#pocketSurancecontent")).scope()$root.$apply(function($scope){
				$scope.confirmation = {
					body: 'I change the body of confirmation',
					title: 'Fire Confirmation'
				};
				$('#myModal').appendTo("body").modal('show');
			});
            
        }
    };

});
window.appPocketSurance = angular.module('pocketSurance', []);
appPocketSurance.controller('dashboardCtrl', function($scope) {
    $scope.device = {
        temperatureValue: "50",
        fireSirenValue: "ON",
        flameValue: 100,
        smokeValue: 50
    };
	$scope.confirmation = {
		body: ' There is a potential of fire. Temperature sensor detects abnomal temperature. Please check your home!',
		title: 'Fire Confirmation'
	};
    
    $scope.requestWebsocket = function(sComponent,sType, sData) {
        if (webSocketConnectedFlag) {
            webSocketConnection.send(JSON.stringify({
                type: sType || 'info',
                component: sComponent,
                data: sData || 'Client request - ' + Date.now().toString()
            }));
        }
    };
	$scope.confirmNotification = function() {
        binding.createAndShowNotification('info', 'I confirm dialog', 10000, 'top', 'right');
		$('#myModal').modal('toggle');
    };
    $scope.disproveNotification = function() {
        binding.createAndShowNotification('info', 'I disprove confirm dialog', 10000, 'top', 'right');
		$('#myModal').modal('toggle');
    };

});
// activate collapse right menu when the windows is resized
$(window).resize(function() {

});

binding = {
    createAndShowNotification: function(sType, sMsg, iTimer, sFrom, sAlign) {
        switch (sType) {
            case 'info':
                sIcon = 'ti-info';
                break;
            case 'success':
                sIcon = 'ti-check';
                break;
            case 'warning':
                sIcon = 'ti-alert';
                break;
            case 'error':
                sIcon = 'ti-close';
                break;
            default:
                sIcon = 'ti-info';
        }
        $.notify({
            icon: sIcon,
            message: sMsg
        }, {
            type: sType,
            timer: iTimer || 5000,
            placement: {
                from: sFrom,
                align: sAlign
            }
        });
    }
}