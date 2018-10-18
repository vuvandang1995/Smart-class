$(document).ready(function(){
    chatallSocket = new WebSocket(
        'ws://' + window.location.host +
        '/ws/' + userName + 'chatall'+lopht+'/');

    chatallSocket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        var message = data['message'];
        var who = data['who'];
        var time = data['time'];
        if (time == 'giotay'){
            $('#giotay_'+who).show();
        }
    };

    $("#start-screen").click(function(){
        openRoom();
        chatallSocket.send(JSON.stringify({
            'message' : 'start_screen',
            'who' : 'start_screen',
            'time' : 'start_screen'
        }));
        $("#start-screen").hide();
        $("#share-screen").show();
        $("#stop-screen").show();
    });

    $("#stop-screen").click(function(){
        closeRoom();
        chatallSocket.send(JSON.stringify({
            'message' : 'start_screen',
            'who' : 'start_screen',
            'time' : 'stop_screen'
        }));
        $(".giotay_std").children().attr('class','fa fa-hand-paper-o')
        $(".giotay_std").hide();
        $("#start-screen").show();
        $("#share-screen").hide();
        $("#stop-screen").hide();
    });

    $(".giotay_std").click(function(event){
        event.stopPropagation();
        if($(this).children().attr('class') == 'fa fa-hand-paper-o'){
            if(confirm("Cho phép "+$(this).parent().parent().parent().data("fullname") + " phát biểu")){
                chatallSocket.send(JSON.stringify({
                    'message' : 'enable_share',
                    'who' : $(this).parent().parent().parent().find('p').first().text(),
                    'time' : 'enable_share'
                }));
                $(this).children().attr('class','fa fa-volume-up');
            }else{
                $(this).hide();
            };
        }else{
            if(confirm("Hủy quyền phát biểu của "+$(this).parent().parent().parent().data("fullname"))){
                var name = $(this).parent().parent().parent().find('p').first().text();
                chatallSocket.send(JSON.stringify({
                    'message' : 'disable_share',
                    'who' : name,
                    'time' : 'disable_share'
                }));
//                stopRemote(name);
//                $(".media-container[data-user="+name+"]").remove();
                $(this).children().attr('class','fa fa-hand-paper-o');
                $(this).hide();
            };
        }
    });

    $(".mail_list").click(function(){
        if(confirm("Cho phép "+$(this).data("fullname") + " phát biểu")){
            name = $(this).find('p').first().text();
            chatallSocket.send(JSON.stringify({
                'message' : 'enable_share',
                'who' : name,
                'time' : 'enable_share'
            }));
            $('#giotay_'+name).children().attr('class','fa fa-volume-up');
            $('#giotay_'+name).show();
        };
    });
});