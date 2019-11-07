var i = 1;
function add_input(obj) {
    // 设置每个输入框的第一层包裹
    var major_div = document.getElementById("genome_names");
    row_div = document.createElement('div');
    row_div.setAttribute("class", "row panel ");
    major_div.appendChild(row_div);
    // 设置label的包裹块 宽度为2
    var col2_div = document.createElement("div");
    col2_div.setAttribute("class", "col-lg-2");
    row_div.appendChild(col2_div);
    //设置label及属性
    var label = document.createElement("label");
    label.setAttribute('for', 'conf_genome_name_0');
    label.setAttribute('class', 'control-label center-block');
    label.innerText = "Genome " + i + " name";
    col2_div.appendChild(label);
    //设置输入框的包裹块 宽度为10
    var col9_div = document.createElement("div");
    col9_div.setAttribute("class", "col-lg-9");
    row_div.appendChild(col9_div);
    //设置输入框
    var input_box = document.createElement("input");
    input_box.setAttribute("type", "text");
    input_box.setAttribute("class", "form-control");
    input_box.setAttribute("id", ("conf_genome_name_" + i));
    input_box.setAttribute("name", ("conf_genome_name_" + i));
    input_box.setAttribute("value", "");
    col9_div.appendChild(input_box);
    //设置删除按钮的包裹块
    var col1_div = document.createElement("div");
    col1_div.setAttribute("class", "col-lg-1");
    row_div.appendChild(col1_div);
    //添加删除按钮
    var del_btn = document.createElement('span');
    del_btn.setAttribute("class","close");
    del_btn.setAttribute("onclick","remove_div(this)");
    col1_div.appendChild(del_btn);
    //添加下划线分隔
    var underline = document.createElement('hr');
    col9_div.appendChild(underline);
    i = i + 1;
    major_div.appendChild(obj);
}

function remove_div(obj) {
    obj.parentNode.parentNode.parentNode.removeChild(obj.parentNode.parentNode);
}