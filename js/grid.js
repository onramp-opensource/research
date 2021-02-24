function quilt(data, options) {
	var squares = new Array();
	var xpos = 1;
	var ypos = 1;
	var width = 60;
	var height = 50;

	// iterate for rows
	for (var row = 0; row < data[0].length; row++) {
		squares.push( new Array() );
		//iterate for cells/columns inside rows
		for (var column = 0; column < data.length; column++){
			squares[row].push({
				label: data[column][row][1],
				value: data[column][row][0],
				x: xpos,
				y: ypos,
				width: width,
				height: height,
			});
			// increment the x position. I.e. move it over by 50 (width variable)
			xpos += width;
		}
		// reset the x position after a row is complete
		xpos = 1;
		// increment the y position for the next row. Move it down 50 (height variable)
		ypos += height;	
	}
	return squares;
}
/*
*Organizes the data in such a way that it is easy for the 
*'quilt' method to read and work with. Accepts raw data
*as formatted by the d3.CSV method, 
*/
function prepareData(rawdata, col_names){
	console.log("raw", rawdata)
	var prepared = [];
	for (var year = 1; year < rawdata[0].length; year++) {
		var q = [];
		var i = 0;
		for (var sector = 0; sector < rawdata.length; sector++) {
			q[i] = [];
			q[i][0] = rawdata[sector][year];
		 	q[i][1] = rawdata[sector][0];
		 	i++;
		}
		isort(q);
		q.reverse(); //reverse sorted data so that highest value is on top row

		let x = [null,col_names[year - 1]]
		q.unshift(x)

		prepared[year] = q;
	}
	console.log("prepaer", prepared)
	return prepared;
}

function isort(values) { //sort data in each column
  var length = values.length;
  for(var i = 1; i < length; ++i) {
    var temp = values[i];
    var j = i - 1;
    for(; j >= 0 && values[j][0] > temp[0]; --j) {
      values[j+1] = values[j];
    }
    values[j+1] = temp;
  }
};

// We may want to use this to flip between the annual quilt chart and the monthly chart
/*
document.getElementById("stockprice").onclick = function(){ //generate stockprice chart 
	$("#heading").text("Stock Price Return");
	clear('bottomTable');
    run("stocks.csv");
};

document.getElementById("divgrowth").onclick = function(){ //generate dividend growth chart
	$("#heading").text("Dividend Growth");
	clear('bottomTable');
	run("divgrowth.csv");
};
*/

var csvdata = [];
var index = -1;

//function to clear inner html of certain class names
function clear(className){
    var els = document.getElementsByClassName(className);
    for (var i=0; i<els.length;i++){
        els[i].innerHTML = "";
    }
}

