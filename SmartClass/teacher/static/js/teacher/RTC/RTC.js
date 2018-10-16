window.enableAdapter = true;

var connection = new RTCMultiConnection();
connection.socketURL = "http://192.168.100.22:9002/";
connection.session = {
    audio: true,
    video: false,
    data: false
};
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: false
};
connection.mediaConstraints.video = false;

connection.maxParticipantsAllowed = 5; // one-to-one
connection.onRoomFull = function(roomid) {
  alert('Room is full.');
};


// set this line to close room as soon as owner leaves
connection.autoCloseEntireSession = true;

// connection.onUserStatusChanged = function(event) {
//     if (event.status === 'offline') {
//       // Is the room owner here?
//       var remoteUserId = connection.sessionid; // chat_room is the room name, set higher in the script.
//       var chatters = [connection.userid] // initialize array of users with me.
//       var isUserConnectedWithYou = connection.getAllParticipants().indexOf(remoteUserId) !== -1;
//       if (isUserConnectedWithYou) {
//         // The owner is here...
//         console.log('Primary user is here. Nothing to do.');
//       } else {
//         console.log('Primary user is not here!');
//         connection.attachStreams.forEach(function(localStream) {
//             localStream.stop();
//         });

//         // close socket.io connection
//         connection.close();
//       }
//     }
// };


connection.onUserStatusChanged = function(event) {
    if (event.status === 'offline') {
        if (event.userid == connection.sessionid){
            connection.closeEntireSession(function() {
                console.log('close');
            });
        }
    }
};

connection.onstreamended = function(event) {
    var mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
    }
};
connection.onMediaError = function(e) {
    if (e.message === 'Concurrent mic process limit.') {
        if (DetectRTC.audioInputDevices.length <= 1) {
            alert('Please select external microphone. Check github issue number 483.');
            return;
        }
        var secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
        connection.mediaConstraints.audio = {
            deviceId: secondaryMic
        };
        connection.join(connection.sessionid);
    }
};

connection.onclose = function() {
    connection.attachStreams.forEach(function(localStream) {
        localStream.stop();
    });
    connection.close();
};


connection.onEntireSessionClosed = function(event) {
    connection.attachStreams.forEach(function(stream) {
        stream.stop();
    });
    $('#giotay').hide();
    // don't display alert for moderator
    if (connection.userid === event.userid) return;
        console.log('close');
};
connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
    // seems room is already opened
    connection.join(useridAlreadyTaken);
};


(function() {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;
    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match, search = window.location.search;
    while (match = r.exec(search.substring(1)))
        params[d(match[1])] = d(match[2]);
    window.params = params;
})();

if(navigator.connection &&
   navigator.connection.type === 'cellular' &&
   navigator.connection.downlinkMax <= 0.115) {
  alert('2G is not supported. Please use a better internet service.');
}


