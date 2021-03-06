// @ts-nocheck
const intervalYear = 24 * 3600 * 365 * 1000; // 1 year
const intervalMonth = 24 * 3600 * 30 * 1000;  // 1 month
const intervalDay = 24 * 3600 * 1000; // 1 day
const intervalWeek = 24 * 3600 * 7 * 1000;  // 1 week
const backgroundColor = {
	"BTC": "#080809",	"ETH": "#595960",	"BNB": "#66ECFF",	"XRP": "#cfda0f",	"DOT": "#FF6162",	"ADA": "#66ED00",	"UNI": "#00FB7E",
	"LTC": "#FFC001",	"LINK": "#079A89",	"BCH": "#FF9999",	"THETA": "#49596A",	"XLM": "#EF8889",	"USDC": "#29D9AA",	"FIL": "#cfda0f",
	"WBTC": "#FF999A",	"BTT": "#66ECFE",	"DOGE": "#EE6162",	"SOL": "#1FC001",	"LUNA": "#1AFCCE",	"EOS": "#AF6161",	"NEO": "#CF6060"}


var selectedAsset = [];
var assetData = [];
var firstlastData = [];
var update_date = "";

var monthlyData = [];
var monthGroup = [];
var monthlyfirstlastData = [];
var weeklyData = [];
var weekGroup = [];
var weeklyfirstlastData = [];
var dailyData = [];
var dayGroup = [];
var dailyfirstlastData = [];

var date = new Date();
const END_DATE = date.getTime(); // current Date
const START_DATE = END_DATE - intervalYear

