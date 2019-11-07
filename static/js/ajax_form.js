function trans_json(jsonDom){  // json对象的转置后切换为数组形态 注：转置时使用，本例不需要转置
    Object.keys(jsonDom).forEach(function(key) {   // 将json内层的字符串切换为对象,解锁后续步骤
        jsonDom[key] = eval("(" + jsonDom[key] + ")");
    });
    // var first_key = Object.keys(jsonDom)[0];  // 获取一个键值，便于后面计算内部array的长度
    // var transpositon_var = [];
    // for(let i = 0;i < jsonDom[first_key].length;i++){  // 此循环用于转置数组
    //     let single_row = [];
    //     Object.keys(jsonDom).forEach(function(key){
    //         single_row.push(jsonDom[key][i]);
    //     });
    //     transpositon_var.push(single_row);
    // }
    return jsonDom;
}



function ajaxForm(obj) {
        var form = $('#choosed_chr_form').serialize();
        console.log(form);
        $.ajax({
            url:"/ajax_test",
            type:"post",
            data:form,
            dataType: 'json',
            // processData:false,  // 生成formData的时候使用，序列化不需要
            // contentType:false,  // 生成formData的时候使用，序列化不需要
            success:function(returned_info) {
//                console.log(returned_info);
                customized_sankey_chart(obj, returned_info)
                // var container_one = obj.parentNode.parentNode;
                //     // var label_a = document.createElement("p");
                //     // label_a.innerText = returned_info;
                //     // container_one.appendChild(label_a);
            },
            error:function(e) {
                alert("error");
            }
        })
    }