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
        console.log = title;
        if (title === 'edit'){
            $('#teacher_title').html("Chỉnh sửa giáo viên")
            var gvid = button.attr('id').split('_')[1];

            var fullname = $("#full_"+gvid).text();
            $("#new_teacher input[name=fullname]").val(fullname);

            $('body #list_mon').empty();
            $('body .list_mon'+gvid).each(function(){
                var mon = $(this).text();
                var element = '<div class="checkbox checkbox-circle checkbox-info peers ai-c"><input type="checkbox" class="check_mon peer" name="'+mon+'" value="'+mon+'" checked ><label class="peers peer-greed js-sb ai-c"><span class="peer peer-greed">'+mon+'</span></label></div>';
                $('#list_mon').append(element);
            });

            var gioi_tinh = $("#gioi_"+ gvid).text();
            if(gioi_tinh === 'Nam'){
                $('#new_teacher input[name=nam]').prop('checked', true);
                $('#new_teacher input[name=nu]').prop('checked', false);
            }else{
                $('#new_teacher input[name=nam]').prop('checked', false);
                $('#new_teacher input[name=nu]').prop('checked', true);
            }

            var username = $("#user_"+gvid).text();
            $("#new_teacher input[name=username]").val(username);

            var email = $("#email_"+gvid).text();
            $("#new_teacher input[name=email]").val(email);

            $("#new_teacher input[name=username]").hide();
            $("#new_teacher label[name=username]").hide();

            $("#new_teacher input[name=password]").hide();
            $("#new_teacher label[name=password]").hide();

            $("#new_teacher  input[name=password2]").hide();
            $("#new_teacher label[name=password2]").hide();

            $("#new_teacher  input[name=kieu]").val("edit");

            $("#create_new_teacher").html("Chỉnh sửa");

        }else{
            $('#teacher_title').html("Thêm mới giáo viên")
            $("#new_teacher input[name=gvid]").val(0);
            $("#new_teacher input[name=fullname]").val("");
            $("#new_teacher input[name=search_mon]").val("");
            $("#new_teacher input[name=gioi_tinh]").val("");
            $('#new_teacher input[name=nam]').prop('checked', true);
            $('#new_teacher input[name=nu]').prop('checked', false);
            $("#new_teacher input[name=username]").val("");
            $("#new_teacher input[name=password]").val("");
            $("#new_teacher input[name=password2]").val("");
            $("#new_teacher input[name=email]").val("");

            $('#list_mon').empty();

            $("#new_teacher input[name=username]").show();
            $("#new_teacher label[name=username]").show();

            $("#new_teacher input[name=password]").show();
            $("#new_teacher label[name=password]").show();

            $("#new_teacher input[name=password2]").show();
            $("#new_teacher label[name=password2]").show();

            $("#new_teacher  input[name=kieu]").val("new");
            $("#create_new_teacher").html("Thêm mới");
        }
    });

    $('#create_new_teacher').click( function(){
        var kieu = $("#new_teacher  input[name=kieu]").val();
        var token = $("#new_teacher input[name=csrfmiddlewaretoken]").val();
        var fullname = $("#new_teacher input[name=fullname]").val();
        if ($('#new_teacher input[name=nam]').is(':checked')){
            var gioi_tinh = 1;
        }else{
            var gioi_tinh = 0;
        }
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
                data: {'csrfmiddlewaretoken':token, 'kieu':kieu, 'fullname': fullname, 'gioi_tinh': gioi_tinh,
                'list_mon': JSON.stringify(list_mon),'username': username, 'email': email, 'password': password},
                success: function(){
                    $("#new_teacher").modal("hide");
                    $('#list_teacher').DataTable().ajax.reload(null,false);
                }
            });
        }
    });

    $(".gioi_tinh").change(function() {
        if(this.checked && this.name === 'nam'){
            $('#new_teacher input[name=nu]').prop('checked', false);
        }
        else if(this.checked && this.name === 'nu'){
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
                if (list_old.includes(ten+" - "+lop) == false){
                    $('#list_mon').append(element);
                }
                $("#search_mon").val("");
            }
        },
        theme: "square"
    };
    $("#search_mon").easyAutocomplete(options_mon);

    $('body #list_mon').on('change', '.check_mon', function() {
        $(this).parent().remove();
    });

});