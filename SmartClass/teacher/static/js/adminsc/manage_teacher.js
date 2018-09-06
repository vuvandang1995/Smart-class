$(document).ready(function(){
    var table_teacher = $('#list_teacher').DataTable({
//        "columnDefs": [
//            { "width": "2%", "targets": 0 },
//            { "width": "12%", "targets": 1 },
//            { "width": "10%", "targets": 2 },
//            { "width": "10%", "targets": 3 },
//        ],
        "ajax": {
            "type": "GET",
            "url": "/adminsc/manage_teacher/data",
            "contentType": "application/json; charset=utf-8",
            "data": function(result){
                return JSON.stringify(result);
            },
//            "complete": function(){
//                setTimeout(function(){
//                    countdowntime();
//                }, 1000);
//            }
        },
//        'dom': 'Rlfrtip',
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
        "displayLength": 25,
    });

    $("#new_teacher").on('show.bs.modal', function(event){
        var button = $(event.relatedTarget);
        var title = button.data('title');
        if (title === 'edit'){
            $('#title').html("Chỉnh sửa dịch vụ")
            var svname = button.data('name');
            var svid = button.attr('id');
            $("input[name=svname]").val(svname);

            var description = $("#description_topic"+svid).html();
            $("input[name=description]").val(description);

            var leader = $("#leader_topic"+svid).children('p').text();
            $("input[name=search]").val(leader);

            var leader_username = $("#leader_topic"+svid).children('input').val();
            $("input[name=username_leader]").val(leader_username);

            var gpsv = $("input[name=gpsv"+svid+"]").val();
            $("#mySelect").val(gpsv);

            var downtime = $('body #downtime'+svid).html();
            var ngay = parseInt(downtime/1440);
            var gio = parseInt((downtime - ngay*1440)/60);
            var phut = parseInt(downtime - ngay*1440 - gio*60);
            $("input[name=ngay]").val(ngay);
            $("input[name=gio]").val(gio);
            $("input[name=phut]").val(phut);

            $('body #list_agent').empty();
            $('body .listagent'+svid).each(function(){
                var username = $(this).children('input').val();
                var fullname = $(this).text();
                var element = '<li><input style="transform: scale(1.3)" type="checkbox" class="check_agent" name="'+username+'" value="'+username+'" checked >'+fullname+'</li>';
                $('#list_agent').append(element);
            });

            $("#search_agent").val("");
            $("input[name=svid]").val(svid);
            $("#nameerr").html("");
            $("#deserr").html("");
            $("#leadererr").html("");
            $("#gpsverr").html("");
            $("#downtimeerr").html("");

        }else{
            $('#teacher_title').html("Thêm mới giáo viên")
            $("input[name=svid]").val(0);
            $("input[name=fullname]").val("");
            $("input[name=username]").val("");
            $("input[name=gioi_tinh]").val("");
            $("input[name=search_agent]").val("");
            $("input[name=username_leader]").val("");
            $('body #list_agent').empty();
            $("input[name=ngay]").val("");
            $("input[name=gio]").val("");
            $("input[name=phut]").val("");
            $("#nameerr").html("");
            $("#deserr").html("");
            $("#leadererr").html("");
            $("#gpsverr").html("");
            $("#downtimeerr").html("");
        }
    });

    $('#create_new_teacher').click( function(){
        var token = $("#new_teacher input[name=csrfmiddlewaretoken]").val();
        var fullname = $("#new_teacher input[name=fullname]").val();
        var username = $("#new_teacher input[name=username]").val();
        var email = $("#new_teacher input[name=email]").val();
        var password = $("#new_teacher input[name=password]").val();
        var password2 = $("#new_teacher input[name=password2]").val();
        var list_mon = [];
        $('#new_teacher input:checkbox').each(function() {
            if ($(this).is(":checked") && (this.name != 'nam') && (this.name != 'nu') ){
                list_mon.push(this.name);
            }
        });
        if(password === password2){
            $.ajax({
                type:'POST',
                url:location.href,
                data: {'csrfmiddlewaretoken':token, 'fullname': fullname,'list_mon': JSON.stringify(list_mon),
                 'username': username, 'email': email, 'password': password},
                success: function(){
                    $('#list_teacher').DataTable().ajax.reload(null,false);
                    $("#close_new_teacher").click();
                }
            });
        }
    });

    $(".gioi_tinh").change(function() {
        if($('#new_teacher input[name=nam]').checked){
            console.log("nam click");
            $('#new_teacher input[name=nu]').prop('checked', false);
        }
        if($('#new_teacher input[name=nu]').checked){
            console.log("nu click");
            $('#new_teacher input[name=nam]').prop('checked', false);
        }
    });

    var options_mon = {
        url: "mon_data",

        getValue: function(element){
            return element.ten+" - "+element.lop;
         },
//        template: {
//            type: "description",
//            fields: {
//                description: "username"
//            }
//        },

        list: {
            match: {
                enabled: true
            },
            onChooseEvent: function() {
                var ten = $("#search_mon").getSelectedItemData().ten;
                var lop = $("#search_mon").getSelectedItemData().lop;
                var element = '<div class="checkbox checkbox-circle checkbox-info peers ai-c"><input type="checkbox" class="check_mon peer" name="'+ten+" - "+lop+'" value="'+ten+" - "+lop+'" checked ><label class="peers peer-greed js-sb ai-c"><span class="peer peer-greed">'+ten+" - "+lop+'</span></label></div>';
                var list_old = $("#list_mon").text();
                if (list_old.includes(ten) == false){
                    $('#list_mon').append(element);
                }
                $("#search_mon").val("");
            }
        },
        theme: "square"
    };
    $("#search_mon").easyAutocomplete(options_mon);

    $('body #list_mon').on('change', '.check_mon', function() {
        $(this).parent().parent().remove();
    });

});