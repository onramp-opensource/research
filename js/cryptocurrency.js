const monthData = ['2019-12', '2020-01', '2020-02', '2020-03', '2020-04', '2020-05', '2020-06', '2020-07', '2020-08', '2020-09', '2020-10', '2020-11', '2020-12' ]
const START_DAY = 1575129600000; // 2019-01-01
const END_DAY = 1609430399000; // 2020-12-31
function getReturnData() {
	var finalData = []
	var totalArray = [];
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
						flag = 0;
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
	lastmonths = itemGroup[itemGroup.length-1];
	firstmonths = itemGroup[0]
	for (var m = 0; m < lastmonths.length; m++) {
		var annualItem = [];
		for (var n = 0; n < firstmonths.length; n++) {
			if (lastmonths[m].symbol === firstmonths[n].symbol) {
				var str1 = lastmonths[m].price / firstmonths[n].price - 1;
				var value1 = (str1 * 100).toFixed(2);
				annualItem.push(parseFloat(value1));
				annualItem.push(lastmonths[m].symbol);
				break;
			}			
		}

		if (n === lastmonths.length) {
			annualItem.push(0);
			annualItem.push(lastmonths[m].symbol);
		}
		annuals.push(annualItem)
	}
	let annual = [null, 'Annual'];
	isort(annuals);
	annuals.reverse();
	annuals.unshift(annual);
	returnGroup.push(annuals);

	setTimeout(() => {
		rawData.shift();
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
					        return "#D9D9DA";
					    case "XRP":
					        return "#cfda0f";
					    case "DOT":
					        return "#FF6162";
					    case "ADA":
					    	return "#66ED00";
					    case "UNI":
					    	return "#FF9998";
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
					    	return "#FF6162";
					    case "SOL": 
					    	return "#1FC001";
					    case "LUNA": 
					    	return "#1AFCCE";
					    case "EOS": 
					    	return "#AF6161";
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
				console.log(i)
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

$(document).ready(() => {
	
	var db = window.openDatabase('cryptodb', '1.0', 'Test DB', 2 * 1024 * 1024);
	function appendMsgToDBLog(msg) {
        console.log(msg)
    }

	function appendErrToDBLog(errMsg) {
    	console.log(errMsg)
	}

	function appendWarningToDBLog(warning) {
        console.log(warning)
    }

	function standardSQLErrorHandler(tx, err) {
	    if (err && err.message) {
	        appendErrToDBLog("Error while manipulating database: " + err.message);
	    } else {
	        appendErrToDBLog("Encountered unexpected error while manipulating database.");
	    }
	}

	function standardTxErrorHandler(err) {
        if (err && err.message) {
            appendErrToDBLog("Error while manipulating database: " + err.message);
        } else {
            appendErrToDBLog("Encountered unexpected error while manipulating database.");
        }
    }

	if (db) {
        appendMsgToDBLog("It's alive!");
    }

	db.transaction(getDBData, standardTxErrorHandler, confirmDBData);

	function getDBData(tx) {
		tx.executeSql("SELECT * FROM assets WHERE assetId != 'tether'", [], (tx, res) => {
			var len = res.rows.length;
		    if (len ==0 ) {
		    	getAssets();
		    } else {
		    	appendMsgToDBLog("assets: " + len)
		    	assetData = res.rows;
		    }
		}, createAssetsTable)

		tx.executeSql(
		  	"SELECT h.price, strftime('%Y-%m', h.date) as yearmonth, a.name, a.symbol \
		  	FROM history h INNER JOIN assets a ON h.assetId = a.assetId \
			WHERE h.id IN (SELECT  MAX(id) FROM history WHERE assetId != 'tether' \
			GROUP BY strftime('%Y-%m', date), assetId ORDER BY strftime('%Y-%m', date) ASC, price DESC) \
		 	ORDER BY yearmonth ASC, h.price DESC" , [], (tx, res) => {
			var len = res.rows.length;
		    if (len ==0 ) {
		    	// createHistoryData();
		    } else {
		    	appendMsgToDBLog("history: " + len)
		    	historyData = res.rows;
		    }
		}, createHistoryTable)
	}

	function confirmDBData() {
		if (assetData.length == 0 && historyData.length == 0) {
			setTimeout(() => {
				db.transaction((tx) => {
					tx.executeSql("SELECT * FROM assets WHERE assetId != 'tether'", [], (tx,res) => {
						var len = res.rows.length;
					    if (len ==0 ) {
					    	getAssets();
					    } else {
					    	appendMsgToDBLog("assets: " + len)
					    	assetData = res.rows;
					    	addCryptoLegend()
					    }
					})
					tx.executeSql(
					  	"SELECT h.price, strftime('%Y-%m', h.date) as yearmonth, a.name, a.symbol \
					  	FROM history h INNER JOIN assets a ON h.assetId = a.assetId \
						WHERE h.id IN (SELECT  MAX(id) FROM history WHERE assetId != 'tether' \
						GROUP BY strftime('%Y-%m', date), assetId ORDER BY strftime('%Y-%m', date) ASC, price DESC) \
					 	ORDER BY yearmonth ASC, h.price DESC", [], (tx,res) => {
						var len = res.rows.length;
					    if (len ==0 ) {
					    	// createHistoryData();
					    } else {
					    	appendMsgToDBLog("history: " + len)
					    	historyData = res.rows;
					    }
					})
				}, standardTxErrorHandler, getReturnData)
			}, 2000)
		} else {
			getReturnData()
			addCryptoLegend()
		}
	}

	function createAssetsTable(tx) {
		// assets Table
		tx.executeSql(
	   		'CREATE TABLE IF NOT EXISTS assets (' +
	   			'id INTEGER PRIMARY KEY, ' + 
	   			'rank INTEGER NOT NULL, ' + 
	   			'symbol TEXT NOT NULL, ' + 
	   			'name TEXT NOT NULL, ' + 
	   			'assetId TEXT UNIQUE NOT NULL)', [],
            function() {
            	getAssets();
                appendMsgToDBLog("Created assets table.");
            }, 
            standardSQLErrorHandler);
	}

	function createHistoryTable(tx) {
		// history Table
	    tx.executeSql(
	    	"CREATE TABLE IF NOT EXISTS history (" + 
	    		"id INTEGER PRIMARY KEY, " + 
	    		"assetId TEXT NOT NULL, " + 
	    		"time TEXT NOT NULL, " +
	    		"price REAL NOT NULL, " +
	    		"date TEXT NOT NULL, " + 
	    		"rank INTEGER NOT NULL)" , [],
	    	function() {
	    		appendMsgToDBLog("Created history table");
	    	},
	    	standardSQLErrorHandler);
	}

	function recreateTable(tx) {
		appendWarningToDBLog("Dropping and re-creating assets and history table...");
		tx.executeSql(
			"DROP TABLE IF EXISTS assets", [],
            function() {
                appendMsgToDBLog("Successfully cleaned up assets.");
            }, standardSQLErrorHandler);

		tx.executeSql("DROP TABLE IF EXISTS history", [], 
			function() {
				appendMsgToDBLog("Successfully cleaned up history.");
			}, standardSQLErrorHandler);

		db.transaction(createTable, standardTxErrorHandler, 
        	function() {
            	appendMsgToDBLog("Successfully cleaned up database.");
        	}
        );
	}

	// db.transaction(recreateTable, standardTxErrorHandler, createData);

	function getAssets() {
		$.get('https://api.coincap.io/v2/assets?limit=20', async (resData, status) => {
	   		if (status == "success") {
	   			await setAssetData(resData.data)
	   		}
		});
	}

	function setAssetData(data) {
		db.transaction( (tx) => {
			for( var i = 0; i < data.length; i++) {
				tx.executeSql(
					"INSERT OR REPLACE INTO assets (rank, symbol, name, assetId) " + 
					" VALUES (?, ?, ?, ?)",
					[data[i].rank, data[i].symbol, data[i].name, data[i].id],
					null, standardSQLErrorHandler);
			}
		}, standardTxErrorHandler, createHistoryData(data))
	}

	function createHistoryData(data) {
        for (var i = 0; i < data.length; i++) {
            getAssetIdHisotry(data[i].id, data[i].rank)
        }
	}

	function getAssetIdHisotry(id, rank) {
		$.get('https://api.coincap.io/v2/assets/'+id+'/history', {interval:"d1", start: START_DAY, end: END_DAY})
		.done(async (res) => {
			await setHistoryData(id, res.data, rank)
		});
	}

	function setHistoryData(id, data, rank) {
		db.transaction( (tx) => {
			for( var i = 0; i < data.length; i++) {
				tx.executeSql(
					"INSERT OR REPLACE INTO history (assetId, time, price, date, rank) " + 
					" VALUES (?, ?, ?, ?, ?)",
					[id, data[i].time, data[i].priceUsd, data[i].date, rank],
					null, standardSQLErrorHandler);
			}
		}, standardTxErrorHandler)
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

var selectedAsset = [];
var assetData = [];
var historyData = [];
var rawData = []