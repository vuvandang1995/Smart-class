function share_connect(){
    var checkbox = document.querySelector('input[name=broadcaster]');

    function beforeJoiningARoom(callback) {

        if (checkbox.checked === false) {
            connection.extra.broadcaster = false;
            connection.dontCaptureUserMedia = true;
//            connection.session.oneway = true;
        } else {
            connection.extra.broadcaster = true;
        }
        callback();
    }

    document.getElementById('share-screen').onclick = function() {
        connection.addStream({
            screen: true,
//            oneway:true
        });

    };

    document.getElementById('open-room').onclick = function() {
        beforeJoiningARoom(function() {
            connection.openOrJoin(document.getElementById('room-id').value, function(isRoomExist, roomid) {
                afterConnectingSocket();
            });
        });
    };

    document.getElementById('join-room').onclick = function() {
        joinBroadcastLooper(document.getElementById('room-id').value);
    };

    var connection = new RTCMultiConnection();

    connection.getScreenConstraints = function(callback) {
        getScreenConstraints(function(error, screen_constraints) {
            if (!error) {
                screen_constraints = connection.modifyScreenConstraints(screen_constraints);
                callback(error, screen_constraints);
                return;
            }
            throw error;
        });
    };

    connection.socketURL = "https://192.168.100.23:9443/";
    connection.socketMessageEvent = 'audio-video-screen-demo';
    connection.session = {
        audio: true,
        broadcast: true
    };
    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };
    connection.mediaConstraints.video = false;
    connection.videosContainer = document.getElementById('videos-container');
    connection.onstream = function(event) {
        if(document.getElementById(event.streamid)) {
            var existing = document.getElementById(event.streamid);
            existing.parentNode.removeChild(existing);
            if(!connection.extra.broadcaster){
                $("#open-room").click();
                return false;
            }
        }

        var width = parseInt(connection.videosContainer.clientWidth / 2) - 20;

        if(event.stream.isScreen === true) {
            width = connection.videosContainer.clientWidth - 20;
        }

        var mediaElement = getMediaElement(event.mediaElement, {
            title: event.userid,
            buttons: ['full-screen'],
            width: width,
            showOnMouseEnter: false
        });
        connection.videosContainer.appendChild(mediaElement);
        setTimeout(function() {
            mediaElement.media.play();
        }, 5000);

        mediaElement.id = event.streamid;
        if (event.type === 'remote' && connection.isInitiator) {
            var participants = [];
            connection.getAllParticipants().forEach(function(pid) {
                participants.push({
                    pid: pid,
                    broadcaster: connection.peers[pid].extra.broadcaster === true
                });
            });
            connection.socket.emit(connection.socketCustomEvent, {
                participants: participants
            });
        } else if (event.type === 'remote' && checkbox.checked === false) {
            connection.socket.emit(connection.socketCustomEvent, {
                giveAllParticipants: true
            });
        }
    };
    function afterConnectingSocket() {
        connection.socket.on(connection.socketCustomEvent, function(message) {
            if (message.participants && !connection.isInitiator) {
                message.participants.forEach(function(participant) {
                    if (participant.pid === connection.userid) return;
                    if (connection.getAllParticipants().indexOf(participant.pid) !== -1) return;
                    if (checkbox.checked === true && participant.broadcaster === false) return;
                    connection.join(participant.pid);
                });
            }
            if (message.giveAllParticipants && connection.isInitiator) {
                var participants = [];
                connection.getAllParticipants().forEach(function(pid) {
                    participants.push({
                        pid: pid,
                        broadcaster: connection.peers[pid].extra.broadcaster === true
                    });
                });
                connection.socket.emit(connection.socketCustomEvent, {
                    participants: participants
                });
            }
        });
    }
    connection.onstreamended = function(event) {
        var mediaElement = document.getElementById(event.streamid);
        if(mediaElement) {
            mediaElement.parentNode.removeChild(mediaElement);
        }
    };

    function joinBroadcastLooper(roomid) {
        (function reCheckRoomPresence() {
            connection.checkPresence(roomid, function(isRoomExist) {
                if (isRoomExist) {
                    beforeJoiningARoom(function() {
                        connection.join(roomid, function() {
                            afterConnectingSocket();
                        });
                    });
                    return;
                }
                setTimeout(reCheckRoomPresence, 5000);
            });
        })();
    }

    connection.onEntireSessionClosed = function(event) {
        if (connection.isInitiator) {
            connection.attachStreams.forEach(function(stream) {
                stream.stop();
            });
        }else {
            console.log(connection.attachStreams);
            connection.attachStreams.forEach(function(localStream) {
                if (connection.attachStreams.type == 'local'){
                    localStream.stop();
                }
            });
            $('#giotay').hide();
            $('#bogiotay').hide();
        }
    };

    $('body #done_video').on('click',function(){
        if (connection.isInitiator) {
            connection.closeEntireSession(function() {
                console.log('close');
            });
        }else{
            connection.leave();
            connection.attachStreams.forEach(function(localStream) {
                localStream.stop();
            });
        }
        $(this).hide();
    });

    $('body #out_gr').on('click',function(){
        connection.getRemoteStreams().forEach(function(localStream) {
            localStream.stop();
        });
        connection.attachStreams.forEach(function(localStream) {
            localStream.stop();
        });
        connection.closeSocket();
    });
};