function run(csvfile){
	d3.selectAll("svg").remove();
	d3.csv(csvfile,
        function(data) { //formats the data into a numerical array
        const parsed = [];
        Object.values(data).forEach(
            function(d, i){
                if(/%/.test(d)){ 
                   //convert percent to float
                    parsed.push(parseFloat(d));
                }
                else{
                    //variable name
                    parsed.unshift(d);
                }
                })
        return parsed;
        },
    function(data) {
			d3.selectAll(".columnHeaders").remove(); //remove data before generating new
			//set column headers
			var columns = d3.select("#columnHeaders")
			.append("table");
			columns.attr("class","columnHeaders")
			.append("tr")
			.selectAll('td')
		  	.data(data["columns"])
		  	.enter()
		  	.append('td')
		  	.attr("class","columnData")
		  	.style("padding-left", function(d){ if(d=="Cum"){return 25;}} )
		    .text(function (d) { if(d=="Sector"){return;} return d; })
		    .attr("width","1020px")

			csvdata = data;
			csvdata = prepareData(csvdata);
		});

	setTimeout(function(){
	csvdata.shift();
	var gridData = quilt(csvdata);

	var grid = d3.select("#grid")
		.append("svg")
		.attr("width","80%")
		.attr("height","60%")
		.attr("viewBox", "0 0 920 579");

	d3.select(window).on("resize",function(){
		var targetWidth = chart.node().getBoundingClientRect().width;
		grid.attr("width",targetWidth);
		console.log(targetWidth);
	});
		
	var row = grid.selectAll(".row")
		.data(gridData)
		.enter().append("g")
		.attr("class", "row");

	var column = row.selectAll(".square")
		.data(function(d) { return d; })
		.enter().append("rect")
		.attr("class","square")
		.attr("x", function(d) {	//separate the last two columns from the rest
			if(d.x >= 841){     //originally 841 for 1200 by 700
				d.x += 15;
				return d.x; 
			}
			else{
				return d.x;
			}
		})
		.attr("y", function(d) { return d.y; })
		.attr("width", function(d) { return d.width; })
		.attr("height", function(d) { return d.height; })
		.style("fill", function(d) { 
							switch (d.label) {
							    case "S&P 500":
							        return "#ff99af";
							    case "InfoTech":
							        return "#d6922c";
							    case "Industrial":
							        return "#21600d";
							    case "ConsDiscr":
							        return "#1a287f";
							    case "ConsStap":
							        return "#5789a5";
							    case "Financials":
							        return "#3d963f";
							    case "Energy":
							    	return "#225059";
							    case "TeleServ":
							    	return "#575757";
							    case "Utilities":
							    	return "#571172";
							    case "Materials":
							    	return "#000000";
							    case "Healthcare":
							    	return "#687172";
							    case "RealEstate":
							    	return "#884000";
                                case "CommServ":
                                    return "#d9782e";
							}		
						})
		.style("stroke", "#fff");

	d3.selectAll('rect').on("mouseover", function(d) { //highlight all squares of same color
	    var undermouse = $(this).attr('style');
	    d3.selectAll('rect').transition().style('opacity',function () {
	        return ($(this).attr('style') === undermouse) ? 1.0 : 0.3;
	    });
	});
	//alternative hover effect with rotating squares
	/*.on('mouseover', function(d) {
			d3.select(this).transition().attr("width", 0).attr("x", d.x+30);
			d3.select(this).transition().delay(230).attr("width", d.width).attr("x", d.x);
	});*/

	d3.selectAll('rect').on("mouseleave", function(d) { //clears effect
		d3.selectAll('rect').transition().style('opacity',1.0);
	});
/*****************begin table stuff*****************/
	d3.selectAll(".averages").remove();

	var avgtable = d3.select("#averages")
	.append("table")
	.attr("class","averages");
	

	avgtable.append("tr") // best
	.selectAll('td')
	.data(["Best"])
	.enter()
	.append('td')
	.attr("class","averageData")
	.text(function(d) { return d; });

	avgtable.append("tr") // worst
	.selectAll('td')
	.data(["Worst"])
	.enter()
	.append('td')
	.attr("class","averageData")
	.text(function(d) { return d; });

	avgtable.append("tr") // average
	.selectAll('td')
	.data(["Average"])
	.enter()
	.append('td')
	.attr("class","averageData")
	.text(function(d) { return d; });

	var avgtable1 = d3.select("#averages")
	.append("table")
	.attr("class","averages");

	avgtable1.append("tr") // best
	.selectAll('td')
	.data(csvdata.filter(function(d, i) { return i <= 13; }))
	.enter()
	.append('td')
	.attr("class","averageData")
	.text(function(d) { return d[0][0] + "%"; });

	avgtable1.append("tr") // worst
	.selectAll('td')
  	.data(csvdata.filter(function(d, i) { return i <= 13; }))
  	.enter()
  	.append('td')
  	.attr("class","averageData")
    .text(function(d) { return d[10][0] + "%"; });

    avgtable1.append("tr") // average
    .selectAll('td')
    .data(csvdata.filter(function(d, i) { return i <= 13; }))
    .enter()
    .append('td')
    .attr("class","averageData")
    .text(function(d){ 
    	var sum = 0;
    		for(var i = 0; i < d.length; i++){
    			sum += d[i][0];
    		}
    		return Math.round((sum/11) * 100)/100 + "%";

    	});

    var avgtable2 = d3.select("#averages")
    .append("table")
    .attr("class", "averages")
    .style("margin-left", 18)
    .style("margin-right", 0)
    //.style("padding-left",20);


    avgtable2.append("tr") // best
    .selectAll('td')
    .data(csvdata.filter(function(d, i) { return i > 13; }))
    .enter()
    .append('td')
    .attr("class", "averageData")
    .style("margin-left", 50)
    .text(function(d){return d[0][0] + "%";});

    avgtable2.append("tr") //worst
    .selectAll('td')
    .data(csvdata.filter(function(d, i) { return i > 13; }))
    .enter()
    .append('td')
    .attr("class", "averageData")
    .style("margin-left", 0)
    .text(function(d){return d[10][0] + "%";});

    avgtable2.append("tr") //average
    .selectAll('td')
    .data(csvdata.filter(function(d, i) { return i > 13; }))
    .enter()
    .append('td')
    .attr("class", "averageData")
    .style("margin-left", 0)
    .text(function(d){ 
    	var sum = 0;
    		for(var i = 0; i < d.length; i++){
    			sum += d[i][0];
    		}
    		return Math.round((sum/11) * 100)/100 + "%";

    	});

/*****************end table stuff*****************/

	var text = row.selectAll(".text") //grid labels
		.data(function(d) { return d; })
		.enter()
		.append("text")
		.style("fill", function(d) { 
			//if (d.label == "S&P 500"){
			//	return "rgb(67, 73, 84)";
			//}
			//else{
				return "white";
			//}
		})
		.style("font-family", "helvetica")
		.attr("text-anchor", "middle")
		.attr("font-size", 11)
		.attr("x", function(d) { return d.x + 30; } )
		.attr("y", function(d) { return d.y + 20;} ) 
		.attr("pointer-events","none")
		.text(function(d) { return d.label; } );

	row.selectAll(".text") //grid values
		.data(function(d) { return d; })
		.enter()
		.append("text")
		.style("fill", function(d) { 
			//if (d.label == "S&P 500"){
			//	return "rgb(67, 73, 84)";
			//}
			//else{
				return "white";
			//}
		})
		.style("font-family", "helvetica")
		.attr("text-anchor", "middle")
		.attr("font-size", 11)
		.attr("x", function(d) { return d.x + 30; } )
		.attr("y", function(d) { return d.y + 35; } ) 
		.attr("pointer-events","none")
		.text(function(d) { return d.value + "%"; } );
	},300);
}

// run("divgrowth.csv");