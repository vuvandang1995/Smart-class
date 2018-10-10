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
        var id_diem = button.data('id');
        $("#point_data").load("/manage_point_detail_"+ id_diem);
        $('#in').show();
        $('#cham_diem').show();
        $('#luu_diem').hide();
        $('#huy').hide();
        $("#close").show();
        $(".diem_tu_luan").prop("disabled",true)
        $(".nhan_xet").prop("disabled",true)
    });

    $("#cham_diem").click(function(){
        $('#in').hide();
        $(this).hide();
        $('#luu_diem').show();
        $('#huy').show();
        $("#close").hide();
        $(".diem_tu_luan").prop("disabled",false)
        $(".nhan_xet").prop("disabled",false)
    });

    $("#huy").click(function(){
        $('#in').show();
        $('#cham_diem').show();
        $('#luu_diem').hide();
        $(this).hide();
        $("#close").show();
        $(".diem_tu_luan").prop("disabled",true)
        $(".nhan_xet").prop("disabled",true)
    });

    $("#luu_diem").click(function(){
        $('#in').show();
        $('#cham_diem').show();
        $('#luu_diem').hide();
        $("#huy").hide();
        $("#close").show();
        $(".diem_tu_luan").prop("disabled",true)
        $(".nhan_xet").prop("disabled",true)
        var diem = {}
        $(".diem_tu_luan").each(function(){
            if(parseFloat($(this).val()) == 'NaN'){
                alert("error");
                return false;
            }
            diem[$(this).data('id')]= $(this).val()
            $(this).prop("disabled",true)
        });
        var nhan_xet = {}
        $(".nhan_xet").each(function(){
            nhan_xet[$(this).data('id')]= $(this).val()
            $(this).prop("disabled",true)
        });
        console.log(diem,nhan_xet);
        return false;
        $.ajax({
            type: "POST",
            url: location.href,
            data:{'diem_tu_luan': diem_tu_luan, 'nhan_xet': nhan_xet},
            success: function(){
                $('#point').modal('hide');
            }
        });
    });

});

function PrintElem(){
    $("body").first().html($("#point_data").html());
    window.print();
    location.reload();
    return true;
}
