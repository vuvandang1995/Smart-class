$(document).ready(function(){
    get_de(50);
    function get_de(de_id){
        $.ajax({
            type: 'GET',
            url: '/student/exam_data_'+ de_id,
            success: function(data){
                $("#load_de").html(data);
                $('input[type=checkbox]').change(function(){
                    check_checked($(this).data('id'),$(this).data('ch_id'));
                });
                $('input[type=text]').change(function(){
                    check_empty($(this).data('id'),$(this).data('ch_id'));
                });

                $('textarea').change(function(){
                    var text = $(this).val();
                    var id = $(this).data('id');
                    if (!text.replace(/\s/g, '').length) {
                        $("#stt_"+id).find('span').first().removeClass("label-success").addClass("label-danger");
                        $("#stt_"+id).find('i').first().removeClass('fa-check').addClass('fa-close');
                    }else{
                        $("#stt_"+id).find('span').first().removeClass("label-danger").addClass("label-success");
                        $("#stt_"+id).find('i').first().removeClass('fa-close').addClass('fa-check');
                    }

                });
            },
        });
    };



});

function check_checked(id,ch_id){
        var ar = []
        $("input[name=dap_an_"+ch_id+"]").each(function(){
            if($(this).is(":checked")){
                ar.push(1);
            }else{
                ar.push(0);
            }
        });
        if (jQuery.inArray(1, ar) == -1){
            $("#stt_"+id).find('span').first().removeClass("label-success").addClass("label-danger");
            $("#stt_"+id).find('i').first().removeClass('fa-check').addClass('fa-close');
        }else{
            $("#stt_"+id).find('span').first().removeClass("label-danger").addClass("label-success");
            $("#stt_"+id).find('i').first().removeClass('fa-close').addClass('fa-check');
        }
    }

function check_empty(id,ch_id){
    var ar = []
    $("input[name=dap_an_"+ch_id+"]").each(function(){
        ar.push($(this).val());
    })

    if (jQuery.inArray("", ar) == -1){
        $("#stt_"+id).find('span').first().removeClass("label-danger").addClass("label-success");
        $("#stt_"+id).find('i').first().removeClass('fa-close').addClass('fa-check');
    }else{
        $("#stt_"+id).find('span').first().removeClass("label-success").addClass("label-danger");
        $("#stt_"+id).find('i').first().removeClass('fa-check').addClass('fa-close');
    }
}

function nopBai(){
    if(confirm("Bạn có chắc chắn nộp bài không ?")){
        var ds_dap_an = {}
        $(".dap_an").each(function(){
            if($(this).data('kind') == 'tn'){
                if($(this).is(":checked")){
                    ds_dap_an[$(this).data('ch_id')+'_'+$(this).data("da_id")] = true;
                }else{
                    ds_dap_an[$(this).data('ch_id')+'_'+$(this).data("da_id")] = false;
                }
            }
            else {
                ds_dap_an[$(this).data('ch_id')+'_'+$(this).data("da_id")] = $(this).val();
            }
            $(this).prop("disabled", true);
        });
        $("#processing").modal({backdrop: 'static', keyboard: false});
        $.ajax({
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function(event){
                    var percent = Math.round((event.loaded / event.total) * 100) + '%';
                    $("#progressBar").attr("style","width:"+percent);
                    $("#progressBar").text(percent);
//                    $("#loaded_n_total").html("Tải lên " + event.loaded + " bytes của " + event.total);
                }, false);
                $("#cancel_upload").click(function(){
                    xhr.abort();
                });
                return xhr;
              },
            type: 'POST',
            url: location.href,
            data:{'csrfmiddlewaretoken':$("input[name=csrfmiddlewaretoken]").val(),'de_id':$("input[name=de_id]").val(),
            'ds_dap_an':JSON.stringify(ds_dap_an)},
            success:function(){
                $("#processing").modal('hide');
                location.reload();
            },
        });
    }
};

