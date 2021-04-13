# onramp-research
Onramp future repo for research tools
## The Main Content (2020)
To get all the price information of cryptocurrencies, we used the API provided by coincap.io.
The information for each cryptocurrency used SQLite instead of a CSV file to store the price information for a year and fetched the data from the database and displayed it.
Among them, we calculated and displayed the monthly rate of return according to the ranking of the cryptocurrencies with the highest prices.

### 1. Creating databases and tables using SQLite. [(SQLite)](https://www.sqlitetutorial.net/)
* Database title: "CryptoDB" (The database title can be changed.)
* Tables:
  - Assets Table
    > `id INTEGER PRIMARY KEY`,   
    > `rank INTEGER NOT NULL`,    
    > `symbol TEXT NOT NULL`,     
    > `name TEXT NOT NULL`,   
    > `assetId TEXT UNIQUE NOT NULL`
   
  - History Table
    > `id INTEGER PRIMARY KEY`,   
    > `assetId TEXT NOT NULL`,  
    > `time TEXT NOT NULL`,   
    > `price REAL NOT NULL`,  
    > `date TEXT NOT NULL`,   
    > `rank INTEGER NOT NULL`,
    
### 2. Getting the Asset and Historical data for 20 Cryptocurrencies. [(Coincap)](https://docs.coincap.io/)
* Fetching information on the 20 cryptocurrencies with the highest price rankings.
  > API used: [Assets Information](https://docs.coincap.io/#89deffa0-ab03-4e0a-8d92-637a857d2c91)

  > Store in the Assets Table of the database
* Fetching the historical data for each cryptocurrency(2020 year)
  > API used: [Historical Data](https://docs.coincap.io/#61e708a8-8876-4fb2-a418-86f12f308978)
  
  > Stored in the History Table of the database
### 3. Displaying the Returns for each Cryptocurrency
![image](https://user-images.githubusercontent.com/60430353/114468037-71133180-9c1d-11eb-9ce6-0ca791f92e4f.png)
* Pulling the data from the Database.
  > `SELECT h.price, strftime('%Y-%m', h.date) as yearmonth, a.name, a.symbol 
		  FROM history h INNER JOIN assets a ON h.assetId = a.assetId 
			WHERE h.id IN (SELECT  MAX(id) FROM history WHERE assetId != 'tether'
			GROUP BY strftime('%Y-%m', date), assetId ORDER BY strftime('%Y-%m', date) ASC, price DESC) 
		 	ORDER BY yearmonth ASC, h.price DESC`
* Calculating the Returns
  > `(Closing price at the end of the month) / (closing price at the end of the previous month) [this is basically the opening price at the beginning of the month]  - 
