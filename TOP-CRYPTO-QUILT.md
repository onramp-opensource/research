# onramp-research
Onramp future repo for research tools
## The Main Content (2020)
To get all the price information of cryptocurrencies, we used the API provided by coincap.io.
The information for each cryptocurrency used SQLite instead of a CSV file to store the price information for a year and fetched the data from the database and displayed it.
Among them, we calculated and displayed the monthly rate of return according to the ranking of the cryptocurrencies with the highest prices.

### 1. Creating databases and tables using MySQL. [(MySQL)](https://www.mysql.com/)
* Database title: "crypto" (The database title can be changed.)
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
    > `price REAL NOT NULL`,  
    > `date TEXT NOT NULL`,   
    
### 2. Getting the Asset and Historical data for 20 Cryptocurrencies. [(Coincap)](https://docs.coincap.io/)
* Fetching information on the 20 cryptocurrencies with the highest price rankings.
  > API used: [Assets Information](https://docs.coincap.io/#89deffa0-ab03-4e0a-8d92-637a857d2c91)

  > Store in the Assets Table of the database
* Fetching the historical data for each cryptocurrency(2020 year)
  > API used: [Historical Data](https://docs.coincap.io/#61e708a8-8876-4fb2-a418-86f12f308978)
  
  > Stored in the History Table of the database
### 3. Displaying the Returns for each Cryptocurrency
![image](https://user-images.githubusercontent.com/60430353/116264676-12b58980-a7ad-11eb-9603-80d5b601ab4d.png)
* Pulling the data from the Database.
  > `SELECT h.price, SUBSTRING(h.date, 1, 7) as yearmonth, a.name, a.symbol FROM `history` h INNER JOIN assets a ON h.assetId = a.assetId
            WHERE h.id IN (SELECT  MAX(id) FROM `history` WHERE assetId != 'tether' GROUP BY SUBSTRING(`date`, 1, 7), assetId 
            ORDER BY SUBSTRING(`date`, 1, 7) ASC, price DESC) ORDER BY yearmonth ASC, h.price DESC`
* Calculating the Returns
  > `(Closing price at the end of the month) / (closing price at the end of the previous month) [this is basically the opening price at the beginning of the month]  - 1`
