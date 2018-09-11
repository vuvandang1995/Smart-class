$(document).ready(function(){
    var table_student = $('#list_student').DataTable({
//        "columnDefs": [
//            { "width": "2%", "targets": 0 },
//            { "width": "12%", "targets": 1 },
//            { "width": "10%", "targets": 2 },
//            { "width": "10%", "targets": 3 },
//        ],
        "ajax": {
            "type": "GET",
            "url": "/adminsc/manage_student/data_all",
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
        "displayLength": 10,
    });

    $("#new_student").on('show.bs.modal', function(event){
        var button = $(event.relatedTarget);
        var title = button.data('title');
        if (title === 'edit'){
            $('#teacher_title').html("Chỉnh sửa học sinh")
            var hsid = button.attr('id').split('_')[1];

            var fullname = $("#full_"+hsid).text();
            $("#new_student input[name=fullname]").val(fullname);

            $('body #list_lop').empty();
            $('body .list_lop'+hsid).each(function(){
                $('#new_student input[name=search_lop]').val($(this).text());
            });

            var gioi_tinh = $("#gioi_"+ hsid).text();
            if(gioi_tinh === 'Nam'){
                $('#new_student input[name=nam]').prop('checked', true);
                $('#new_student input[name=nu]').prop('checked', false);
            }else{
                $('#new_student input[name=nam]').prop('checked', false);
                $('#new_student input[name=nu]').prop('checked', true);
            }

            var username = $("#user_"+hsid).text();
            $("#new_student input[name=username]").val(username);
            $("#new_student input[name=username]").prop("readonly", true);

            var email = $("#email_"+hsid).text();
            $("#new_student input[name=email]").val(email);

            $(".passwd").each(function() {
                $(this).hide();
            });

            $("#new_student  input[name=kieu]").val("edit");

            $("#create_new_student").html("Chỉnh sửa");

        }else{
            $('#teacher_title').html("Thêm mới học sinh")
            $("#new_student input[name=gvid]").val(0);
            $("#new_student input[name=fullname]").val("");
            $("#new_student input[name=search_mon]").val("");
            $("#new_student input[name=search_lop]").val("");
            $("#new_student input[name=gioi_tinh]").val("");
            $('#new_student input[name=nam]').prop('checked', true);
            $('#new_student input[name=nu]').prop('checked', false);
            $("#new_student input[name=username]").val("");
            $("#new_student input[name=password]").val("");
            $("#new_student input[name=password2]").val("");
            $("#new_student input[name=email]").val("");
            $('#new_student input[name=search_lop]').val('');

            $("#new_student input[name=username]").prop("readonly", false);

            $(".passwd").each(function() {
                $(this).show();
            });

            $("#new_student  input[name=kieu]").val("new");
            $("#create_new_student").html("Thêm mới");
        }
    });

    $('#create_new_student').click( function(){
        var kieu = $("#new_student  input[name=kieu]").val();
        var token = $("#new_student input[name=csrfmiddlewaretoken]").val();
        var fullname = $("#new_student input[name=fullname]").val();
        if ($('#new_student input[name=nam]').is(':checked')){
            var gioi_tinh = 1;
        }else{
            var gioi_tinh = 0;
        }
        var username = $("#new_student input[name=username]").val();
        var email = $("#new_student input[name=email]").val();
        var password = $("#new_student input[name=password]").val();
        var password2 = $("#new_student input[name=password2]").val();
        var list_lop = $('#new_student input[name=search_lop]').val();

        if(password === password2){
            $.ajax({
                type:'POST',
                url:location.href,
                data: {'csrfmiddlewaretoken':token, 'kieu':kieu, 'fullname': fullname, 'gioi_tinh': gioi_tinh,
                'list_lop': list_lop,'username': username,'email': email, 'password': password},
                success: function(){
                    $("#new_student").modal("hide");
                    $('#list_student').DataTable().ajax.reload(null,false);
                }
            });
        }
    });

    $(".gioi_tinh").change(function() {
        if(this.checked && this.name === 'nam'){
            $('#new_student input[name=nu]').prop('checked', false);
        }
        else if(this.checked && this.name === 'nu'){
            $('#new_student input[name=nam]').prop('checked', false);
        }
    });

    var options_lop = {
        url: "lop_data",

        getValue: function(element){
            return element.ten;
         },
        list: {
            match: {
                enabled: true
            },
        },
        theme: "square"
    };
    $("#search_lop").easyAutocomplete(options_lop);

    $("#list_student").on('click', '.btn-danger', function(){
        var id = $(this).attr('id').split('_')[1];
        var token = $("input[name=csrfmiddlewaretoken]").val();
        if (confirm('Bạn có chắc ?')){
            $.ajax({
                type:'POST',
                url:location.href,
                data: {'delete':id, 'csrfmiddlewaretoken':token},
                success: function(){
                    $('#list_student').DataTable().ajax.reload(null,false);
                }
           });
        }
    });

    $("#list_student").on('click', '.btn-warning', function(){
        var id = $(this).attr('id').split('_')[1];
        var token = $("input[name=csrfmiddlewaretoken]").val();
        if (confirm('Bạn có chắc ?')){
            $.ajax({
                type:'POST',
                url:location.href,
                data: {'block':id, 'csrfmiddlewaretoken':token},
                success: function(){
                    $('#list_student').DataTable().ajax.reload(null,false);
                }
           });
        }
    });
});

function change() {
    lop_hs = $('#data_lop').val();
    if(lop_hs === 'Tất cả'){
        lop_hs = 'all'
    }
    stu_data =$("#list_student").DataTable();
    stu_data.ajax.url('/adminsc/manage_student/data_'+ lop_hs).load();
};