$(document).ready(function(){
	$('#btn_nhom').on('click',function(){
		$('#chinhsua').modal('show');
	});


	$('.mail_list').on('click',function(){
		var std_username = $(this).children('p').text();
        //  $("body .noti_chat"+std_username).hide();
         $('body #'+std_username).children('.frame_std').show();
        //  if (typeof(Storage) !== "undefined") {
        //     var herf = $(this).attr('href');
        //     var chat = herf.substring(herf.indexOf("(")+1, herf.indexOf(")")) + ',' + std_username;
        //     // Gán dữ liệu
        //     sessionStorage.setItem(std_username, chat);
             
        //     // Lấy dữ liệu
        // } else {
        //     document.write('Trình duyệt của bạn không hỗ trợ local storage');
        // }

         if (dict_ws[std_username] == undefined){
             dict_ws[std_username] = new WebSocket(
             'ws://' + window.location.host +
             '/ws/' + std_username + '/');
         }

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
             
             if (who == 'me'){
				control = '<li style="padding-top: 15px;margin-left: 5em;width:75%;">' +
							  '<div class="msj-rta macro" style="background-color: #BFE9F9;">' +
								  '<div class="text text-r">' +
									  '<p style="color: #444950;">'+text+'</p>' +
									  '<p style="margin-left: 30%;"><small style="color: #444950;">'+date+'</small></p>' +
								  '</div></div></li>';
			  }else{
				control = '<li style="width:75%">' +
					'<h4 style="margin-bottom: -3px;margin-left: 10%;font-size: 12px;">'+who+'</h4>'+
					'<div class="avatar" style="padding:5px 0px 0px 10px !important"><img class="img-circle" style="width:90%;" src="'+me.avatar+'" /></div>'+
					'<div class="msj-rta macro">' +
						'<div class="text text-r">' +
							'<p style="color: #444950;">'+text+'</p>' +
							'<p style="margin-left: 30%;"><small style="color: #444950;">'+date+'</small></p>' +
						'</div></div>' +
					'</li>';
			  }
             setTimeout(
                 function(){                        
                     $(".chat"+std_username).children('ul').append(control).scrollTop($(".chat"+std_username).children('ul').prop('scrollHeight'));
                 }, time);
             
         }

         
         dict_ws[std_username].onmessage = function(e) {
             var data = JSON.parse(e.data);
             var message = data['message'];
             var who = data['who'];
			 var time = data['time'];
             insertChat1(who, message, time);
         };

     });
});