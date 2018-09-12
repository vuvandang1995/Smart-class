$(document).ready(function(){
    var lop_ht = $('#lop_ht').val();
    var table_student = $('#list_student').DataTable({
        "ajax": {
            "type": "GET",
            "url": "/manage_point_data_"+lop_ht,
            "contentType": "application/json; charset=utf-8",
            "data": function(result){
                return JSON.stringify(result);
            },
        },
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
        "displayLength": 25,
        dom: 'Bfrtip',
        buttons: ['csv', 'excel', 'print', 'pdf'],
    });

    $("#point").on('show.bs.modal', function(event){
        var button = $(event.relatedTarget);
        var id_diem = button.attr("id").split("_")[1]
        var loai_bai = button.attr("id").split("_")[0];
        if (loai_bai === 'lt'){
            $("#point input[name=loai_bai]").val("lý thuyết");
        }
        else if (loai_bai === 'th'){
            $("#point input[name=loai_bai]").val("thực hành");
        }
        else{
            $("#point input[name=loai_bai]").val("thi");
        }
        var id_student = button.data('student-id');
        var fullname = $("#full_"+id_student).text();
        $("#point input[name=fullname]").val(fullname);
        var diem = button.text();
        $("#point input[name=diem]").val(diem);

        var ngay_lam = button.data("ngay-lam");
        $("#point input[name=ngay_lam]").val(ngay_lam);

        var bai_lam = button.data("bai-lam");
        $("#point textarea[name=bai_lam]").val(bai_lam);
    });
});



