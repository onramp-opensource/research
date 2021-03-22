
/*
*Organizes the data in such a way that it is easy for the 
*'quilt' method to read and work with. Accepts raw data
*as formatted by the d3.CSV method, 
*/

document.getElementById("monthly").onclick =function() {
	run("crypto_major_assets.csv", "monthly");
	clear('bottomtable');
	addLegend();
};

function run_crypto(csvfile, key) {
	var index = 0;
	d3.selectAll("svg").remove();
	d3.csv(csvfile,
		function(data) { //formats the data into a numerical array
            const parsed = [];
			Object.values(data).forEach(
				function (d, i) {
					if (i == 0) { //first element is title beware of % in bitcoin title
						parsed.push(d);
					}
					else {
						//convert percent to float
						parsed.push(parseFloat(d));
					}
				})
			index = parsed.length;
            return parsed;
		}, 
		function(data) {
			let col_names = data["columns"]
			col_names.shift() // get rid of "Asset Class" column
        	//set column headers
			csvdata = data;
			csvdata = prepareData(csvdata, col_names);
		},
    );

	setTimeout( function() {
		csvdata.shift(); // remove empty element
		var gridData = quilt(csvdata);
		var grid = d3.select("#grid")
			.append("svg")
			.attr("width","100%")
			.attr("height","100%")
		if (key == "monthly") {
			grid.attr("viewBox", "0 0 870 600");
		} else {

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
				if (d.x > limit) {
					d.x += 20;    //originally 841 for 1200 by 700
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
					    case "RealEst.":
					    	return "#FF6161";
						default:
							return "white" //labels at top
					}		
				})
			.style("stroke", "#fff");

		d3.selectAll('rect').on("mouseover", function(d) { //highlight all squares of same color
		    var undermouse = $(this).attr('style');
		    d3.selectAll('rect').transition().style('opacity',function () {
		        return ($(this).attr('style') === undermouse) ? 1.0 : 0.3;
		    });
		});

		d3.selectAll('rect').on("mouseleave", function(d) { //clears effect
			d3.selectAll('rect').transition().style('opacity',1.0);
		});

		/*****************begin table stuff*****************/
		d3.selectAll(".averages").remove();
		var avgtable1 = d3.select("#averages")
			.append("table")
			.classed("table", true)
			.classed("table-sm", true)
			.classed("monthly", true)

		// best
		tr1 = avgtable1.append('tr')
		tr1.append('th').attr('scope','row').text("Best")
		tr1.selectAll('td')
			.data(csvdata.filter(function(d, i) { return i < index - 1; }))
			.enter()
			.append('td')
			.text(function(d) { 
				console.log("d", d)
				return d[1][0] + "%"; 
			});

		// worst
		tr2 = avgtable1.append("tr") 
		tr2.append('th').attr('scope','row').text("Worst")
		tr2.selectAll('td')
		  	.data(csvdata.filter(function(d, i) { return i < index - 1; }))
		  	.enter()
		  	.append('td')
		    .text(function(d) { return d[11][0] + "%"; });

		tr3 = avgtable1.append("tr") // average
		tr3.append('th').attr('scope','row').text("Average")
		tr3.selectAll('td')
		    .data(csvdata.filter(function(d, i) { return i < index - 1; }))
		    .enter()
		    .append('td')
		    .text(function(d){ 
		    	var sum = 0;
		    		for(var i = 1; i < d.length; i++){
		    			sum += d[i][0];
		    		}
		    		return Math.round((sum/11) * 100)/100 + "%";

		    	}
		    );

		/*****************end table stuff*****************/

	    // labels for the quilt
		var text = row.selectAll(".text") //grid labels
			.data(function(d) { return d; })
			.enter()
			.append("text")
			.style("fill", function(d) {
				return d.value ? "white" : "black"
			}) 
			.attr("text-anchor", "middle")
			.attr("font-size", 11)
			.attr("font-weight", "bold")
			.attr("x", function(d) { return d.x + 30; } )
			.attr("y", function(d) { return d.y + 20;} ) 
			.attr("pointer-events","none")
			.html( function (d) 
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
	}, 300);
}

var csvdata = [];

var index = -1;

