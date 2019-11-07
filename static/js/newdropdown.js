function arr_change(Arr, val, rank) {  // Arr 为二维数组,val 为选定的值
    var Target_Arr = [];
    for(var i=0; i<Arr.length; i++){
        if(Arr[i][rank] === +val){
            Target_Arr.push(Arr[i]);
        }
    }
    return Target_Arr;  // 返回满足val值的数组
}

function set_next(obj){  // 设置触发函数，每一次设置下一个下拉框
    obj.setAttribute("disabled","disabled");
    var val = obj.value;
    var current_rank = +obj.id[0] -1;  // 获得当前下拉框id的首字母 -1，即rank
    var next_rank = +obj.id[0] + 1;
    var next_drop = document.getElementById(next_rank + "st-dropdown");
    var next_value = [];
    Array_von_python = arr_change(Array_von_doc, val, current_rank);
    for(var i=0; i<Array_von_python.length; i++){
        next_value.push(Array_von_python[i][next_rank - 1]);
    }
    next_value = unique1(next_value);
    for(var j=1;j<=next_value.length;j++){
        next_drop.options[j] = new Option(next_value[j-1],next_value[j-1]);  // 填入匹配的数据
        next_drop.options[0] = new Option("Ideogram " + next_rank,"");
        next_drop.options[0].setAttribute("disabled","");
        next_drop.selectedIndex = 0;  // 设置开始选项为空
    }
    // 设置父节点可见
    var super_div = next_drop.parentElement;
    super_div.style.display = "block"
}

function set_btns()  {
    // let out_li = document.createElement("li");
    // pannel.appendChild(out_li);
    let refresh = document.createElement("button");
    refresh.setAttribute("class","btn btn-info");
    refresh.setAttribute("type","button");
    refresh.setAttribute("onclick","refresh()");
    refresh.setAttribute("style","width:50%");
    refresh.innerText = "Refresh";
    let upload_key = document.createElement("button");
    upload_key.setAttribute("class","btn btn-info");
    upload_key.setAttribute("type","button");
    upload_key.setAttribute("onclick","ajaxForm(this)");
    upload_key.setAttribute("style","width:50%");
    upload_key.innerText = "Submit";
    pannel.appendChild(upload_key);
    pannel.appendChild(refresh);
}

//初始第一个下拉框
function refresh(){
    if(document.getElementById("1st-dropdown")){
        let pannel = document.getElementById("conitinue_dropdown");
        removeAllChild(pannel)
    }
    main()
}

// unique1用于去除数组中的重复
function unique1(arr){
    let hash=[];
    for (var i = 0; i < arr.length; i++) {
        if(hash.indexOf(arr[i]) === -1){
            hash.push(arr[i]);
        }
    }
    return hash;
}

function removeAllChild(major_Dom)  {
    while(major_Dom.hasChildNodes()) //当Dom下还存在子节点时 循环继续
    {
        if(major_Dom.firstChild.hasChildNodes()){
            removeAllChild(major_Dom.firstChild)
        }
        major_Dom.removeChild(major_Dom.firstChild);
    }
}


// ------------正文--------------------
//let Array_von_python = [[5,6,7,8],[6,7,8,5],[7,8,5,6],[8,5,6,7]];
let Array_von_doc = Array_von_python
let pannel = document.getElementById("conitinue_dropdown");
let first_value;
function main() {
    Array_von_python = Array_von_doc
    for (let i = 0; i < Array_von_python[0].length; i++) {
        //首先创建第一层li
        let first_li = document.createElement("li");
        let dropdown = document.createElement('select');
        let NameId = (i + 1) + "st-dropdown";
        // 除第一个外，其他的div皆隐藏
        if (i !== 0) {
            first_li.style.display = "none";
        }
        dropdown.setAttribute("id", NameId);  // 设置下拉框ID
        dropdown.setAttribute("class", "form-control"); // 设置bootstrap下拉框样式
        dropdown.setAttribute("name", NameId);
        pannel.appendChild(first_li);
        first_li.appendChild(dropdown);
        if (i !== (Array_von_python[0].length - 1)) {
            dropdown.setAttribute("onchange", "set_next(this)");
        }else{
            dropdown.setAttribute("onchange","set_btns()")
        }
    }

    let first_drop = document.getElementById("1st-dropdown");
// 值去重
    first_value = [];
    for (let i = 0; i < Array_von_python.length; i++) {  //装载某列的值在一个一维数组中
        first_value.push(Array_von_python[i][0]);
    }
    first_value = unique1(first_value);  //去除重复
// 转入到第一个下拉菜单的选项中
    for (let j = 1; j <= first_value.length; j++) {
        first_drop.options[0] = new Option("Ideogram 1", "");
        first_drop.options[0].setAttribute("disabled", "");
        first_drop.options[j] = new Option(first_value[j - 1], first_value[j - 1]);
        first_drop.selectedIndex = 0;  // 设置开始选项为空
    }
}
main();

