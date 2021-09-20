<?php
  define("INTERVAL_YEAR", 24 * 3600 * 365 * 1000);
  define("INTERVAL_MONTH", 24 * 3600 *30 * 1000 );
  define("INTERVAL_DAY", 24 * 3600 * 1000 );
  date_default_timezone_set('UTC');
  $servername = "localhost";
  # don't forget to change your database credentials to reflect that of yours
  $database = "";
  $username = "";
  $password = "!";
  // Create connection
  $conn = mysqli_connect($servername, $username, $password, $database);
  // Check connection
  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }

  // If database is not exist create one
  if (!mysqli_select_db($conn,$database)){
    $sql = "CREATE DATABASE ".$database;
    if ($conn->query($sql) === TRUE) {
      echo "Database created successfully";
    }else {
      echo "Error creating database: " . $conn->error;
    }
  }

  function dropTable() {
    global $conn, $database;
    $sql = "DROP TABLE IF EXISTS `assets`";
    $sql1 = "DROP TABLE IF EXISTS `history`";
    mysqli_select_db($conn, $database);
    mysqli_query($conn, $sql);
    mysqli_query($conn, $sql1);
  }

  function createTable() {
    global $conn;
    $sql = "CREATE TABLE `assets` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `rank` int(11) NOT NULL,
      `name` varchar(255) NOT NULL,
      `assetId` varchar(255) NOT NULL,
      `symbol` varchar(255) NOT NULL,
      `update_date` datetime NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `assetId` (`assetId`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8";
    $sql1 = "CREATE TABLE `history` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `assetId` varchar(255) NOT NULL,
      `date` datetime NOT NULL,
      `price` double(11,6) NOT NULL,
      PRIMARY KEY (`id`),
      KEY `assetId` (`assetId`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8";
    mysqli_query($conn, $sql);
    mysqli_query($conn, $sql1);
  }

  function truncateTable() {
    global $conn;
    $sql = "TRUNCATE TABLE `assets`;";
    $sql1 = "TRUNCATE TABLE `history`;";
    mysqli_query($conn, $sql);
    mysqli_query($conn, $sql1);
  }
   
  function getAssetData() {
    $url = 'https://api.coincap.io/v2/assets?limit=20';
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $url);
    curl_setopt($crl, CURLOPT_FRESH_CONNECT, true);
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($crl);
    curl_close($crl);
    $data = json_decode($response, true);
    return $data['data'];
  }

  function saveAssetData() {
    global $conn;
    $assetData = getAssetData();
    $date = date('Y-m-d H:i:s');
    for ($i=0; $i < count($assetData) ; $i++) {
      $name = $assetData[$i]['name'];
      $rank = $assetData[$i]['rank'];
      $assetId = $assetData[$i]['id'];
      $symbol = $assetData[$i]['symbol'];
      $sql = "INSERT INTO `assets` (`rank`, `symbol`, `name`, `assetId`, `update_date`) VALUES ('$rank', '$symbol', '$name', '$assetId', '$date')";
      mysqli_query($conn, $sql);
    }
  }
  
  function fetchAssetHistory() {
    $assetData = getAssetData();
    for ($i=0; $i < count($assetData) ; $i++) {
      fetchAssetIdHistory($assetData[$i]['id']);
    }
  }

  function fetchAssetIdHistory($id) {
    $d1 = new Datetime();
    $currentTime = $d1->format('U') * 1000;
    $firstDate = $currentTime - INTERVAL_YEAR - INTERVAL_DAY;
    $endDate = $currentTime;
    $url = "https://api.coincap.io/v2/assets/$id/history?interval=d1&start=$firstDate&end=$endDate";
    $crl = curl_init();
    curl_setopt($crl, CURLOPT_URL, $url);
    curl_setopt($crl, CURLOPT_FRESH_CONNECT, true);
    curl_setopt($crl, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($crl);
    curl_close($crl);
    $rspData = json_decode($response, true);
    $data = $rspData['data'];
    for( $i = 0; $i < count($data); $i++) {
      global $conn;
      $date = date('Y-m-d h:i:s', strtotime($data[$i]['date']));
      $price = $data[$i]['priceUsd'];
      $sql = "INSERT INTO `history` (`assetId`, `date`, `price`) VALUES ('$id', '$date', '$price')";
      mysqli_query($conn, $sql);
    }
  }
  
  function getHistoryData($key) {
    global $conn;
    $history = array();
    $cur_date = date('Y-m-d');
    $cur_time = time();
    if ($key == 1) {
      $sql = "SELECT h.price, SUBSTRING(h.date, 1, 7) as yearmonth, a.name, a.symbol FROM `history` h INNER JOIN assets a ON h.assetId = a.assetId
        WHERE h.id IN (SELECT  MAX(id) FROM `history` WHERE assetId != 'tether' GROUP BY SUBSTRING(`date`, 1, 7), assetId 
        ORDER BY SUBSTRING(`date`, 1, 7) ASC, price DESC) ORDER BY yearmonth ASC, h.price DESC";
    }
    if ($key == 4) {
      $sql = "SELECT h.price, SUBSTRING(h.date, 1, 10) as yearmonth, a.name, a.symbol FROM `history` h INNER JOIN assets a ON h.assetId = a.assetId
        WHERE h.id IN (SELECT  MAX(id) FROM `history` WHERE assetId != 'tether' AND ($cur_time - 14 * 24 * 60 * 60) < UNIX_TIMESTAMP(`date`) 
        GROUP BY SUBSTRING(`date`, 1, 10), assetId ORDER BY SUBSTRING(`date`, 1, 10) ASC, price DESC) ORDER BY yearmonth ASC, h.price DESC";
    }
    if ($key == 6) {
      /*$sql = "SELECT h.price, SUBSTRING(h.date, 1, 10) AS yearmonth, FLOOR((DAYOFMONTH(h.date) - 1) / 7 +1) AS `week`, a.name, a.symbol 
      FROM `history` h INNER JOIN assets a ON h.assetId = a.assetId WHERE h.id IN (SELECT  MAX(id) FROM `history` 
      WHERE assetId != 'tether' AND ($cur_time - 13 * 7 * 24 * 60 * 60) < UNIX_TIMESTAMP(`date`) 
      GROUP BY SUBDATE(`date`, WEEKDAY(`date`)-1), assetId 
      ORDER BY SUBSTRING(`date`, 1, 10) ASC, price DESC) ORDER BY yearmonth ASC, h.price DESC";*/
      /*$sql = "SELECT h.price, SUBSTRING(h.date, 1, 10) AS yearmonth, a.name, a.symbol, DATE(h.date + INTERVAL (6 - WEEKDAY(h.date)) DAY) AS end_date
      FROM `history` h INNER JOIN assets a ON h.assetId = a.assetId WHERE h.assetId != 'tether' 
      AND ($cur_time - 13 * 7 * 24 * 60 * 60) < UNIX_TIMESTAMP(`date`) GROUP BY end_date, h.assetId ORDER BY yearmonth ASC, h.price DESC";*/
      $sql = "SELECT h.price, CONCAT(DATE_FORMAT(DATE(h.date + INTERVAL (0 - WEEKDAY(h.date)) DAY), '%m-%d'), '~', DATE_FORMAT(SUBSTRING(h.date, 1, 10), '%m-%d')) AS yearmonth, a.name, a.symbol FROM `history` h INNER JOIN assets a ON h.assetId = a.assetId
      WHERE h.id IN (SELECT MAX(id) FROM `history` WHERE assetId != 'tether' AND UNIX_TIMESTAMP(DATE_SUB('$cur_date', INTERVAL 12 WEEK)) < UNIX_TIMESTAMP(`date`) 
      GROUP BY DATE(`date` + INTERVAL (6 - WEEKDAY(`date`)) DAY), assetId ORDER BY SUBSTRING(`date`, 1, 10) ASC, `price` DESC) 
      ORDER BY SUBSTRING(h.date, 1, 10) ASC, h.price DESC";
    }

    if ($key == 8) {
      // Get the weekly date
      $sql = "SELECT CONCAT(DATE_FORMAT(DATE(h.date + INTERVAL (0 - WEEKDAY(h.date)) DAY), '%m-%d'), '~', DATE_FORMAT(SUBSTRING(h.date, 1, 10), '%m-%d')) AS `week` FROM `history` h
      WHERE h.id IN (SELECT MAX(id) FROM `history` WHERE UNIX_TIMESTAMP(DATE_SUB('$cur_date', INTERVAL 12 WEEK)) < UNIX_TIMESTAMP(`date`) 
      GROUP BY DATE(`date` + INTERVAL (6 - WEEKDAY(`date`)) DAY) ORDER BY SUBSTRING(`date`, 1, 10) ASC, `price` DESC) 
      ORDER BY SUBSTRING(h.date, 1, 10) ASC, h.price DESC";
    }
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
      // output data of each row
      while($row = mysqli_fetch_assoc($result)) {
        array_push($history, $row);
      }
      echo json_encode($history);
    } else {
      echo "0 results";
    }
  }

  function getFirstLastData($key) {
    global $conn;
    $data = array();
    $cur_date = date('Y-m-d');
    $cur_time = time();
    if ($key == 2) {
      $sql = "SELECT a.symbol, c.* FROM assets a INNER JOIN (SELECT h.*, b.lastprice, b.lastdate FROM `history` h 
      INNER JOIN (SELECT id AS lastid, `date` AS lastdate, price AS lastprice, assetId AS lastassetId FROM `history` 
      WHERE DATE(SUBSTRING(`date`, 1, 10))=(DATE_SUB('$cur_date', INTERVAL 1 DAY))) b ON h.assetId = b.lastassetId 
      GROUP BY b.lastassetId) c ON a.assetId = c.assetId ORDER BY c.lastprice DESC LIMIT 10";
    }
    if ($key == 5) {
      $sql = "SELECT a.symbol, c.lastassetId, c.price, c.lastprice FROM assets a INNER JOIN (SELECT * FROM (SELECT * FROM `history` 
      WHERE assetId != 'tether' AND ($cur_time - 13 * 24 * 60 * 60) <= UNIX_TIMESTAMP(`date`)) a 
      INNER JOIN(SELECT id AS lastid, `date` AS lastdate, price AS lastprice, assetId AS lastassetId FROM `history` 
      WHERE DATE(SUBSTRING(`date`, 1, 10))=(DATE_SUB('$cur_date', INTERVAL 1 DAY))) b ON a.assetId = b.lastassetId 
      GROUP BY b.lastassetId) c ON a.assetId = c.assetId ORDER BY c.lastprice DESC LIMIT 10";
    }
    if ($key == 7) {
      $sql = "SELECT a.symbol, c.lastassetId, c.price, c.lastprice FROM assets a INNER JOIN (SELECT * FROM (SELECT * FROM `history` 
      WHERE assetId != 'tether' AND UNIX_TIMESTAMP(DATE_SUB('$cur_date', INTERVAL 12 WEEK)) <= UNIX_TIMESTAMP(`date`)) a 
      INNER JOIN(SELECT id AS lastid, `date` AS lastdate, price AS lastprice, assetId AS lastassetId FROM `history` 
      WHERE DATE(SUBSTRING(`date`, 1, 10))=(DATE_SUB('$cur_date', INTERVAL 1 DAY))) b ON a.assetId = b.lastassetId 
      GROUP BY b.lastassetId) c ON a.assetId = c.assetId ORDER BY c.lastprice DESC LIMIT 10";
    }
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
      // output data of each row
      while($row = mysqli_fetch_assoc($result)) {
        array_push($data, $row);
      }
      echo json_encode($data);
    } else {
      echo "0 results";
    }
  }

  function getUpdateDate() {
    global $conn;
    $sql = "SELECT `update_date` FROM `assets` LIMIT 1;";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) > 0) {
      $row = mysqli_fetch_assoc($result);
      return $row["update_date"];
    } else {
      return 0;
    }
  }

  function confirmDatabase() {
    $cur_time = time();
    $update_date = getUpdateDate();
    if ($update_date) {
      if ($cur_time - strtotime($update_date) > 60 * 60 * 4) {
        truncateTable();
        saveAssetData();
        fetchAssetHistory();
      }
    } else {
      saveAssetData();
      fetchAssetHistory();
    }
  }

  if (isset($_GET['call'])) {
    $var = $_GET['call'];
    switch($var) {
      case 1:
        confirmDatabase();
        getHistoryData($var);
        return;
      case 2: 
        getFirstLastData($var);
        return;
      case 3: 
        echo getUpdateDate();
        return;
      case 4: 
        getHistoryData($var);
        return;
      case 5: 
        getFirstLastData($var);
        return;
      case 6: 
        getHistoryData($var);
        return;
      case 7:
        getFirstLastData($var);
        return;
      case 8:
        getHistoryData($var);
        return;
    }
  }
  mysqli_close($conn);
?>