function audio_broad(){
    var checkbox = document.querySelector('input[type=checkbox]');
    function beforeJoiningARoom(callback) {
        if (checkbox.checked === false) {
            audio_broad.extra.broadcaster = false;
            audio_broad.dontCaptureUserMedia = true;
            audio_broad.session.oneway = true;
        } else {
            audio_broad.extra.broadcaster = true;
        }
        callback();
    }
    // ......................................................
    // .......................UI Code........................
    // ......................................................
    document.getElementById('open-broadcast').onclick = function() {
        beforeJoiningARoom(function() {
            audio_broad.openOrJoin(document.getElementById('room-id').value, function(isRoomExist, roomid) {
                afterConnectingSocket();
            });
        });
    };
    document.getElementById('join-broadcast').onclick = function() {
        joinBroadcastLooper(document.getElementById('room-id').value);
    };
    // ......................................................
    // ..................RTCMultiaudio_broad Code.............
    // ......................................................
    var audio_broad = new RTCMultiConnection();
    // by default, socket.io server is assumed to be deployed on your own URL
    audio_broad.socketURL = 'http://192.168.100.22:9002/';
    // comment-out below line if you do not have your own socket.io server
    audio_broad.socketMessageEvent = 'multi-broadcasters-demo';
    audio_broad.session = {
        audio: true,
        video: false,
        broadcast: true
    };
    audio_broad.sdpConstraints.mandatory = {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: false
    };
    audio_broad.mediaConstraints.video = false;
    audio_broad.videosContainer = document.getElementById('videos-container111');
    audio_broad.onstream = function(event) {
        var width = parseInt(audio_broad.videosContainer.clientWidth / 2) - 20;
        var mediaElement = getHTMLMediaElement(event.mediaElement, {
            title: event.userid,
            buttons: ['full-screen'],
            width: width,
            showOnMouseEnter: false
        });
        audio_broad.videosContainer.appendChild(mediaElement);
        $('#videos-container111 .media-container .media-controls').hide();
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
        } else if (event.type === 'remote' && checkbox.checked === false) {
            audio_broad.socket.emit(audio_broad.socketCustomEvent, {
                giveAllParticipants: true
            });
        }
    };
    function afterConnectingSocket() {
        audio_broad.socket.on(audio_broad.socketCustomEvent, function(message) {
            console.error('custom message', message);
            if (message.participants && !audio_broad.isInitiator) {
                message.participants.forEach(function(participant) {
                    if (participant.pid === audio_broad.userid) return;
                    if (audio_broad.getAllParticipants().indexOf(participant.pid) !== -1) return;
                    if (checkbox.checked === true && participant.broadcaster === false) return;
                    console.error('I am joining:', participant.pid);
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

    (function() {
        var params = {},
            r = /([^&=]+)=?([^&]*)/g;
        function d(s) {
            return decodeURIComponent(s.replace(/\+/g, ' '));
        }
        var match, search = window.location.search;
        while (match = r.exec(search.substring(1)))
            params[d(match[1])] = d(match[2]);
        window.params = params;
    })();
    var roomid = '';
    if (localStorage.getItem(audio_broad.socketMessageEvent)) {
        roomid = localStorage.getItem(audio_broad.socketMessageEvent);
    } else {
        roomid = audio_broad.token();
    }
    document.getElementById('room-id').value = roomid;
    document.getElementById('room-id').onkeyup = function() {
        localStorage.setItem(audio_broad.socketMessageEvent, this.value);
    };
    var hashString = location.hash.replace('#', '');
    if (hashString.length && hashString.indexOf('comment-') == 0) {
        hashString = '';
    }
    var roomid = params.roomid;
    if (!roomid && hashString.length) {
        roomid = hashString;
    }
    function joinBroadcastLooper(roomid) {
        // join-broadcast looper
        (function reCheckRoomPresence() {
            audio_broad.checkPresence(roomid, function(isRoomExist) {
                if (isRoomExist) {
                    beforeJoiningARoom(function() {
                        audio_broad.join(roomid, function() {
                            afterConnectingSocket();
                        });
                    });
                    return;
                }
                setTimeout(reCheckRoomPresence, 5000);
            });
        })();
    }
    if (roomid && roomid.length) {
        document.getElementById('room-id').value = roomid;
        localStorage.setItem(audio_broad.socketMessageEvent, roomid);
        joinBroadcastLooper(roomid);
    }

    audio_broad.onEntireSessionClosed = function(event) {
        if (audio_broad.isInitiator) {
            audio_broad.attachStreams.forEach(function(stream) {
                stream.stop();
            });
        } else {
            $('#giotay').hide();
            $('#bogiotay').hide();
        }
    };

    $('body #done_video').on('click',function(){
        if (audio_broad.isInitiator) {
            audio_broad.closeEntireSession(function() {
                console.log('close');
            });
        } else {
            audio_broad.leave();
            audio_broad.attachStreams.forEach(function(localStream) {
                localStream.stop();
            });
        }
        $(this).hide();
    });

    $('body #out_gr').on('click',function(){
        audio_broad.closeEntireSession();
    });


};