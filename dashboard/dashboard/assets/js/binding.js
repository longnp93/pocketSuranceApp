$(document).ready(function() {
    
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    window.webSocketConnectedFlag = false;
    window.webSocketConnection = new WebSocket('ws://ec2-34-218-247-117.us-west-2.compute.amazonaws.com:1337');
    webSocketConnection.onopen = function() {
        // connection is opened and ready to use
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

});
window.appPocketSurance = angular.module('pocketSurance', []);
appPocketSurance.controller('dashboardCtrl', function($scope) {
    $scope.device = {
        Temperature: "50",
        Siren: "ON",
        Flame: 100,
        Smoke: 50
    };
	binding.updateAllDeviceStatus();
	
	$scope.updateDeviceStatus = function(sDevice, sType){
		var scope = angular.element($("#pocketSurancecontent")).scope();
		var newValue = !(scope.device[sDevice] == 'true')
		$.ajax({
			url: "/makeRequestToAWSAPI",
			type: "POST",
			data: {type: "post", host: "8b14v76959.execute-api.us-west-2.amazonaws.com", path:"/prod", body: {type: "boolean", value: newValue, device: "Siren"} },
			success: function(response, status, http) {
				if (response) {
					binding.updateAllDeviceStatus();
					
				}
			}
		});
	};
	
    $scope.confirmation = {
        body: ' There is a potential of fire. Temperature sensor detects abnomal temperature. Please check your home!',
        title: 'Fire Confirmation'
    };

    $scope.requestWebsocket = function(sComponent, sType, sData) {
        if (webSocketConnectedFlag) {
            webSocketConnection.send(JSON.stringify({
                type: sType || 'info',
                component: sComponent,
                msg: sData || 'Client request - ' + Date.now().toString()
            }));
        }
    };
    $scope.confirmNotification = function() {
        binding.createAndShowNotification('info', 'I confirm dialog', 'top', 'right');
        $('#myModal').modal('toggle');
    };
    $scope.disproveNotification = function() {
        binding.createAndShowNotification('info', 'I disprove confirm dialog', 'top', 'right');
        $('#myModal').modal('toggle');
    };

});
// activate collapse right menu when the windows is resized
$(window).resize(function() {

});

binding = {
	updateAllDeviceStatus: function(){
		$.ajax({
        url: "/makeRequestToAWSAPI",
        type: "POST",
        data: {type: "get", url: "https://np8rwrm7k5.execute-api.us-west-2.amazonaws.com/prod"},
        success: function(response, status, http) {
            if (response) {
                var aDeviceList = JSON.parse(response),
                    iLength = aDeviceList.length;
                while (iLength--) {
                    oDevice = aDeviceList[iLength];
                    angular.element($("#pocketSurancecontent")).scope().$apply(function($scope) {
                        $scope.device[oDevice.device] = oDevice.value;
                    });
                }
				binding.createAndShowNotification('success', 'All devices are up-to-date.', 'top', 'right');
            }
        }
    });
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
		if(oData.timestamp){
			sTimestamp = "Date time: " + new Date(oData.timestamp).toLocaleString() + " - ";
		}
        sMsg = sTimestamp + oData.msg + sDetailMsg;
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