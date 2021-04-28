// @ts-nocheck

$(document).ready(() => {
	addLegend();
    run("crypto_major_assets_annual.csv", "annual");
	$("#annual").on('click', () => {
		run("crypto_major_assets_annual.csv", "annual");
		getReturnData();
		clear('bottomtable');
		$("#annual").addClass("btn-active");
		$("#monthly").removeClass("btn-active");
	});

	$("#monthly").on('click', () => {
		run("crypto_major_assets.csv", "monthly");
		getReturnData();
		clear('bottomtable');
		$("#monthly").addClass("btn-active");
		$("#annual").removeClass("btn-active");
	});
})

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
		for (var column = 0; column < data.length; column++) {
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
function prepareData(rawdata, col_names) {
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

var csvdata = [];
var index = -1;

//function to clear inner html of certain class names
function clear(className) {
    var els = document.getElementsByClassName(className);
    for (var i=0; i<els.length;i++){
        els[i].innerHTML = "";
    }
}

function run(csvfile, key) {
	/*var date1 = new Date("2020-01-01");
	console.log(date1.getTime());
	alert(date1.getTime())*/
	var length = 0;
	d3.selectAll("svg").remove();
	d3.csv(csvfile,
        function(data) { //formats the data into a numerical array
	        const parsed = [];
	        Object.values(data).forEach(
	            function(d, i){
	                if(/\d{2}%/.test(d)) { 
	                   //convert percent to float
	                    parsed.push(parseFloat(d));
	                } else {
	                    //variable name
	                    parsed.unshift(d);
	                }
	            })
	        length = parsed.length;
	        return parsed;
        },
    function(data) {
		let col_names = data["columns"]
		col_names.shift() // get rid of "Asset Class" column
    	//set column headers
		csvdata = data;
		csvdata = prepareData(csvdata, col_names);
	});

	setTimeout(() => {
		csvdata.shift();
		var gridData = quilt(csvdata);
		var grid = d3.select("#grid")
			.append("svg")
			.attr("width","100%")
			.attr("height","100%")
			.attr("class", "grid");

		if (key == "monthly") {
			grid.attr("viewBox", "0 0 850 600");
		} else {
			grid.attr("viewBox", "0 0 730 600");
		}

		var row = grid.selectAll(".row")
			.data(gridData)
			.enter().append("g")
			.attr("class", "row");
		var column = row.selectAll(".square")
			.data(function(d) { return d; })
			.enter().append("rect")
			.attr("class","square")
			.attr("x", function(d) {	//separate the last two columns from the rest
				var limit = key == "monthly" ? 740 : 640;
				if (d.x > limit) {     //originally 841 for 1200 by 700
					d.x += 10;
					return d.x; 
				} else {
					return d.x;
				}
			})
			.attr("y", function(d) { return d.y; })
			.attr("width", function(d) { return d.width; })
			.attr("height", function(d) { return d.height; })
			.style("fill", 
				function(d) { 
					switch (d.label) {
						case "S&P 500":
							return "#080808";
						case "EAFE":
							return "#595959";
						case "EEM":
							return "#D9D9D9";
						case "HFRX":
							return "#cfda0e";
						case "RealEst.":
							return "#FF6161";
						case "Agg":
							return "#66ECFF";
						case "Comm.":
							return "#FF9999";
						case "BTC":
							return "#FFC000";
						case "60/40":
							return "#079A88";
						case "1% BTC":
							return "#7AFFBD";
						case "5% BTC":
							return "#00FB7E";
						default:
						return "white" //labels at top
					}		
				})
			.style("stroke", "#fff");

		d3.selectAll('rect').on("mouseover", function(d) { //highlight all squares of same color
		    var undermouse = $(this).attr('style');
		    d3.selectAll('rect').transition().style('opacity',function () {
		        return ($(this).attr('style') === undermouse) ? 1.0 : 0.2;
		    });
		});

		d3.selectAll('rect').on("mouseleave", function(d) { //clears effect
			d3.selectAll('rect').transition().style('opacity',1.0);
		});
		/*****************begin table stuff*****************/
		d3.selectAll(".averages").remove();
		
		summLabels = ["Best", "Worst", "Average"];
		var svg = d3.select("#averages")
			.append("svg")
			.attr("width","100%")
			.attr("height","100%")

		if (key == "monthly") {
			svg.attr("viewBox", "0 0 920 150");
		} else {
			svg.attr("viewBox", "0 0 800 150");
		}

		row1 = svg.append('g')
			.attr("class", "row")
			.attr("transform", "translate(100, 50)")	

		row1.selectAll(".text") //Best values
			.data(gridData[1])
			.enter()
			.append("text")
			.style("fill", "black")
			.attr("text-anchor", "middle")
			.attr("font-size", 13)
			.attr("x", function(d) { return d.x; } )
			.attr("y", 0 ) 
			.attr("pointer-events","none")
			.text(function(d) { 
				return d.value ? d.value + "%" : "" ; 
			});

		row1.selectAll(".text") //Worst values
			.data(gridData[11])
			.enter()
			.append("text")
			.style("fill", "black")
			.attr("text-anchor", "middle")
			.attr("font-size", 13)
			.attr("x", function(d) { return d.x; } )
			.attr("y", 0 ) 
			.attr("pointer-events","none")
			.text(function(d) { 
				return d.value ? d.value + "%" : "" ; 
			})
			.attr("transform", "translate(0, 30)");

		var row2 = svg.append("g")
			.attr("class", "row")
			.attr("transform", "translate(100, 110)");

		row2.selectAll("text") // Average values
			.data(csvdata.filter(function(d, i) { return i < length - 1; }))
			.enter()
			.append('text')
			.text(function(d){ 
		    	var sum = 0;
		    		for(var i = 1; i < d.length; i++){
		    			sum += d[i][0];
		    		}
		    		return Math.round((sum/11) * 100)/100 + "%";
		    	}
		    )
		    .style("fill", "black")
			.attr("text-anchor", "middle")
			.attr("font-size", 13)
			.attr("x", function(d, i) { 
				return i === length - 2 ? i * 60 + 11 : i * 60 + 1;
			})
			.attr("y", 0 ) 
			.attr("pointer-events","none");

		var summaryLabels = svg.selectAll(".label")
			.data(summLabels)
			.enter().append("text")
			.text(function(d) { return d; })
			.attr("x", 0)
			.attr("y", function(d, i) { return i * 30})
			.attr("class", "label")
			.style("text-anchor", "start")
			.style("display", "block")
			.style("font-weight", "bold")
			.style("font-size", "12")
			.attr("transform", "translate(5, 50)")

		/*****************end table stuff*****************/

		// labels for the quilt
		var text = row.selectAll(".text") //grid labels
			.data(function(d) { return d; })
			.enter()
			.append("text")
			.style("fill", function(d) {
				if (d.label == "1% BTC" || d.label == "5% BTC") {
					return "#838383";
				} else {
					return d.value ? "white" : "black" 
				}
			})
			.attr("text-anchor", "middle")
			.attr("font-size", 11)
			.attr("font-weight", "bold")
			.attr("x", function(d) { return d.x + 30; } )
			.attr("y", function(d) { return d.y + 20;} ) 
			.attr("pointer-events","none")
		if (key == "monthly") {
			text.html( function (d) 
				{
					// The only to add \n to an SVG text.
					if (d.value) { return d.label } // if there's a value (not a table header) then return the normal label
					let l = d.label.split(" ") // table header, split it so we can put the parts on different levels
					var x = d3.select(this).attr("x"); // get the x position of the text
					var y = d3.select(this).attr("dy"); // get the y position of the text
					var t = "<tspan x=" + x + " dy=" + (+y + 15) + ">" + l[1] + "</tspan>";
					return l[0] + t; // appending it to the html
				}
			);
		} else {
			text.text(function(d) { return d.label; } );
		}

		row.selectAll(".text") //grid values
			.data(function(d) { return d; })
			.enter()
			.append("text")
			.style("fill", "white")
			.attr("text-anchor", "middle")
			.attr("font-size", 11)
			.attr("x", function(d) { return d.x + 30; } )
			.attr("y", function(d) { return d.y + 35; } ) 
			.attr("pointer-events","none")
			.text(function(d) { 
				return d.value ? d.value + "%" : "" ; 
			});
	}, 500);
}

function addLegend(){
    if (document.getElementById('assetlegend')) {
        return;
    };//element already exists, dont create again

    var ul = document.createElement('ul')

    ul.id = "assetlegend";
    ul.className = "list-group";
    ul.innerHTML= `
        <li class="tooltip btc-color">1% BTC 
            <span class="top">59% S&P 500<br>40% Barclays Agg., 1% Bitcoin</span>
       	</li>
       	<li class="tooltip btc-color">5% BTC
            <span class="top">55% S&P 500<br>40% Barclays Agg., 5% Bitcoin</span>
       	</li>
       	<li class="tooltip">BTC
            <span class="top">Bitcoin Cryptocurrency</span>
       	</li>
       	<li class="tooltip">Comm.
            <span class="top">Commodities: BCOMTR Index</span>
        </li>
        <li class="tooltip">S&P 500
            <span class="top">Standard & Poor 500 Index</span>
        </li>
        <li class="tooltip">RealEst.
            <span class="top">Real Estate: DJUSRET Index</span>
        </li>
        <li class="tooltip">60/40
            <span class="top">60% S&P 500<br>40% Barclays Aggregate</span>
        </li>
        <li class="tooltip">Agg
            <span class="top">Barclays Aggregate Index</span>
        </li>
        <li class="tooltip">HFRX
            <span class="top">HFRXGL Index</span>
        </li>
        <li class="tooltip">EAFE
            <span class="top">Non-North American developed markets (MSCI EAFE)<br> NDDUEAFE Index</span>
        </li>
        <li class="tooltip">EEM
            <span class="top">Emerging Markets: NDUEEGF Index</span>
        </li>
    `;
    $('#legend').append(ul);
}