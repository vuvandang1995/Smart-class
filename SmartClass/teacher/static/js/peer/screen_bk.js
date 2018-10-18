

//    var checkbox = document.querySelector('input[type=checkbox]');
//    function beforeJoiningARoom(callback) {
//        if (checkbox.checked === false) {
//            audio_broad.extra.broadcaster = false;
//            audio_broad.dontCaptureUserMedia = true;
////            audio_broad.session.oneway = true;
//        } else {
//            audio_broad.extra.broadcaster = true;
//        }
//        callback();
//    }
    // ......................................................
    // .......................UI Code........................
    // ......................................................
    document.getElementById('open-room').onclick = function() {
        audio_broad.openOrJoin(document.getElementById('room-id').value, function(isRoomExist, roomid) {
//            afterConnectingSocket();
        });
    };
    document.getElementById('join-room').onclick = function() {
        joinBroadcastLooper(document.getElementById('room-id').value);
    };

    document.getElementById('share-screen').onclick = function() {
        audio_broad.addStream({
            screen: true,
//            oneway: true
        });
    };
    // ......................................................
    // ..................RTCMultiaudio_broad Code.............
    // ......................................................
    var audio_broad = new RTCMultiConnection();

    // by default, socket.io server is assumed to be deployed on your own URL
    audio_broad.socketURL = 'https://192.168.100.23:9443/';
    //audio_broad.socketURL = 'https://rtcmultiaudio_broad.herokuapp.com:443/';
    // comment-out below line if you do not have your own socket.io server
    audio_broad.getScreenConstraints = function(callback) {
        getScreenConstraints(function(error, screen_constraints) {
            if (!error) {
                screen_constraints = audio_broad.modifyScreenConstraints(screen_constraints);
                callback(error, screen_constraints);
                return;
            }
            throw error;
        });
    };
    audio_broad.socketMessageEvent = 'multi-broadcasters-demo';
    audio_broad.session = {
        audio: true,
        broadcast: true
    };
    audio_broad.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    };
    audio_broad.mediaConstraints.video = false;
    audio_broad.videosContainer = document.getElementById('videos-container');
    audio_broad.onstream = function(event) {
        if(document.getElementById(event.streamid)) {
            var existing = document.getElementById(event.streamid);
            existing.parentNode.removeChild(existing);
            if(audio_broad.extra.broadcaster === false){
                BtoN();
            }
        }
        var width = parseInt(audio_broad.videosContainer.clientWidth / 2) - 20;

        if(event.stream.isScreen === true) {
            width = audio_broad.videosContainer.clientWidth - 20;
        }

        var mediaElement = getMediaElement(event.mediaElement, {
            title: event.userid,
            buttons: ['full-screen'],
            width: width,
            showOnMouseEnter: false
        });

        audio_broad.videosContainer.appendChild(mediaElement);
        setTimeout(function() {
            mediaElement.media.play();
        }, 5000);

        mediaElement.id = event.streamid;
        if (event.type === 'remote' && audio_broad.isInitiator) {
            var participants = [];
            audio_broad.getAllParticipants().forEach(function(pid) {
                participants.push({
                    pid: pid,
                    broadcaster: audio_broad.peers[pid].extra.broadcaster === true
                });
            });
            audio_broad.socket.emit(audio_broad.socketCustomEvent, {
                participants: participants
            });
        } else if (event.type === 'remote' && audio_broad.extra.broadcaster === false) {
            audio_broad.socket.emit(audio_broad.socketCustomEvent, {
                giveAllParticipants: true
            });
        }
    };
    function afterConnectingSocket() {
        audio_broad.socket.on(audio_broad.socketCustomEvent, function(message) {
//            console.error('custom message', message);
            if (message.participants && !audio_broad.isInitiator) {
                message.participants.forEach(function(participant) {
                    if (participant.pid === audio_broad.userid) return;
                    if (audio_broad.getAllParticipants().indexOf(participant.pid) !== -1) return;
                    if (audio_broad.extra.broadcaster === true && participant.broadcaster === false) return;
//                    console.error('I am joining:', participant.pid);
                    audio_broad.join(participant.pid);
                });
            }
            if (message.giveAllParticipants && audio_broad.isInitiator) {
                var participants = [];
                audio_broad.getAllParticipants().forEach(function(pid) {
                    participants.push({
                        pid: pid,
                        broadcaster: audio_broad.peers[pid].extra.broadcaster === true
                    });
                });
                audio_broad.socket.emit(audio_broad.socketCustomEvent, {
                    participants: participants
                });
            }
        });
    }
    audio_broad.onstreamended = function(event) {
        var mediaElement = document.getElementById(event.streamid);
        if (mediaElement) {
            mediaElement.parentNode.removeChild(mediaElement);
        }
    };

    // ......................................................
    // ......................Handling Room-ID................
    // ......................................................

