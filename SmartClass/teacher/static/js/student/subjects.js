$(document).ready(function(){
    var teacher_name = $('#teacher_name').text();
    var chatallSocket = new WebSocket(
        'ws://' + window.location.host +
        '/ws/' + teacher_name + 'chatall'+lop+'/');


    chatallSocket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        var message = data['message'];
        var who = data['who'];
        var time = data['time'];
        if (time == 'None'){
            if (key == ''){
                chatallSocket.send(JSON.stringify({
                    'message' : 'No',
                    'who': userName,
                    'time' : 'key'
                }));
            }else{
            chatallSocket.send(JSON.stringify({
                'message' : key,
                'who': userName,
                'time' : 'key'
            }));
            }
        }else if (time === 'call_time'){
            if ($('#audiocall').length){
                $('#audiocall').show();
                $("#demo").show();
                countdowntime(message);
                var time = 1;
                $('#group_class .right').children('p').each(function(index){
                    if (userName == $(this).attr("name")){
                        time = index*1000;
                        return false;
                    }
                });
                // alert(time)
                setTimeout(function(){
                    makeOrJoinRoom($('#audiocall').attr("name")+'_'+lop+'_'+teacher_name);
                }, time);
            }
        }else if (time === 'teacher_call'){
                if ($('#audiocall').length){
                    $('#audiocall').show();
                    $("#demo").show();
                    var time = 1;
                    $('#group_class .right').children('p').each(function(index){
                        if (userName == $(this).attr("name")){
                            time = index*1000;
                            return false;
                        }
                    });
                    // alert(time)
                    setTimeout(function(){
                        makeOrJoinRoom($('#audiocall').attr("name")+'_'+lop+'_'+teacher_name);
                    }, time);
                }    
        }else if (time === 'teacher_audio_all'){
            if ($('#audiocall').length){
                $('#audiocall').show();
                connection.videosContainer = document.getElementById('videos-container');
                connection.onstream = function(event) {
                    var existing = document.getElementById(event.streamid);
                    if(existing && existing.parentNode) {
                    existing.parentNode.removeChild(existing);
                    }
                    event.mediaElement.removeAttribute('src');
                    event.mediaElement.removeAttribute('srcObject');
                    //event.mediaElement.muted = true;
                    //event.mediaElement.volume = 0;
                    var video = document.createElement('audio');
                    try {
                        video.setAttributeNode(document.createAttribute('autoplay'));
                        video.setAttributeNode(document.createAttribute('playsinline'));
                    } catch (e) {
                        video.setAttribute('autoplay', true);
                        video.setAttribute('playsinline', true);
                    }
                    if(event.type === 'local') {
                    video.volume = 0;
                    try {
                        video.setAttributeNode(document.createAttribute('muted'));
                    } catch (e) {
                        video.setAttribute('muted', true);
                    }
                    }
                    video.srcObject = event.stream;
                    var width = parseInt(connection.videosContainer.clientWidth / 3) - 20;
                    var mediaElement = getHTMLMediaElement(video, {
                        title: event.userid,
                        // buttons: ['full-screen'],
                        width: 'auto',
                        height: 'auto',
                        // showOnMouseEnter: false
                    });
                    connection.videosContainer.appendChild(mediaElement);
                    setTimeout(function() {
                        mediaElement.media.play();
                    }, 5000);
                    mediaElement.id = event.streamid;
                    $('#videos-container .media-container ').each(function(){
                        if ($(this).find('h2').first().text() != (teacher_name+'_'+lop)){
                            $(this).hide();
                        }
                    });
                };

                connection.join(teacher_name+'_'+lop);
            }    
        }else if (time != 'key'){
                insertChat(who, message, time);
            }
        };

    function makeOrJoinRoom(roomid) {
        connection.videosContainer = document.getElementById('videos-container');
        connection.onstream = function(event) {
            var existing = document.getElementById(event.streamid);
            if(existing && existing.parentNode) {
              existing.parentNode.removeChild(existing);
            }
            event.mediaElement.removeAttribute('src');
            event.mediaElement.removeAttribute('srcObject');
            //event.mediaElement.muted = true;
            //event.mediaElement.volume = 0;
            var video = document.createElement('audio');
            try {
                video.setAttributeNode(document.createAttribute('autoplay'));
                video.setAttributeNode(document.createAttribute('playsinline'));
            } catch (e) {
                video.setAttribute('autoplay', true);
                video.setAttribute('playsinline', true);
            }
            if(event.type === 'local') {
              video.volume = 0;
              try {
                  video.setAttributeNode(document.createAttribute('muted'));
              } catch (e) {
                  video.setAttribute('muted', true);
              }
            }
            video.srcObject = event.stream;
            var width = parseInt(connection.videosContainer.clientWidth / 3) - 20;
            var mediaElement = getHTMLMediaElement(video, {
                title: event.userid,
                // buttons: ['full-screen'],
                width: 'auto',
                height: 'auto',
                // showOnMouseEnter: false
            });
            connection.videosContainer.appendChild(mediaElement);
            setTimeout(function() {
                mediaElement.media.play();
            }, 5000);
            mediaElement.id = event.streamid;
        };
        connection.checkPresence(roomid, function(roomExist, roomid) {
            if (roomExist === true) {
                connection.join(roomid);
            } else {
                connection.open(roomid);
            }
        });
    }
    
    function countdowntime(dateend){
        var countDownDate = new Date().getTime() + parseInt(dateend)*60000;

        // Update the count down every 1 second
        var x = setInterval(function() {

            // Get todays date and time
            var now = new Date().getTime();
            
            // Find the distance between now and the count down date
            var distance = countDownDate - now;
            
            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            // Output the result in an element with id="demo"
            document.getElementById("demo").innerHTML = "Thời gian còn lại: "+ minutes + "phút " + seconds + "giây ";
            
            // If the count down is over, write some text 
            if (distance < 0) {
                clearInterval(x);
                document.getElementById("demo").innerHTML = "Hết giờ!";
                // connection.attachStreams.forEach(function(localStream) {
                //     localStream.stop();
                // });
            
                // // close socket.io connection
                // connection.close();



                if (connection.isInitiator) {
                    connection.closeEntireSession(function() {
                        console.log('close');
                    });
                } else {
                    connection.leave();
                }
                $('#audiocall').hide();
            }
        }, 1000);
    }

    function reload(){
        // $('body .list_group_all').html('');
        $.ajax({
            type:'GET',
            url: "/student/group_data/"+teacher_name,
            success: function(data){
                $('body .list_group_all').prepend(data);
                if ($('#group_class').length){
                    var group_chat_name = $('#group_class').children('p').text();
                    var chatgroup = new WebSocket(
                    'ws://' + window.location.host +
                    '/ws/' + group_chat_name + 'chatgroup/');
                    var group_name = $('#group_class').children('p').next('p').text();
                    $('#title-chat').html(group_name);
                    $("#chat-group-text").prop('disabled', false);
                    $(".frame2").children('ul').empty();
                    var me = {};
                    me.avatar = "https://cdn2.iconfinder.com/data/icons/perfect-flat-icons-2/512/User_man_male_profile_account_person_people.png";

                    var you = {};
                    you.avatar = "https://cdn2.iconfinder.com/data/icons/rcons-users-color/32/support_man-512.png";      

                    //-- No use time. It is a javaScript effect.
                    function insertChat2(who, text, time){
                        if (time === undefined){
                            time = 0;
                        }
                        var control = "";
                        var date = time;
                        
                        if (who == userName){
                        control = '<li style="padding-top: 15px;margin-left: 5em;width:75%;">' +
                                        '<div class="msj-rta macro" style="background-color: #BFE9F9;">' +
                                            '<div class="text text-r">' +
                                                '<p style="color: #444950;word-break: break-all;">'+text+'</p>' +
                                                '<p><small style="color: #444950;">'+date+'</small></p>' +
                                            '</div></div></li>';
                        }else{
                        control = '<li style="width:75%">' +
                            '<h4 style="margin-bottom: -3px;margin-left: 10%;font-size: 12px;">'+who+'</h4>'+
                            '<div class="avatar" style="padding:5px 0px 0px 10px !important"><img class="img-circle" style="width:90%;" src="'+me.avatar+'" /></div>'+
                            '<div class="msj-rta macro">' +
                                '<div class="text text-r">' +
                                    '<p style="color: #444950;word-break: break-all;">'+text+'</p>' +
                                    '<p><small style="color: #444950;">'+date+'</small></p>' +
                                '</div></div>' +
                            '</li>';
                        }
                        setTimeout(
                            function(){                        
                                $(".frame2").children('ul').append(control).scrollTop($(".frame2").children('ul').prop('scrollHeight'));
                            }, time);
                        
                    }

                    
                    chatgroup.onmessage = function(e) {
                    var data = JSON.parse(e.data);
                    var message = data['message'];
                    var who = data['who'];
                    var time = data['time'];
                    insertChat2(who, message, time);
                    };

                    $('body').on('click', '.zzz', function(){
                        $("body .mytext2").trigger({type: 'keydown', which: 13, keyCode: 13});
                    })
                    $("body .mytext2").focus();
                    $('body').on('keyup', '.mytext2', function(e){
                        if (e.keyCode === 13) {
                            $(this).parent().parent().next().children('span').click();
                        }
                    })
                    $('body').on('click', '.zzz', function(){
                        var message = $(this).parent().parent().children().children().children('input').val();
                        message = escapeHtml(message);
                        var date = formatAMPM(new Date());
                        if (message != ''){
                            chatgroup.send(JSON.stringify({
                                'message' : message,
                                'who' : userName,
                                'time' : date
                            }));
                        }
                        $(this).parent().parent().children().children().children('input').val('');
                        
                    })

                    $('#audiocall').attr('name', group_name);
                };

            }
        });
    }
    reload();


    $('body').on('click', '.xxx', function(){
        $("body .mytext").trigger({type: 'keydown', which: 13, keyCode: 13});
    })
    $("body .mytext").focus();
    $('body').on('keyup', '.mytext', function(e){
        if (e.keyCode === 13) {
            $(this).parent().parent().next().children('span').click();
        }
    })
    $('body').on('click', '.xxx', function(){
        var message = $(this).parent().parent().children().children().children('input').val();
        message = escapeHtml(message);
        var date = formatAMPM(new Date());
        if (message != ''){
          chatallSocket.send(JSON.stringify({
                'message' : message,
                'who' : userName,
                'time' : date
            }));
        }
        $(this).parent().parent().children().children().children('input').val(''); 
    })



    var socket_teacher;
    $('.mail_list').on('click',function(){
        var std = $(this).children('p').text();
        //  $("body .noti_chat"+std_username).hide();
            $('body #'+std).children('.frame_std').show();
        //  if (typeof(Storage) !== "undefined") {
        //     var herf = $(this).attr('href');
        //     var chat = herf.substring(herf.indexOf("(")+1, herf.indexOf(")")) + ',' + std_username;
        //     // Gán dữ liệu
        //     sessionStorage.setItem(std_username, chat);
                
        //     // Lấy dữ liệu
        // } else {
        //     document.write('Trình duyệt của bạn không hỗ trợ local storage');
        // }

        socket_teacher = new WebSocket(
                'ws://' + window.location.host +
                '/ws/' + userName +'chat11/');

            var me = {};
            me.avatar = "https://cdn2.iconfinder.com/data/icons/perfect-flat-icons-2/512/User_man_male_profile_account_person_people.png";

            var you = {};
            you.avatar = "https://cdn2.iconfinder.com/data/icons/rcons-users-color/32/support_man-512.png";      

            //-- No use time. It is a javaScript effect.
            function insertChat1(who, text, time){
                if (time === undefined){
                    time = 0;
                }
                var control = "";
                var date = time;
                
                if (who == userName){
                control = '<li style="padding-top: 15px;margin-left: 5em;width:75%;">' +
                        '<div class="msj-rta macro" style="background-color: #BFE9F9;">' +
                            '<div class="text text-r">' +
                            '<p style="color: #444950;line-height: 17px;word-break: break-all;">'+text+'</p>' +
                            '<p><small style="color: #444950;">'+date+'</small></p>' +
                            '</div></div></li>';
                }else{
                control = '<li style="width:75%">' +
                    '<h4 style="margin-bottom: -3px;margin-left: 10%;font-size: 12px;">'+who+'</h4>'+
                    '<div class="avatar" style="padding:5px 0px 0px 10px;width: 20%;margin-left: -12%;margin-top: 5%; !important"><img class="img-circle" style="width:90%;" src="'+me.avatar+'" /></div>'+
                    '<div class="msj-rta macro">' +
                    '<div class="text text-r">' +
                        '<p style="color: #444950;line-height: 17px;word-break: break-all;">'+text+'</p>' +
                        '<p><small style="color: #444950;">'+date+'</small></p>' +
                    '</div></div>' +
                    '</li>';
                }
                setTimeout(
                    function(){                        
                        $(".chat"+std).children('ul').append(control).scrollTop($(".chat"+std).children('ul').prop('scrollHeight'));
                    }, time);
                
            }

            
            socket_teacher.onmessage = function(e) {
            var data = JSON.parse(e.data);
            var message = data['message'];
            var who = data['who'];
            var time = data['time'];
            insertChat1(who, message, time);
            };

        });

    $('body').on('click', '.header-chat', function(){
    $(this).next().slideToggle(300, 'swing');
    })

    $('body').on('click', '.yyy', function(){
    $('body .mytext1').trigger({type: 'keydown', which: 13, keyCode: 13});
    })
    
    $("body .mytext1").focus();
    $('body').on('keyup', '.mytext1', function(e){
    if (e.keyCode === 13) {
        $(this).parent().parent().next().children('.yyy').click();
    }
    })
    

    $('body').on('click', '.yyy', function(){
    var message = $(this).parent().parent().children().children().children('.mytext1').val();
    message = escapeHtml(message);
    var date = formatAMPM(new Date());
    if (message != ''){
        socket_teacher.send(JSON.stringify({
        'message' : message,
        'who' : userName,
        'time' : date
        }));
    }
    $(this).parent().parent().children().children().children('input').val('');
    })



    $('body').on('click', '.chat-close', function(){
    var teacher_name = $(this).attr('id');
    socket_teacher.close();
    // sessionStorage.removeItem(tk_id);
    $("body #chat"+teacher_name+" .frame > ul").empty();
    })

});