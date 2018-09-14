$(document).ready(function(){
//    var lop_ht = $('#lop_ht').val();
    var table_score = $('#list_score').DataTable({
        "ajax": {
            "type": "GET",
            "url": "/student/score_data",
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

        var mon_id = button.data('mon-id');
        var mon = $("#mon_"+mon_id).text();
        $("#point input[name=mon]").val(mon);

        var diem = button.text();
        $("#point input[name=diem]").val(diem);

        var ngay_lam = button.data("ngay-lam");
        $("#point input[name=ngay_lam]").val(ngay_lam);

        var bai_lam = button.data("bai-lam");
        $("#point textarea[name=bai_lam]").val(bai_lam);
    });
});



