var express = require('express');
var app = express();
var cors = require('express-cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');


// Routing Import
var auth0 = require('./router/auth0');
var general = require('./router/v2/general');
var feed = require('./router/v2/feed');
var feedcategory = require('./router/v2/feedcategory');
var feedprovider = require('./router/v2/feedprovider');
var coupon = require('./router/v2/coupon');
var couponarea = require('./router/v2/couponarea');
var couponcategory = require('./router/v2/couponcategory');
var spot = require('./router/v2/spot');
var merchant = require('./router/v2/merchant');

// Constants Import
var config = require('./config');
const superSecret = config.secret;
const sqlHost = config.sqlHost;
const sqlPort = config.sqlPort;
const sqlUser = config.sqlUser;
const sqlPass = config.sqlPass;
const redisHost = config.redisHost;
const redisPort = config.redisPort;
const redisPass = config.redisPass;
const env = config.env;
const apiPort = config.iapiPort;

/*****
* API Setup
*****/
// app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/api', expressJwt({secret: 'secret', credentialsRequired: false}).unless({path:['/api/token']}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
  next();
});

/*****
* Database Setup
*****/
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: sqlHost,
    port: sqlPort,
    user: sqlUser,
    password: sqlPass,
    database: 'z-mgr'
  }
});
var knexData = require('knex')({
  client: 'mysql',
  connection: {
    host: sqlHost,
    port: sqlPort,
    user: sqlUser,
    password: sqlPass,
    database: 'zipdb'
  }
});
var redis = require('redis'),
    RDS_PORT = redisPort,
    RDS_HOST = redisHost,
    RDS_PWD = redisPass,
    RDS_OPTS = {auth_pass:RDS_PWD},
    client = redis.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);
client.on('ready', function(res){
  console.info('redis ready');
});

/*****
* API Routeing
*****/
// authority
app.get('/api/token', auth0.get);

// General
app.get('/api', general.general);

// Spot
app.get('/api/spot', spot.index);
app.get('/api/spot/:id', spot.show);
app.post('/api/spot', spot.create);
app.put('/api/spot/:id', spot.update);
app.patch('/api/spot/:id', spot.patch);
app.delete('/api/spot/:id', spot.delete);
app.patch('/api/spot/:spotid/majorphoto/:photoid', spot.patchphoto);
app.delete('/api/spot/:spotid/removephoto/:photoid', spot.deletephoto);

// Merchant
app.get('/api/merchant', merchant.index);
app.get('/api/merchant/:id', merchant.show);
app.post('/api/merchant', merchant.create);
app.put('/api/merchant/:id', merchant.update);
app.patch('/api/merchant/:id', merchant.patch);
app.delete('/api/merchant/:id', merchant.delete);

// Coupon Area
app.get('/api/coupon/area', couponarea.index);
app.get('/api/coupon/area/:id', couponarea.show);
app.post('/api/coupon/area', couponarea.create);
app.put('/api/coupon/area/:id', couponarea.update);
app.patch('/api/coupon/area/:id', couponarea.patch);

// Coupon Category
app.get('/api/coupon/category', couponcategory.index);
app.get('/api/coupon/category/:id', couponcategory.show);
app.post('/api/coupon/category', couponcategory.create);
app.put('/api/coupon/category/:id', couponcategory.update);
app.patch('/api/coupon/category/:id', couponcategory.patch);

// Coupon
app.get('/api/coupon', coupon.index);
app.get('/api/coupon/:id', coupon.show);
app.post('/api/coupon', coupon.create);
app.put('/api/coupon/:id', coupon.update);
app.patch('/api/coupon/:id', coupon.patch);

// Feed Categories
app.get('/api/feed/category', feedcategory.index);
app.get('/api/feed/category/:id', feedcategory.show);
app.post('/api/feed/category', feedcategory.create);
app.put('/api/feed/category/:id', feedcategory.update);
app.patch('/api/feed/category/:id', feedcategory.patch);

// Feed Provider
app.get('/api/feed/provider', feedprovider.index);
app.get('/api/feed/provider/:id', feedprovider.show);
app.post('/api/feed/provider', feedprovider.create);
app.put('/api/feed/provider/:id', feedprovider.update);
app.patch('/api/feed/provider/:id', feedprovider.patch);

// Feed
app.get('/api/feed', feed.index);
app.get('/api/feed/:id', feed.show);
app.post('/api/feed', feed.create);
app.put('/api/feed/:id', feed.update);
app.patch('/api/feed/:id', feed.patch);
app.delete('/api/feed/:id', feed.delete);



app.get('/api/detoken', function(req, res) {
  console.info(req.user);
  res.send();
});

app.listen(apiPort, function() {
  console.info('api server listening at :%s', apiPort);
});

app.use(function(req, res, next){
  res.status(404).send({status: '_Failure', time:new Date()});
  return;
});

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({status:"_Failure", time:new Date(), message:'invalid token'});
  }
});
