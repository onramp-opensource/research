<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="">
  <meta name="twitter:image" content="https://research.onrampinvest.com/img/asset-class-returns.png">
  <meta name="twitter:card" content="summary_large_image"/>
  <meta property="og:title" content="Onramp Research" />
  <meta property="og:url" content="https://research.onrampinvest.com/#class-returns" />
  <meta property="og:image" content="https://research.onrampinvest.com/img/asset-class-returns.png" />
  <meta property="og:description" content="Onramp Invest" />
  <meta property="og:site_name" content="Onramp Research" />
  <title>Onramp Research</title>
  <link rel='shortcut icon' type='image/png' href='img/onramp.png' />
  <!-- Bootstrap core CSS -->
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
  <link href="css/style.css" rel="stylesheet">
  <style>
  </style>
  <script src="js/html2canvas.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.5.1.min.js"
    integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
  <script src="js/bootstrap.bundle.min.js"></script>
  <script src="https://d3js.org/d3.v4.min.js"></script>
  <script type='text/javascript' src='https://platform-api.sharethis.com/js/sharethis.js#property=6090212ab6b03300128ef222&product=sop' async='async'></script>
</head>
<body oncontextmenu="return false">
  <header>
    <div class="custom-bg collapse" id="navbarHeader">
      <div class="container">
        <div class="row">
          <div class="col-sm-8 col-md-7 py-4">
            <h4 class="text-white">Onramp Research</h4>
            <p class="text-white">Interactive research tools and data from the Onramp Team.</p>
          </div>
          <div class="col-sm-4 offset-md-1 py-4">
            <h4 class="text-white">Contact</h4>
            <ul class="list-unstyled">
              <li><a href="https://twitter.com/Onrampinvest" class="text-white">Follow on Twitter</a>
              </li>
              </li>
              <li><a href="mailto:info@onrampinvest.com" class="text-white">Email me</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="navbar navbar-dark custom-bg shadow-sm">
      <div class="container">
        <a href="https://www.onrampinvest.com/">
          <img src="img/onramp_logo.png" alt="Onramp Invest" class="logo-img navbar-brand">
        </a>
        <button class="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbarHeader"
          aria-controls="navbarHeader" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>
    </div>
  </header>
  <main>
    <section class="mt-4 py-3 text-center container">
      <div class="row py-lg-3">
        <div class="col-lg-9 col-md-9 mx-auto">
          <h1 class="fw-light">Returns with Bitcoin</h1>
          <p class="lead text-muted">The following quiltchart highlights historical asset class returns along with those
            of a traditional 60/40 blended stock and bond portfolio. This chart is slightly different in that it
            also highlights the hypothetical returns of a portfolio where bitcoin is added to the blend. For
            illustration purposes we created two different portfolios, one with a 1% allocation to bitcoin and one with
            a 5% allocation. Both pull those allocations from the 60% stock allocation.
          </p>
          <p>
        </div>
      </div>
    </section>
    <div class="py-3 bg-light">
      <div class="container">
        <div class="row">
          <div class="col">
            <div class="card shadow-sm p-3" id="class-returns">
              <div class="row p-3 d-flex justify-content-between align-items-center">
                <div class="d-flex col-2 col-sm-3 col-md-1 hidden-item"></div>
                <div class="d-flex flex-lg-grow-1 flex-fill justify-content-start pl-2">
                  <span class="title">Asset Class Returns</span>
                </div>
                <img src="img/onramp_tm.png" class="tm-img">
              </div>
              <div class="p-2 d-flex justify-content-center btn-items" data-toggle="buttons" role="group" style="text-align: center;">
                <button class="btn btn-rounded btn-lg mx-2 btn-active" id="annual" type="button">Annual</button>
                <button class="btn btn-rounded btn-lg mx-2" id="asset-monthly" type="button">Monthly</button>
              </div>
              <div class="return-group row px-3">
                <div class="col-2 col-sm-2 col-md-1 px-2 legend" id="legend"></div>
                <div id="grid" class="col-10 col-sm-10 col-md-11 p-0 px-2"></div>
              </div>
              <div class="row px-3 justify-content-end">
                <div id="averages" class="bottomtable col-11 col-sm-10 col-md-12 p-0 px-2"></div>
              </div>
              <div class="sharethis-inline-share-buttons mt-2" id="share-class" data-url="https://research.onrampinvest.com/#class-returns" data-title="Assets Returns" data-image="https://research.onrampinvest.com/img/asset-class-returns.png"></div>
            </div>
            <div class="card shadow-sm p-3 mt-4" id="crypto-assets">
              <div id="loader" class="my-5"></div>
              <div class="row p-3 d-flex justify-content-between align-items-center">
                <div class="d-flex col-2 col-sm-3 col-md-1 hidden-item"></div>
                <div class="d-flex flex-lg-grow-1 flex-fill justify-content-start pl-2">
                  <span class="title">Cryptocurrency Returns</span>
                </div>
                <img src="img/onramp_tm.png" class="tm-img">
              </div>
              <div class="p-2 d-flex justify-content-center btn-items" data-toggle="buttons" role="group" style="text-align: center;">
                <button class="btn btn-rounded btn-lg mx-2 btn-active" id="daily" type="button">Daily</button>
                <button class="btn btn-rounded btn-lg mx-2" id="weekly" type="button">Weekly</button>
                <button class="btn btn-rounded btn-lg mx-2" id="crypto-monthly" type="button">Monthly</button>
              </div>
              <div class="return-group row px-3 mt-3">
                <div class="col-2 col-sm-2 col-md-1 px-2 legend crypto-legend" id="crypto-legend"></div>
                <div id="crypto" class="col-10 col-sm-10 col-md-11 p-0 px-2"></div>
              </div>
              <div class="row px-3 justify-content-end">
                <div id="crypto-averages" class="bottomtable col-11 col-sm-10 col-md-12 p-0 px-2"></div>
              </div>
              <div class="row update-date hidden justify-content-end mr-3 d-flex">
                <span>Date as Of: </span>
                <span id="update-date" class="pl-2"></span>
              </div>
              <div class="sharethis-inline-share-buttons mt-4" data-url="https://research.onrampinvest.com/#crypto-assets" data-title="Cryptocurrency Assets Returns" data-image="https://research.onrampinvest.com/img/crypto-returns.png"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="status"></div>
    
  </main>
  <footer class="text-muted py-5">
    <div class="container">
      <p class="float-end mb-1">
        <a href="#">Back to top</a>
      </p>
      <p class="mb-1">© Onramp Invest
        <script type="text/javascript">document.write(new Date().getFullYear());</script>
      </p>
      <p class="mb-0">Want to know more about Onramp? <a href="https://onrampinvest.com">Visit us</a></p>
    </div>
  </footer>
  
  <script src="js/grid.js"></script>
  <script src="js/cryptocurrency.js"></script>
</body>
</html>
