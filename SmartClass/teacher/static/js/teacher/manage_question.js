$(document).ready(function(){
    $("#dang_cau_hoi").on("change", function(event){
        var dang_cau_hoi = $("#dang_cau_hoi option:selected").text();
        var nd ='';
        if ( dang_cau_hoi.includes("Trắc nhiệm 2 đáp án")){
            nd = `
            <label>Nội dung:</label>
            <textarea class="form-control" name="noi_dung" placeholder="Nhập nội dung" rows="10"></textarea>
            <br>
            <div class="row">
                <div class="col-md-1 col-sm-12 col-xs-12 form-group">
                    <input type="radio" class="form-control dap_an" name="dap_an">
                </div>
                <div class="col-md-11 col-sm-12 col-xs-12 form-group">
                  <textarea class="form-control nd_dap_an" name="nd_dap_an" placeholder="A:"></textarea>
                </div>
            </div>
            <div class="row">
                <div class="col-md-1 col-sm-12 col-xs-12 form-group">
                  <input type="radio" class="form-control dap_an" name="dap_an">
                </div>
                <div class="col-md-11 col-sm-12 col-xs-12 form-group">
                  <textarea class="form-control nd_dap_an" name="nd_dap_an" placeholder="B:"></textarea>
                </div>
            </div>
            `;
        }
        else if (dang_cau_hoi.includes("3 đáp án")){
            nd += `
            <label>Nội dung:</label>
            <textarea class="form-control" name="noi_dung" placeholder="Nhập nội dung" rows="10"></textarea>
            <br>
            <div class="row">
                <div class="col-md-1 col-sm-12 col-xs-12 form-group">
                  <input type="radio" class="form-control dap_an" name="dap_an">
                </div>
                <div class="col-md-11 col-sm-12 col-xs-12 form-group">
                  <textarea class="form-control nd_dap_an" name="nd_dap_an" placeholder="A:"></textarea>
                </div>
            </div>
            <div class="row">
                <div class="col-md-1 col-sm-12 col-xs-12 form-group">
                  <input type="radio" class="form-control dap_an" name="dap_an">
                </div>
                <div class="col-md-11 col-sm-12 col-xs-12 form-group">
                  <textarea class="form-control nd_dap_an" name="nd_dap_an" placeholder="B:"></textarea>
                </div>
            </div>
            <div class="row">
                <div class="col-md-1 col-sm-12 col-xs-12 form-group">
                  <input type="radio" class="form-control dap_an" name="dap_an">
                </div>
                <div class="col-md-11 col-sm-12 col-xs-12 form-group">
                  <textarea class="form-control nd_dap_an" name="nd_dap_an" placeholder="C:"></textarea>
                </div>
            </div>
            `;
        }
        else{
            nd +=`
            <label>Nội dung:</label>
            <textarea class="form-control" name="noi_dung" placeholder="Nhập nội dung" rows="10"></textarea>
            <br>
            <div class="row">
                <div class="col-md-1 col-sm-12 col-xs-12 form-group">
                  <input type="radio" class="form-control dap_an" name="dap_an">
                </div>
                <div class="col-md-11 col-sm-12 col-xs-12 form-group">
                  <textarea class="form-control nd_dap_an" name="nd_dap_an" placeholder="A:"></textarea>
                </div>
            </div>
            <div class="row">
                <div class="col-md-1 col-sm-12 col-xs-12 form-group">
                  <input type="radio" class="form-control dap_an" name="dap_an">
                </div>
                <div class="col-md-11 col-sm-12 col-xs-12 form-group">
                  <textarea class="form-control nd_dap_an" name="nd_dap_an" placeholder="B:"></textarea>
                </div>
            </div>
            <div class="row">
                <div class="col-md-1 col-sm-12 col-xs-12 form-group">
                  <input type="radio" class="form-control dap_an" name="dap_an">
                </div>
                <div class="col-md-11 col-sm-12 col-xs-12 form-group">
                  <textarea class="form-control nd_dap_an" name="nd_dap_an" placeholder="C:"></textarea>
                </div>
            </div>
            <div class="row">
                <div class="col-md-1 col-sm-12 col-xs-12 form-group">
                  <input type="radio" class="form-control dap_an" name="dap_an">
                </div>
                <div class="col-md-11 col-sm-12 col-xs-12 form-group">
                  <textarea class="form-control nd_dap_an" name="nd_dap_an" placeholder="D:"></textarea>
                </div>
            </div>
            `;
        }
        $("#khung").html(nd);
    });

    $("#luu_cau_hoi").on("click", function(event){
        var token = $("input[name=csrfmiddlewaretoken]").val();
        var mon = $("#mon option:selected").text();
        var chu_de = $("#chu_de").val();
        var dang_cau_hoi = $("#dang_cau_hoi option:selected").text();
        var do_kho = $("#do_kho option:selected").text();
        var noi_dung = $("#khung textarea[name=noi_dung]").val();
        var dap_an = [];
        $("#khung .dap_an").each(function(){
            if ($(this).is(':checked')){
                dap_an.push(1);
            }else{
                dap_an.push(0);
            }
        });
        var nd_dap_an = [];
        $("#khung .nd_dap_an").each(function(){
            nd_dap_an.push($(this).val());
        });
        $.ajax({
            type : "POST",
            url : location.href,
            data : {'csrfmiddlewaretoken':token, 'mon':mon, 'chu_de':chu_de, 'dang_cau_hoi':dang_cau_hoi,
            'do_kho':do_kho, 'noi_dung':noi_dung, 'dap_an':JSON.stringify(dap_an), 'nd_dap_an':JSON.stringify(nd_dap_an)},
            success : function(){
                $("#khung textarea[name=noi_dung]").val("");
                $("#khung .dap_an").each(function(){
                    $(this).prop('checked', false);
                });
                $("#khung .nd_dap_an").each(function(){
                    $(this).val("");
                });
            },
        });
    });
});



