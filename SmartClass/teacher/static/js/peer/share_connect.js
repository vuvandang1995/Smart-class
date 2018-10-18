var audio_broad = new RTCMultiConnection();
audio_broad.socketURL = 'http://192.168.100.22:9002/';
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
};

audio_broad.onstreamended = function(event) {
    var mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
    }
};

function joinBroadcastLooper(roomid) {
    (function reCheckRoomPresence() {
        audio_broad.checkPresence(roomid, function(isRoomExist) {
            if (isRoomExist) {
                audio_broad.join(roomid, function() {});
                return;
            }
            setTimeout(reCheckRoomPresence, 5000);
        });
    })();
}

function NtoB(){
//    audio_broad.leave();
//    audio_broad.close();
    audio_broad.disconnect();
    audio_broad.extra.broadcaster = true;
    audio_broad.dontCaptureUserMedia = false;
    joinBroadcastLooper(window.atob(location.href.split("_")[1]));
}

function BtoN(){
    audio_broad.attachStreams.forEach(function(localStream) {
        localStream.stop();
    });
//    audio_broad.leave();
//    audio_broad.close();
    audio_broad.disconnect();
    audio_broad.extra.broadcaster = false;
    audio_broad.dontCaptureUserMedia = true;
    joinBroadcastLooper(window.atob(location.href.split("_")[1]));
}

function openRoom(){
    audio_broad.openOrJoin(window.atob(location.href.split("_")[1]), function(isRoomExist, roomid) {});
}

$('#share-screen').click(function(){
    audio_broad.addStream({
        screen: true,
    });
});

//$('body #status').on('click',function(){
//    console.log(audio_broad.getRemoteStreams());
//    console.log(audio_broad.attachStreams);
//    console.log(audio_broad.getAllParticipants());
//    console.log(audio_broad);
//    audio_broad.getRemoteStreams().forEach(function(reStream) {
//        console.log(reStream)
//    });
//});


function closeRoom(){
    audio_broad.attachStreams.forEach(function(stream) {
        stream.stop();
    });
    audio_broad.getRemoteStreams().forEach(function(reStream) {
        reStream.stop();
    });
    audio_broad.disconnect();
    audio_broad.closeSocket();
}

function closeRemote(){
    audio_broad.getRemoteStreams().forEach(function(reStream) {
        reStream.stop();
    });
}

function reconnect(){
    audio_broad.checkPresence(window.atob(location.href.split("_")[1]), function(isRoomExist){
        if (isRoomExist){
            if(audio_broad.extra.broadcaster == true){
                NtoB();
            }else{
                BtoN();
            };
            $("#giotay").show();
            $("#bogiotay").hide();
            $("#share-screen").hide();
        };
    });
}


