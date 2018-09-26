
$(document).ready(function(){
    function openStream(){
        const config = {
            audio: true,
            video: false
        };
        return navigator.mediaDevices.getUserMedia(config);
    }
    function playStream(idVideoTag, stream){
        const video = document.getElementById(idVideoTag);
        video.srcObject = stream;
        video.play();
    }

    const peer = new Peer({ host: '192.168.100.22', port: 9001, debug: 3});

    peer.on('open', id => {
        key = id;
    });

    $('body').on('click', '#btnCall', function(){
        // $('#localStream').show();
        // $('#remoteStream').show();
        var std_name = $(this).data('name');
        const id = $(this).attr('name');
        if (id != 'No'){
            openStream()
            .then(stream => {
                // playStream('localStream', stream);
                // var video = document.getElementById('localStream');
                // video.volume = 0;
                // try {
                //     video.setAttributeNode(document.createAttribute('muted'));
                // } catch (e) {
                //     video.setAttribute('muted', true);
                // }
                
                const call = peer.call(id, stream);
                var waiting = document.getElementById("waiting");
                waiting.currentTime=0;
                waiting.play();
                $('#ringring').click();
                $('.modal-title').html('Đang gọi '+std_name+'...');
                // $('#dis_camera').click(() =>{
                //     var videoTrack = stream.getVideoTracks();
                //     if (videoTrack.length > 0) {
                //         stream.removeTrack(videoTrack[0]);
                //         console.log(stream.getTracks());
                //     }else{
                //         stream.addTrack(stream_clone.getVideoTracks()[0]);
                //         console.log(stream.getTracks());
                //     }
                // });
                /*var videoTrack = stream.getVideoTracks();
                $('#dis_camera').click(() =>{
                    if (stream.getVideoTracks().length > 0) {
                        stream.getVideoTracks()[0].stop();
                        setTimeout(function(){
                            stream.removeTrack(videoTrack[0]);
                        }, 2000);
                        console.log(stream.getTracks());
                    }
                });
                $('#btnDone').show();
                $('#btnDone').click(() =>{
                    waiting.pause();
                    call.close();
                    $('#localStream').hide();
                    $('#btnDone').hide();
                    $('#remoteStream').hide();
                    stream.stop();
                    stream.getVideoTracks()[0].stop();
                });*/
                call.on('stream', remoteStream => {
                    $('#remoteStream').show();
                    $('#btnDone').show();
                    // $('#localStream').show();
                    // playStream('localStream', stream);
                    // var video = document.getElementById('localStream');
                    // video.volume = 0;
                    // try {
                    //     video.setAttributeNode(document.createAttribute('muted'));
                    // } catch (e) {
                    //     video.setAttribute('muted', true);
                    // }
                    setTimeout(function(){
                        playStream('remoteStream', remoteStream);
                    }, 1000);
                    waiting.pause();
                });
                $('#btnDone').click(() =>{
                    call.close();
                    // $('#localStream').hide();
                    $('#remoteStream').hide();
                    $('#btnDone').hide();
                    $('#close').click();
                    // stream.stop();
                    // stream.getVideoTracks()[0].stop();
                    stream.getAudioTracks()[0].stop();
                });
                // alert(call.peer);

            });
        }else{
            alert('Học sinh '+std_name + ' đang không trực tuyến!')
        }
    });

    peer.on('call', call => {
        var ring = document.getElementById("ring");
        ring.play();
        $('#ringring').click();
        $('.modal-title').html('Giáo viên đang goi...');
        $("#ok").click(function(){
            openStream()
            .then(stream => {
                call.answer(stream);
                $('#remoteStream').show();
                $("#ok").hide();
                // $('#localStream').show();
                ring.pause();
                // $('#dis_camera').click(() =>{
                //     var videoTrack = stream.getVideoTracks();
                //     if (videoTrack.length > 0) {
                //         stream.removeTrack(videoTrack[0]);
                //         console.log(stream.getTracks());
                //     }else{
                //         stream.addTrack(stream_clone.getVideoTracks()[0]);
                //         console.log(stream.getTracks());
                //     }
                // });
                

                /*playStream('localStream', stream);
                var video = document.getElementById('localStream');
                video.volume = 0;
                try {
                    video.setAttributeNode(document.createAttribute('muted'));
                } catch (e) {
                    video.setAttribute('muted', true);
                }*/
                call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
                call.on('close', function(){
                    $('#remoteStream').hide();
                    $('#close').click();
                    // stream.stop();
                    // stream.getVideoTracks()[0].stop();
                    stream.getAudioTracks()[0].stop();
                });

            });
        });
    });
});