//    (function() {
//        var params = {},
//            r = /([^&=]+)=?([^&]*)/g;
//        function d(s) {
//            return decodeURIComponent(s.replace(/\+/g, ' '));
//        }
//        var match, search = window.location.search;
//        while (match = r.exec(search.substring(1)))
//            params[d(match[1])] = d(match[2]);
//        window.params = params;
//    })();
//    var roomid = '';
//    if (localStorage.getItem(audio_broad.socketMessageEvent)) {
//        roomid = localStorage.getItem(audio_broad.socketMessageEvent);
//    } else {
//        roomid = audio_broad.token();
//    }
//    document.getElementById('room-id').value = roomid;
//    document.getElementById('room-id').onkeyup = function() {
//        localStorage.setItem(audio_broad.socketMessageEvent, this.value);
//    };
//    var hashString = location.hash.replace('#', '');
//    if (hashString.length && hashString.indexOf('comment-') == 0) {
//        hashString = '';
//    }
//    var roomid = params.roomid;
//    if (!roomid && hashString.length) {
//        roomid = hashString;
//    }
    function joinBroadcastLooper(roomid) {
        // join-broadcast looper
        (function reCheckRoomPresence() {
            audio_broad.checkPresence(roomid, function(isRoomExist) {
                if (isRoomExist) {
                    audio_broad.join(roomid, function() {
//                        afterConnectingSocket();
                    });
                    return;
                }
                setTimeout(reCheckRoomPresence, 5000);
            });
        })();
    }
//    if (roomid && roomid.length) {
//        document.getElementById('room-id').value = roomid;
//        localStorage.setItem(audio_broad.socketMessageEvent, roomid);
//        joinBroadcastLooper(roomid);
//    }

//    audio_broad.onEntireSessionClosed = function(event) {
//        if (audio_broad.isInitiator) {
//            audio_broad.attachStreams.forEach(function(stream) {
//                stream.stop();
//            });
//            console.log(event);
//            console.log(audio_broad.attachStreams);
//        }else {
//            console.log(event);
//            console.log(audio_broad.attachStreams);
//            audio_broad.leave();
//            audio_broad.attachStreams.forEach(function(localStream) {
//                if (audio_broad.attachStreams.type == 'local'){
//                    localStream.stop();
//                }
//            });
//            $('#giotay').hide();
//            $('#bogiotay').hide();
//        }
//
//    };

//    $('body #done_video').on('click',function(){
//        if (audio_broad.isInitiator) {
//            audio_broad.closeEntireSession();
//            audio_broad.attachStreams.forEach(function(stream) {
//                stream.stop();
//            });
//            audio_broad.close();
//            audio_broad.closeSocket();
//            audio_broad.disconnect();
//            audio_broad.leave();
//        }else{
//            audio_broad.leave();
//            audio_broad.attachStreams.forEach(function(localStream) {
//                localStream.stop();
//            });
//        }
//        $(this).hide();
//    });

//    $('body #out_gr').on('click',function(){
//        console.log(audio_broad.getRemoteStreams());
//        audio_broad.getRemoteStreams().forEach(function(localStream) {
//            localStream.stop();
//        });
//        audio_broad.attachStreams.forEach(function(localStream) {
//            localStream.stop();
//        });
//        // audio_broad.closeEntireSession();
//        audio_broad.closeSocket();
//    });
//
//    $('body #status').on('click',function(){
//        console.log(audio_broad.getRemoteStreams());
//        console.log(audio_broad.attachStreams);
//        console.log(audio_broad.getAllParticipants());
//        console.log(audio_broad);
//    });


function NtoB(){
    audio_broad.leave();
    audio_broad.close();
    audio_broad.disconnect();
    audio_broad.extra.broadcaster = true;
    audio_broad.dontCaptureUserMedia = false;
    joinBroadcastLooper(window.atob(location.href.split("_")[1]));
}

function BtoN(){
    audio_broad.attachStreams.forEach(function(localStream) {
        localStream.stop();
    });
    audio_broad.leave();
    audio_broad.close();
    audio_broad.disconnect();
    audio_broad.extra.broadcaster = false;
    audio_broad.dontCaptureUserMedia = true;
    joinBroadcastLooper(window.atob(location.href.split("_")[1]));
}

//$('body #NtoB').on('click',function(){
//    NtoB();
//});
//
//$('body #BtoN').on('click',function(){
//    BtoN()
//});