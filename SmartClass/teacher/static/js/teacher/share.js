$(document).ready(function(){
    chatallSocket = new WebSocket(
        'ws://' + window.location.host +
        '/ws/' + userName + 'chatall'+lopht+'/');

    share_connect();
    $('input[name=broadcaster]').prop('checked',true);
    $("#room-id").val(window.atob(location.href.split("_")[1]));
    $("#open-room").click();

    chatallSocket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        var message = data['message'];
        var who = data['who'];
        var time = data['time'];
        if (time == 'giotay'){
            $('#giotay_'+who).show();
        }
    };

    $(".giotay_std").click(function(event){
        if($(this).children().attr('class') == 'fa fa-hand-paper-o'){
            if(confirm("Cho phép "+$(this).parent().parent().parent().data("fullname") + " phát biểu")){
                chatallSocket.send(JSON.stringify({
                    'message' : 'enable_share',
                    'who' : $(this).parent().parent().parent().find('p').first().text(),
                    'time' : 'enable_share'
                }));
                $(this).children().removeClass("fa fa-hand-paper-o").addClass("fa fa-volume-up");
            }else{
                $(this).hide();
            };
        }else{
            if(confirm("Hủy quyền phát biểu của"+$(this).parent().parent().parent().data("fullname"))){
                chatallSocket.send(JSON.stringify({
                    'message' : 'disable_share',
                    'who' : $(this).parent().parent().parent().find('p').first().text(),
                    'time' : 'disable_share'
                }));
                $(this).children().removeClass("fa fa-volume-up").addClass("fa fa-hand-paper-o");
                $(this).hide();
            };
        }
    });
});