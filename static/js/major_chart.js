function customized_sankey_chart(callbackDom, outside_object){
    let dataset = [];
    for(let i in outside_object){
        dataset.push(outside_object[i]);
    }

    function justice_type(element){   // 该函数为str2num的辅助函数，判断传入的参数的数据类型，主要为对象、数组，其余的均归为字符串（伪）
        if((typeof element) != "object") {
            return "string"
        }else if(Array.isArray(element) == true){
            return "array"
        }else{
            return "object"
        }
    }

    function str2num(data){   // 函数用于静态的将外部传入的数据中每个可能的字符串变为数字
        let datatype = justice_type(data);
        if(datatype == "string"){
            data = parseFloat(data);
            return data
        }else if(datatype == "array"){
            for(let i=0; i < data.length; i++){
                data[i] = str2num(data[i])
            }
            return data
        }else if(datatype == "object"){
            for(let i in data){
                data[i] = str2num(data[i])
            }
            return data
        }
    }

    dataset = str2num(dataset);  // 先验检查，字符串转数字
    let maxEnd = 0;
    let restRect = [];

    for (let i = 0; i < dataset.length; i++) {
        let singleRowArr = [];
        let singleRowObj = [];
        for (let j = 0; j < dataset[i].length; j++) {
            dataset[i][j]["length"] = dataset[i][j].end - dataset[i][j].start;  // 计算出每个{}中的长度，即矩形块的长度
            for (let k = 0; k < dataset[i][j].data.length; k++) {
                dataset[i][j].data[k]["length"] = dataset[i][j].data[k].end - dataset[i][j].data[k].start
            }
            singleRowArr.push(dataset[i][j].start, dataset[i][j].end);  // 将每个起始点和结束点放入数组中，排序
            if (dataset[i][j].end > maxEnd) {  // 算出末端的位置
                maxEnd = dataset[i][j].end;
            }
        }
        singleRowArr = singleRowArr.sort(function(a, b){return a - b});               // 升序排序，避免原生序数混乱
        for (let k = 1; k < (singleRowArr.length - 1); k += 2) {  // 在for中重新定义剩下的空白区域
            let newStart = singleRowArr[k] + 1;
            let newEnd = singleRowArr[k + 1] - 1;
            let newLen = newEnd - newStart;
            singleRowObj.push({start: newStart, end: newEnd, length: newLen});
        }
        restRect.push(singleRowObj);
    }

    var t_dataset = dataset[0].map(function (col, i) {  // 转置二维数组
        return dataset.map(function (row) {
            return row[i];
        })
    });

    var t_rest = restRect[0].map(function (col, i) {  // 转置二维数组
        return restRect.map(function (row) {
            return row[i];
        })
    });

    var anchor = document.getElementById("svg-anchor")
    var width = anchor.clientWidth;
    var height = anchor.clientHeight;
    var padding = {left: 60, right: 40, top: 40, bottom: 40};
    var svg = d3.select("#chart")
        .attr("width", width)
        .attr("height", height);

    var xScale = d3.scale.ordinal()  // x轴比例尺
        .domain(d3.range(t_dataset[0].length))
        .rangeRoundBands([0, width - padding.left - padding.right]);
    var yScale = d3.scale.linear()  // y轴比例尺
        .domain([1, maxEnd])
        .range([height - padding.top - padding.bottom, 0]);
    var hScale = d3.scale.linear()  // 高度比例尺
        .domain([1, maxEnd])
        .range([1, height - padding.top - padding.bottom]);
    var color = d3.scale.category20();
    // 矩形中的空白
    var rectPadding = height / 500;
    var rectWidth = width / t_dataset[0].length / 3;
    if (rectWidth > 50) {
        rectWidth = 40
    } else if (rectWidth < 10) {
        rectWidth = 10
    }

    let group = svg.selectAll('g')  // 直接绑定数据
        .data(t_dataset)
        .enter()
        .append('g')
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

    for (let i = 0; i < t_rest.length; i++) {  // 为染色体间隔区生成适量的g
        svg.append('g')
            .attr("class", "restG")
    }
    restGroup = svg.selectAll(".restG")  // 为每个g填充数据
        .data(t_rest)
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

    function path_generator2(leftObj,rightObj) {  // 生成路径的各个节点
        var d_f = ["M", (+leftObj.attr("x") + rectWidth), leftObj.attr("y"),
            "L", (+leftObj.attr("x") + rectWidth), +leftObj.attr("y") + +leftObj.attr("height"),
            "L", +rightObj.attr("x"), +rightObj.attr("y") + +rightObj.attr("height"),
            "L", +rightObj.attr("x"), +rightObj.attr("y"),
            "L", (+leftObj.attr("x") + rectWidth), +leftObj.attr("y")
        ];
        return d_f.join(" ")
    }

    function path_get_rect(obj,rectType){
        let id = d3.select(obj).attr("id");
        let start = id.search("x");
        let middle = id.search("y");
        let end = id.search("qq");
        if(rectType === "normal"){
            let col = id.substring(start + 1, middle);
            let row = id.substring(middle + 1, end);
            let col1 = +col + 1;
            let leftRectId = "normal" + "x" + col + "y" + row +"qq";
            let rightRectId = "normal" + "x" + col1 + "y" + row +"qq";
            let leftRect = d3.select(obj.parentNode).select("#"+leftRectId);
            let rightRect = d3.select("#"+rightRectId);
            return([leftRect, rightRect])
        }else if(rectType === "gene"){
            let extra = id.search("z");
            let col = id.substring(start + 1, middle);
            let col1 = +col + 1;
            let outer_row = id.substring(middle + 1, extra);
            let inner_row = id.substring(extra + 1, end);
            let leftRectId = "gene" + "x" + col + "y" + outer_row + "z" + inner_row +"qq";
            let rightRectId = "gene" + "x" + col1 + "y" + outer_row + "z" + inner_row +"qq";
            let leftRect = d3.select("#" + leftRectId);
            let rightRect = d3.select("#" + rightRectId);
            return([leftRect, rightRect])
        }
    }

    for (let x = 0; x < t_dataset[0].length; x++) {
        group.append("rect")
            .attr("display", "none")
            .attr("class", "normal_block")
            .attr("id",function(d,i) {
                return "normal" + "x" + x + "y" + i + "qq"
            })
            .attr("x", function (d, i) {
                return xScale(x)
            })
            .attr("y", function (d) {
                return yScale(d[x].end)
            })
            .attr("width", rectWidth)
            .attr("height", function (d) {
                return hScale(d[x].length) - rectPadding
            })
            .attr("fill", function (d, i) {
                return color(i)
            })
            .each(function (d,j) {
                // 此处的上下文指向相关的dom元素
                second_g = d3.select(this.parentNode)
                    .append('g')
                    .attr("class","second_g" + x)
                    .attr("id",function(d,i){
                        return x
                    });
                second_g.selectAll(".geneNode")
                    .data(d[x].data)
                    .enter()
                    .append("rect")
                    .attr("display", "none")
                    .attr("class","gene")
                    .attr("id",function(d,i){
                        return "gene" + "x" + x + "y" + j + "z" + i + "qq"
                    })
                    .attr("x", function (d, i) {
                        return xScale(x)
                    })
                    .attr("y", function (d) {
                        return yScale(d.end)
                    })
                    .attr("width", rectWidth)
                    .attr("height", function (d) {
                        return hScale(d.length)
                    })
                    .attr("fill", function (d, i) {
                        return "Silver"
                    });
            });

        group.append("rect")  // 每个块block的蒙版，用于展示特效
            .attr("class", "special_block")
            .attr("id",function(d,i) {
                return "special" + "x" + x + "y" + i + "qq"
            })
            .attr("x", function (d, i) {
                return xScale(x)
            })
            .attr("y", function (d) {
                return yScale(d[x].end)
            })
            .attr("width", rectWidth)
            .attr("height", function (d) {
                return hScale(d[x].length)
            })
            .attr("fill", function (d, i) {
                return color(i)
            })
            .each(function (d,j) {
                // 此处的上下文指向相关的dom元素
                second_g = d3.select(this.parentNode)
                    .append('g')
                    .attr("class", "second_g" + x)
                    .attr("id", function (d, i) {
                        return x
                    });
                second_g.selectAll(".specialGeneNode")
                    .data(d[x].data)
                    .enter()
                    .append("rect")
                    .attr("class", "specialGene")
                    .attr("id", function (d, i) {
                        return "specialGene" + "x" + x + "y" + j + "z" + i + "qq"
                    })
                    .attr("x", function (d, i) {
                        return xScale(x)
                    })
                    .attr("y", function (d) {
                        return yScale(d.end)
                    })
                    .attr("width", rectWidth)
                    .attr("height", function (d) {
                        return hScale(d.length)
                    })
                    .attr("fill", function (d, i) {
                        return "Silver"
                    });
            });

        // 染色体块间隔区绘制
        restGroup.append("rect")
            .attr("x", function (d, i) {
                return xScale(x)
            })
            .attr("y", function (d) {
                return yScale(d[x].end)
            })
            .attr("width", rectWidth)
            .attr("height", function (d) {
                return hScale(d[x].length)
            })
            .attr("fill", "Silver")
            .attr("opacity", 0.9);

        // 画框间的连线
        // if (x !== (t_dataset[0].length - 1)) {
        if(x !== 0){
            let vx = x -1;
            group.append("path")
                .attr("class", "block_path")
                .attr("id",function(d,i) {
                    return "Block" + "x" + vx + "y" + i + "qq"
                })
                .attr("d", function (d, i) {
                    let both_side_rect = path_get_rect(this, "normal");
                    return path_generator2(both_side_rect[0], both_side_rect[1])
                })
                .attr("stroke", "white")
                .attr("stroke-width", 0.5)
                .attr("fill", function (d, i) {
                    return color(i)  // 生成随机颜色
                })
                .attr("opacity", 0.5)
                .each(function (sel,j){
                    d3.select(this.parentNode)
                        .selectAll('.genePath')
                        .data(sel[x].data)
                        .enter()
                        .append("path")
                        .attr("class", "gene_path")
                        .attr("id",function(d,i){
                            return "genePath" + "x" + vx + "y" + j + "z" + i + "qq"
                        })
                        .attr("d", function (d, i) {
                            let both_side_rect = path_get_rect(this, "gene");
                            return path_generator2(both_side_rect[0], both_side_rect[1])
                        })
                        .attr("stroke", "white")
                        .attr("stroke-width", 0.1)
                        .attr("fill", function (d, i) {
                            return "Silver"  // 指定银灰色
                        })
                })
        }
    }

    function find_max(arr) {
        let maxEnd = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].end > maxEnd) {
                maxEnd = arr[i].end
            }
        }
        return maxEnd
    }

    function find_min(arr) {
        let minStart = arr[0].start;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].start < minStart) {
                minStart = arr[i].end
            }
        }
        return minStart
    }

    group.on("mouseover", function (d, i) {
        group.attr("display", "none");  // 隐藏其他的块
        restGroup.attr("display", "none");
        let current_max = find_max(d);
        let current_min = find_min(d);
        yScale.domain([current_min, current_max])
            .range([height - padding.top - padding.bottom, 0]);
        hScale.domain([1, current_max - current_min])
            .range([0, height - padding.top - padding.bottom]);

        function find_Mr_rect(obj, value, function_type){  //
            let id = d3.select(obj).attr("id");
            let start = id.search("x");
            let middle = id.search("y");
            let end = id.search("z");
            let col = id.substring(start + 1, middle);
            let row = id.substring(middle + 1, end);
            let RectId = "normal" + "x" + +col + "y" + +row + "qq";
            let selected_Rect = d3.select("#" + RectId);
            if(function_type === "y"){
                let smallScale = d3.scale.linear()
                    .domain([selected_Rect.data()[0][col].start, selected_Rect.data()[0][col].end])
                    .range([+selected_Rect.attr("y") + +selected_Rect.attr("height"), +selected_Rect.attr("y")]);
                return smallScale(value)
            } else if(function_type === "height"){
                let smallScale = d3.scale.linear()
                    .domain([0, selected_Rect.data()[0][col].length])
                    .range([0, +selected_Rect.attr("height")])
                return smallScale(value)
            }else{
                return undefined
            }
        }

        d3.select(this)
            .attr("display", "block")
            .selectAll(".block_path")
            .transition()
            .duration(1000)
            .delay(500)
            .attr("d", function (d, index) {
                let both_side_rect = path_get_rect(this, "normal");
                both_side_rect[0]
                    .attr("y", 0)
                    .attr("height", function (d, i) {
                        // return hScale(d[index].length) - rectPadding
                        return height - padding.bottom - padding.top
                    });
                both_side_rect[1]
                    .attr("y", 0)
                    .attr("height", function (d, i) {
                        // return hScale(d[index+1].length) - rectPadding});
                        return height - padding.bottom - padding.top;
                    });
                return path_generator2(both_side_rect[0], both_side_rect[1])
            });

        d3.select(this).selectAll(".gene_path")
            .transition()
            .duration(1000)
            .delay(500)
            .attr("d", function (d, index) {
                let both_side_rect = path_get_rect(this, "gene");
                both_side_rect[0]
                    .attr("y", function (d) {
                        return find_Mr_rect(this, d.end, "y");
                    })
                    .attr("height", function (d, i) {
                        return find_Mr_rect(this, d.length, "height");
                        // return hScale(d.length);
                    });
                both_side_rect[1]
                    .attr("y", function (d) {
                        return find_Mr_rect(this, d.end, "y")
                    })
                    .attr("height", function (d, i) {
                        return find_Mr_rect(this, d.length, "height");
                        // return hScale(d.length) - rectPadding;
                    });
                return path_generator2(both_side_rect[0], both_side_rect[1]);
            })

        d3.select(this)   // 在蒙版中实现动画过程
            .selectAll(".special_block")
            .transition()
            .duration(1000)
            .delay(500)
            .attr("y", 0)
            .attr("height", function (d, i) {
                return height - padding.bottom - padding.top
            });

        d3.select(this)
            .selectAll(".specialGene")
            .transition()
            .duration(1000)
            .delay(500)
            .attr("y", function (d) {
                return find_Mr_rect(this, d.end, "y")
            })
            .attr("height", function (d, i) {
                return find_Mr_rect(this, d.length, "height");
            })
    });

    group.on("mouseout", function (d, i) {
        yScale.domain([1, maxEnd])
            .range([height - padding.top - padding.bottom, 0]);
        hScale.domain([1, maxEnd])
            .range([1, height - padding.top - padding.bottom]);

        d3.select(this)
            .selectAll(".normal_block")
            .attr("y", function(d,i){
                return yScale(d[i].end)
            })
            .attr("height", function (d, i) {
                return hScale(d[i].length)
            });

        d3.select(this).selectAll(".gene")
            .attr("y", function (d) {
                return yScale(d.end)
            })
            .attr("height", function (d) {
                return hScale(d.length)
            });

        d3.select(this)   // 在蒙版中实现动画过程
            .selectAll(".special_block")
            .transition()
            .duration(1000)
            .delay(500)
            .attr("y", function(d,i){
                return yScale(d[i].end)
            })
            .attr("height", function (d, i) {
                return hScale(d[i].length)
            });

        d3.select(this).selectAll(".specialGene")
            .transition()
            .duration(1000)
            .delay(500)
            .attr("y", function (d) {
                return yScale(d.end)
            })
            .attr("height", function (d) {
                return hScale(d.length)
            });


        d3.select(this)
            .selectAll(".block_path")
            .transition()
            .duration(1000)
            .delay(500)
            .attr("d", function (d, i) {
                let both_side_rect = path_get_rect(this, "normal");
                return path_generator2(both_side_rect[0], both_side_rect[1])
            })

        d3.select(this).selectAll(".gene_path")
            .transition()
            .duration(1000)
            .delay(500)
            .attr("d", function (d, i) {
                let both_side_rect = path_get_rect(this, "gene");
                return path_generator2(both_side_rect[0], both_side_rect[1])
            })


        group.attr("display", "block");

        restGroup.attr("display", "block");
    })

    // 设置每个染色体底部的标签
    var texts = svg.selectAll(".mytest")
        .data(d3.range(0, t_dataset[0].length))
        .enter()
        .append("text")
        .attr("class","MyText")
        .attr("transform","translate(" + padding.left + "," + padding.top + ")")
        .attr("x", function(d,i){
            return xScale(i)
        } )
        .attr("y", function(d,i){
            return yScale(padding.top/2)
        })
        .text(function(d,i) {
            return "Ideogram" + (+d + 1)
        })
}