function getRegularData(key) {
	let itemGroup = [];
	let annuals = [];
	let groupData = [];
	let groupLabel = [];
	let firstlastData = [];
	if (key == "monthly") {
		groupData = monthlyData;
		groupLabel = monthGroup;
		firstlastData = monthlyfirstlastData;
	}
	if (key == "daily") {
		groupData = dailyData;
		groupLabel = dayGroup;
		firstlastData = dailyfirstlastData;
	}
	if (key == "weekly") {
		groupData = weeklyData;
		groupLabel = weekGroup;
		firstlastData = weeklyfirstlastData;
	}
	if(selectedAsset.length > 0) {
		selectedAsset = [];
	}
	for (var i = 0; i < groupLabel.length; i++) {
		var item = [];
		var count = 1;
		for (var j = 0; j < groupData.length; j++) {
			var assetItem = {
				name: '',
				symbol: ''
			}
			assetItem.name = groupData[j].name;
			assetItem.symbol = groupData[j].symbol;
			let label = '';
			if (key == 'weekly') {
				label = groupLabel[i].week;
			} else {
				label = groupLabel[i];
			}
			if (label == groupData[j].yearmonth) {
				if (count < 11) {
					item.push(groupData[j]);
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
	let returnGroup = [];

	for (var i = 1; i < itemGroup.length; i++) {
		var returns = []
		var items = itemGroup[i];
		for (var j = 0; j < items.length; j++) {
			var item = [];
			for (var k = 0; k < itemGroup[i - 1].length; k++) {
				if (itemGroup[i - 1][k].symbol && items[j].symbol && itemGroup[i - 1][k].symbol == items[j].symbol) {
					var str = items[j].price / itemGroup[i - 1][k].price - 1;
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
	let annual;
	if (key == "monthly") {
		annual = [null, 'Annual'];
	} else {
		annual = [null, 'Cummulative'];
	}
	isort(annuals);
	annuals.reverse();
	annuals.unshift(annual);
	returnGroup.push(annuals);
	return returnGroup;
}

function getReturnData(key) {
	let rspData = getRegularData(key);
	setTimeout(() => {
		var gridData = quilt(rspData);
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
					if (d.value != null) {
						if (backgroundColor[d.label]) {
							return backgroundColor[d.label];
						} else {
							return "#cfda0e";
						}
					} else {
						return "white";
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
			.attr("viewBox", "0 0 850 120");

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
			.data(rspData.filter(function(d, i) { return i < rspData.length; }))
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
				return i === rspData.length - 1 ? i * 60 + 11 : i * 60 + 1;
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
			if (key == 'daily') {
				text.html( function (d) 
					{
						// The only to add \n to an SVG text.
						if (d.value !== null || d.label == "Cummulative") { return d.label } // if there's a value (not a table header) then return the normal label
						let l = d.label.split("-") // table header, split it so we can put the parts on different levels
						var x = d3.select(this).attr("x"); // get the x position of the text
						var y = d3.select(this).attr("dy"); // get the y position of the text
						var t = "<tspan x=" + x + " dy=" + (+y + 15) + ">" + l[1] + "-" + l[2] + "</tspan>";
						return l[0] + "-" + t; // appending it to the html
					}
				);
			} else if (key == 'weekly') {
				text.html( function (d) 
					{
						// The only to add \n to an SVG text.
						if (d.value !== null || d.label == "Cummulative") { return d.label } // if there's a value (not a table header) then return the normal label
						let l = d.label.split("~") // table header, split it so we can put the parts on different levels
						var x = d3.select(this).attr("x"); // get the x position of the text
						var y = d3.select(this).attr("dy"); // get the y position of the text
						var t = "<tspan x=" + x + " dy=" + (+y + 15) + ">" + l[1] + "</tspan>";
						return l[0] + "~" + t; // appending it to the html
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
				return d.value !== null ? d.value + "%" : "" ; 
			});
	}, 300);
}

function getDBData() {
	$.ajax({
		url: "./data/data.php",
		type: "get",
		data: {"call": "1"},
		success: function(data) {
			monthlyData = $.parseJSON(data);

			var inProgress = 0;
			var handleBefore = function() {
				inProgress++;
			};
			var handleComplete = function() {
				if (!--inProgress) {
					getReturnData('daily');
					addCryptoLegend();
					$("#loader").css("display", "none");
					$(".update-date").removeClass('hidden');
					$("#update-date").text(update_date);
					getMonthData(update_date);
				}
			};

			$.ajax({
				beforeSend: handleBefore, 
				url: "./data/data.php",
				type: "get",
				data: {"call": "2"},
				success: function(data) {
					monthlyfirstlastData = $.parseJSON(data);
					handleComplete();
				}
			});

			$.ajax({
				beforeSend: handleBefore,
				url: "./data/data.php",
				type: "get",
				data: {"call": "3"},
				success: function(data) {
					update_date = data;
					handleComplete();
				}
			});

			$.ajax({
				beforeSend: handleBefore,
				url: "./data/data.php",
				type: "get",
				data: {"call": "4"},
				success: function(data) {
					dailyData = $.parseJSON(data);
					handleComplete();
				}
			});
			$.ajax({
				beforeSend: handleBefore,
				url: "./data/data.php",
				type: "get",
				data: {"call": "5"},
				success: function(data) {
					dailyfirstlastData = $.parseJSON(data);
					handleComplete();
				}
			});
			$.ajax({
				beforeSend: handleBefore,
				url: "./data/data.php",
				type: "get",
				data: {"call": "6"},
				success: function(data) {
					weeklyData = $.parseJSON(data);
					handleComplete();
				}
			});
			$.ajax({
				beforeSend: handleBefore,
				url: "./data/data.php",
				type: "get",
				data: {"call": "7"},
				success: function(data) {
					weeklyfirstlastData = $.parseJSON(data);
					handleComplete();
				}
			});
			$.ajax({
				beforeSend: handleBefore,
				url: "./data/data.php",
				type: "get",
				data: {"call": "8"},
				success: function(data) {
					weekGroup = $.parseJSON(data);
					handleComplete();
				}
			});
		}
	});
}

$(document).ready(() => {
	getDBData();
	for (let i = END_DATE - intervalDay; i >= END_DATE - 13 * intervalDay; i-=intervalDay) {
		let date = new Date(i).toISOString().slice(0, 10);
		dayGroup.push(date);
	}
	dayGroup.reverse();

	$("#daily").on('click', () => {
		clear("crypto-legend");
		run("crypto_major_assets_annual.csv", "annual");
		getReturnData('daily');
		addCryptoLegend();
		clear('bottomtable');
		$("#daily").addClass("btn-active");
		$("#crypto-monthly").removeClass("btn-active");
		$("#weekly").removeClass("btn-active");
	});

	$("#crypto-monthly").on('click', () => {
		clear("crypto-legend");
		run("crypto_major_assets_annual.csv", "annual");
		getReturnData('monthly');
		addCryptoLegend();
		clear('bottomtable');
		$("#crypto-monthly").addClass("btn-active");
		$("#daily").removeClass("btn-active");
		$("#weekly").removeClass("btn-active");
	});

	$("#weekly").on('click', () => {
		clear("crypto-legend");
		run("crypto_major_assets_annual.csv", "annual");
		getReturnData('weekly');
		addCryptoLegend();
		clear('bottomtable');
		$("#weekly").addClass("btn-active");
		$("#crypto-monthly").removeClass("btn-active");
		$("#daily").removeClass("btn-active");
	});
})

function getMonthData(end_date) {
	var dates = [];
	var end = new Date(new Date(end_date).getTime() - intervalDay);
	var start = new Date(end.getTime() - intervalYear);
	for (var i = start.getFullYear(); i < end.getFullYear() + 1; i++) {
    for (var j = 1; j <= 12; j++) {
      if (i === end.getFullYear() && j > end.getMonth() + 1) {
        break;
      } else if (i === start.getFullYear() && j <= start.getMonth()){
        continue;
      } else if (j < 10) {
        var dateString = [i, '-', '0' + j].join('');
        monthGroup.push(dateString)
      } else {
        var dateString = [i, '-', j].join('');
        monthGroup.push(dateString);
      }
    }
	}
}

function addCryptoLegend() {
	setTimeout(()=>{
	    var ul = document.createElement('ul')
	    ul.id = "cryptolegend";
	    ul.className = "list-group";
	    var childs ="";
	    for (var i = 0; i < selectedAsset.length; i++) {
				let color;
				if (backgroundColor[selectedAsset[i].symbol]) {
					color = backgroundColor[selectedAsset[i].symbol];
				} else {
					color = "#cfda0e";
				}
	    	childs += `<li class="tooltip" style="background-color: `+ color + `"` +`>`+selectedAsset[i].symbol +` 
	          <span class="top">`+selectedAsset[i].name+`</span>
	       	</li>`
	    }
	    ul.innerHTML = childs;
	    $('#crypto-legend').append(ul);
	}, 500)
}

