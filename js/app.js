
/*
*Organizes the data in such a way that it is easy for the 
*'quilt' method to read and work with. Accepts raw data
*as formatted by the d3.CSV method, 
*/

function run_crypto(csvfile){
	d3.selectAll("svg").remove();
	d3.csv(csvfile,
		function(data) { //formats the data into a numerical array
            const parsed = [];
			Object.values(data).forEach(
            function(d, i){
                if(i==0){ //first element is title beware of % in bitcoin title
                    parsed.push(d);
                }
                else{
                   //convert percent to float
                    parsed.push(parseFloat(d));
                }
                })
            return parsed;
		}, 
		function(data) {
        	//set column headers
			var columns = d3.select("#columnHeaders")
			.append("tr")
			.selectAll('th')
		  	.data(data["columns"])
		  	.enter()
		  	.append('th')
			  .attr("class","columnData")
		  	.attr("scope","col")
		  	.style("padding-left", function(d){
				if(d=="YTD"){
					return "3rem";
				}
			} )
		    .text(function(d){ if(d=="Asset Class"){
			return; 
			    //don't add rectangle for asset class
		    } return d; })
		    //.attr("width",function(d){
			//    if(d=="Asset Class"){
			//    	return "0";
			//    }
			//    return "60px";})

			csvdata = data;
			csvdata = prepareData(csvdata);
		},
        );

	setTimeout(function(){
	csvdata.shift();
	var gridData = quilt(csvdata);

	var grid = d3.select("#grid")
		.append("svg")
		.attr("width","100%")
		.attr("height","100%")
		.attr("viewBox", "0 0 920 579");

		
	var row = grid.selectAll(".row")
		.data(gridData)
		.enter().append("g")
		.attr("class", "row");

	var column = row.selectAll(".square")
		.data(function(d) { return d; })
		.enter().append("rect")
		.attr("class","square")
		.attr("x", function(d) {	//separate the last two columns from the rest
			if(d.x > 661){     //originally 841 for 1200 by 700
				d.x += 50;
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

	var avgtable1 = d3.select("#averages")
	.append("table")
	.classed("table", true)
	.classed("table-sm", true)

	// best
	tr1 = avgtable1.append('tr')
	tr1.append('th').attr('scope','row').text("Best")
	tr1.selectAll('td')
	.data(csvdata.filter(function(d, i) { return i <= 13; }))
	.enter()
	.append('td')
	.text(function(d) { return d[0][0] + "%"; });

	// worst
	tr2 = avgtable1.append("tr") 
	tr2.append('th').attr('scope','row').text("Worst")
	tr2.selectAll('td')
  	.data(csvdata.filter(function(d, i) { return i <= 13; }))
  	.enter()
  	.append('td')
    .text(function(d) { return d[10][0] + "%"; });

	tr3 = avgtable1.append("tr") // average
	tr3.append('th').attr('scope','row').text("Average")
	tr3.selectAll('td')
    .data(csvdata.filter(function(d, i) { return i <= 13; }))
    .enter()
    .append('td')
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

function addLegend(){
    if (document.getElementById('cryptolegend')) {
        return;
    };//element already exists, dont create again

    var ul = document.createElement('ul');
    ul.id = "cryptolegend";
    ul.style.paddingLeft = 0;    

    ul.innerHTML= `
        <li class="tooltip">1% BTC 
            <span class="top">59% S&P 500<br>40% Barclays Agg., 1% Bitcoin</span>
       </li>
       <li class="tooltip">5% BTC
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
    
    document.getElementById('averages').appendChild(ul);
}

var csvdata = [];

var index = -1;

run_crypto("../crypto_major_assets.csv");
addLegend();
