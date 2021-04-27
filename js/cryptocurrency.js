// @ts-nocheck
const intervalYear = 24 * 3600 * 365 * 1000; // 1 year
const intervalMonth = 24 * 3600 * 1000 * 30 // 1 month
var selectedAsset = [];
var assetData = [];
var historyData = [];
var monthData = [];
var firstlastData = [];
let date = new Date();
const END_DATE = date.getTime(); // current Date
const START_DATE = END_DATE - intervalYear

function getReturnData() {
	var itemGroup = [];
	var annuals = []
	for (var i = 0; i < monthData.length; i++) {
		var item = [];
		var count = 1;
		for (var j = 0; j < historyData.length; j++) {
			var assetItem = {
				name: '',
				symbol: ''
			}
			assetItem.name = historyData[j].name,
			assetItem.symbol = historyData[j].symbol
			if (monthData[i] == historyData[j].yearmonth) {
				if (count < 11) {
					item.push(historyData[j]);
					if (selectedAsset.length <= 1) {
						selectedAsset.push(assetItem)
					} 
					else {
						var flag = 0;
						for (var k = 0; k < selectedAsset.length; k++) {
							if (assetItem.symbol == selectedAsset[k].symbol) {
								flag = 1;
								break;
							}
						}
						if (flag == 0) {
							selectedAsset.push(assetItem);
						}
					}
				}
				count ++;
			}
		}
		itemGroup.push(item);
	}
	var returnGroup = [];

	for (var i = 1; i < itemGroup.length; i++) {
		var returns = []
		var items = itemGroup[i];
		for (var j = 0; j < items.length; j++) {
			var item = [];
			for (var k = 0; k < itemGroup[i - 1].length; k++) {
				if (itemGroup[i - 1][k].symbol && items[j].symbol && itemGroup[i - 1][k].symbol == items[j].symbol) {
					var str = items[j].price / itemGroup[i - 1][j].price - 1;
					// var value = str.toString().match(/(-)*[0-9]*(.?[0-9]{1,4})/);
					var value = (str * 100).toFixed(2);
					item.push(parseFloat(value));
					item.push(items[j].symbol);
					var str = '';
					break;
				} 
			}
			if (k === itemGroup[i-1].length) {
				item.push(0);
				item.push(items[j].symbol);
			}
			returns.push(item)
		}
		isort(returns);
		returns.reverse();
		let month = [null, itemGroup[i][items.length-1].yearmonth]
		returns.unshift(month);
		returnGroup.push(returns);
	}
	for (var m = 0; m < firstlastData.length; m++) {
		var annualItem = [];
		var str1 = firstlastData[m].lastprice / firstlastData[m].price - 1;
		var value1 = (str1 * 100).toFixed(2);
		annualItem.push(parseFloat(value1));
		annualItem.push(firstlastData[m].symbol);
		annuals.push(annualItem)
	}
	
	let annual = [null, 'Annual'];
	isort(annuals);
	annuals.reverse();
	annuals.unshift(annual);
	returnGroup.push(annuals);

	setTimeout(() => {
		var gridData = quilt(returnGroup);
		var grid = d3.select("#crypto")
			.append("svg")
			.attr("width","100%")
			.attr("height","100%")
			.attr("class", "grid")
			.attr("viewBox", "0 0 800 550");

		var row = grid.selectAll(".row")
			.data(gridData)
			.enter().append("g")
			.attr("class", "row");
		var column = row.selectAll(".square")
			.data(function(d) { return d; })
			.enter().append("rect")
			.attr("class","square")
			.attr("x", function(d) {	//separate the last two columns from the rest
				if (d.x > 710) {  
					d.x += 10;   //originally 841 for 1200 by 700
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
						case "BTC":
							return "#080809";
						case "ETH":
							return "#595960";
						case "BNB":
							return "#66ECFF";
						case "XRP":
							return "#cfda0f";
						case "DOT":
							return "#FF6162";
						case "ADA":
							return "#66ED00";
						case "UNI":
							return "#D9D9DA";
						case "LTC":
							return "#FFC001";
						case "LINK":
							return "#079A89";
						case "BCH":
							return "#7AFFBE";
						case "THETA":
							return "#49596A";
						case "XLM": 
							return "#EF8889";
						case "USDC": 
							return "#29D9AA";
						case "FIL": 
							return "#cfda0f";
						case "WBTC": 
							return "#FF999A";
						case "BTT": 
							return "#66ECFE";
						case "DOGE": 
							return "#EE6162";
						case "SOL": 
							return "#1FC001";
						case "LUNA": 
							return "#1AFCCE";
						case "EOS": 
							return "#AF6161";
						case "NEO": 
							return "#CF6060";
						default:
							return "#e6dfdf" //labels at top
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
		var cryptosvg = d3.select("#crypto-averages")
			.append("svg")
			.attr("width","100%")
			.attr("height","100%")
			.attr("viewBox", "0 0 850 150");

		cryptorow1 = cryptosvg.append('g')
			.attr("class", "row")
			.attr("transform", "translate(90, 30)")	

		cryptorow1.selectAll(".text") //Best values
			.data(gridData[1])
			.enter()
			.append("text")
			.style("fill", "black")
			.attr("text-anchor", "middle")
			.attr("font-size", 11)
			.attr("x", function(d) { return d.x; } )
			.attr("y", 0 ) 
			.attr("pointer-events","none")
			.text(function(d) { 
				return d.value ? d.value + "%" : "0%" ; 
			});

		cryptorow1.selectAll(".text") //Worst values
			.data(gridData[gridData.length-1])
			.enter()
			.append("text")
			.style("fill", "black")
			.attr("text-anchor", "middle")
			.attr("font-size", 11)
			.attr("x", function(d) { return d.x; } )
			.attr("y", 0 ) 
			.attr("pointer-events","none")
			.text(function(d) { 
				return d.value ? d.value + "%" : "0%" ; 
			})
			.attr("transform", "translate(0, 30)");

		var cryptorow2 = cryptosvg.append("g")
			.attr("class", "row")
			.attr("transform", "translate(90, 90)");

		cryptorow2.selectAll("text") // Average values
			.data(returnGroup.filter(function(d, i) { return i < returnGroup.length; }))
			.enter()
			.append('text')
			.text(function(d){ 
		    	var sum = 0;
		    		for(var i = 1; i < d.length; i++){
		    			if (d[i][0]=="") {
		    				sum += 0
		    			} else {
		    				sum += d[i][0];
		    			}
		    		}
		    		return Math.round((sum/11) * 100)/100 + "%";
		    	}
		    )
		    .style("fill", "black")
			.attr("text-anchor", "middle")
			.attr("font-size", 11)
			.attr("x", function(d, i) { 
				return i === returnGroup.length - 1 ? i * 60 + 11 : i * 60 + 1;
			})
			.attr("y", 0 ) 
			.attr("pointer-events","none");

		var summaryLabels = cryptosvg.selectAll(".label")
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
			.attr("transform", "translate(5, 30)")

		/*****************end table stuff*****************/

		// labels for the quilt
		var text = row.selectAll(".text") //grid labels
			.data(function(d) { return d; })
			.enter()
			.append("text")
			.style("fill", function(d) {
				return d.value !== null ? "white" : "black" 
			})
			.attr("text-anchor", "middle")
			.attr("font-size", 11)
			.attr("font-weight", "bold")
			.attr("x", function(d) { return d.x + 30; } )
			.attr("y", function(d) { return d.y + 20;} ) 
			.attr("pointer-events","none")
			text.text(function(d) { return d.label; } );

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
				return d.value !== null ? d.value + "%" : "" ; 
			});
	}, 300);
}

function getDBData() {
	$.ajax({
		url: "./data/data.php",
		type: "get",
		data: {"call": "1"},
		success: function(msg) {
			historyData = $.parseJSON(msg);
			$.ajax({
				url: "./data/data.php",
				type: "get",
				data: {"call": "2"},
				success: function(msg) {
					firstlastData = $.parseJSON(msg);
					getReturnData();
					addCryptoLegend();
					$("#loader").css("display", "none");
				}
			});
		}
	});
}

$(document).ready(() => {
	getDBData()
	for (let i = START_DATE; i < END_DATE; i+= intervalMonth) {
		let date = new Date(i).toISOString().slice(0, 7);
		monthData.push(date)
	}
})

function addCryptoLegend(){
	setTimeout(()=>{
		if (document.getElementById('cryptolegend')) {
	        return;
	    };//element already exists, dont create again
	    var ul = document.createElement('ul')
	    ul.id = "cryptolegend";
	    ul.className = "list-group mt-4";
	    var childs ="";
	    for (var i = 0; i < selectedAsset.length; i++) {
	    	childs += `<li class="tooltip btc-color">`+selectedAsset[i].symbol +` 
	            <span class="top">`+selectedAsset[i].name+`</span>
	       	</li>`
	    }
	    ul.innerHTML = childs;
	    $('#crypto-legend').append(ul);
	}, 500)
}

