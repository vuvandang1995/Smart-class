$(document).ready(function(){
    var chatallSocket = new WebSocket(
        'ws://' + window.location.host +
        '/ws/' + teacher_name + 'chatall'+lopht+'/');
    share_connect();


    $('body').on('click', '#giotay', function(){
        chatallSocket.send(JSON.stringify({
            'message' : 'giotay',
            'who' : userName,
            'time' : 'giotay'
        }));

    });

    chatallSocket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        var message = data['message'];
        var who = data['who'];
        var time = data['time'];
        if ((time == 'enable_share') && (userName == who)){
            $('#out_gr').click();
            share_connect();
            setTimeout(function(){
                $("#share-screen").show();
                $('input[name=broadcaster]').prop('checked',true);
                $("#join-room").click();
            },1000);
        }else if ((time == 'disable_share') && (userName == who)){
            $('#out_gr').click();
            share_connect();
            setTimeout(function(){
                $("#share-screen").hide();
                $('input[name=broadcaster]').prop('checked',false);
                $("#join-room").click();
            },1000);
        }else if(time == 'start_screen'){
            share_connect();
            $('input[name=broadcaster]').prop('checked',false);
            $("#room-id").val(window.atob(location.href.split("_")[1]));
            $("#join-room").click();
        }
    };


});