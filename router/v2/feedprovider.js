
var config = require('./../../config');
const sqlHost = config.sqlHost;
const sqlPort = config.sqlPort;
const sqlUser = config.sqlUser;
const sqlPass = config.sqlPass;

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

exports.index = function(req, res) {
  console.info('/feed/provider');

  var pagesize = req.query.ps; // (req.query.ps)?req.query.ps:10;
  var page = req.query.p; // (req.query.p)?req.query.p:1;
  var qloc = req.query.loc; // (req.query.qloc)?req.query.qloc:'JP';
  var qlang = req.query.lang; // (req.query.qlang)?req.query.qlang:'zh-TW';
  var qk = req.query.k; // (req.query.qk)?req.query.qk:'';

  knexData.count('fs.ID as hit').from('FEED_SEED as fs')
  .where('Status_ID', '>', -1)
  .where(function(){
    if(qloc) {
      console.info(qloc);
      this.andWhere('fs.Loc', qloc);
    }
    if(qlang) {
      console.info(qlang);
      this.andWhere('fs.Lang', qlang);
    }
    if (qk) {
      console.info('qk='+qk);
      this.andWhere('fs.Name', 'like', '%'+qk+'%');
    }
  })
  .then(function(result){
    console.info('1 query');
    var hit = parseInt(result[0].hit);
    knexData.select('fs.ID as id', 'fs.Url as url', 'fs.Name as name', 'fs.Loc as loc', 'fs.Lang as lang',
          'fs.Status_ID as status', 'fs.Duration as ttl', 'fs.Auto_Announce as autoAnnounce')
    .from('FEED_SEED as fs')
    .where('Status_ID', '>', -1)
    .where(function(){
      if (qloc) {
        this.andWhere('fs.Loc', qloc);
      }
      if (qlang) {
        this.andWhere('fs.Lang', qlang);
      }
      if (qk) {
        // console.info('qk='+qk);
        this.andWhere('fs.Name', 'like', '%'+qk+'%');
      }
    })
    .limit(pagesize)
    .offset(pagesize*(page-1))
    .then(function(result){
      console.info('2 query');
      res.send({status: "_OK", time: new Date().getTime(), cntr:result.length, hit:hit , data: result});
    }).catch(function(err){
      console.error(err.code);
    });
  }).catch(function(err){
    console.error(err.code);
  });

  // res.send({status:"feedprovider.index_OK", time:new Date()});
}

exports.show = function(req, res) {
  res.send({status:"feedprovider.show_OK", time:new Date()});
}

exports.create = function(req, res) {
  console.info('/feed/proivder');
  var provider = req.body;
  var username = req.decoded.name;
  /* check input */

  /* insert new provider */
  knexData('FEED_SEED')
  .insert({
      Url: provider.url,
      Name: provider.name,
      Lang: provider.lang,
      Loc: provider.loc,
      Duration: provider.duration,
      Auto_Announce: 0,
      Status_ID: 0,
      Create_User: username,
      Create_Time: new Date(),
      Last_Update_User: username,
      Last_Update_Time: new Date()
  }).then(function(result){
    if (result) {
      res.send({
        status: '_OK',
        time:new Date().getTime()
      });
    } else {
      res.send({
        status: '_Failure',
        time:new Date().getTime()
      });
    }
  }).catch(function(err){
    console.error(err.code);
    res.send({
      status: '_Failure',
      time:new Date().getTime()
    });
  });
  // res.send({status:"feedprovider.create_OK", time:new Date()});
}

exports.update = function(req, res) {
  console.info('/feed/provider');
  var provider = req.body;
  var username = req.decoded.name;
  /* check input*/
  if (provider.id) {
  } else {
    res.status(400).send();
  }

  /* update db */
  if (provider.id) {
    knexData('FEED_SEED')
    .where('ID', provider.id)
    .update({
      Url: provider.url,
      Name: provider.name,
      Lang: provider.lang,
      Loc: provider.loc,
      Duration: provider.duration,
      Auto_Announce: provider.autoAnnounce,
      Last_Update_Time: new Date(),
      Last_Update_User: username
    }).then(function(result){
      if (result) {
        res.send({
          status: '_OK',
          time:new Date().getTime()
        });
      } else {
        res.send({
          status: '_Failure',
          time:new Date().getTime()
        });
      }
    }).catch(function(err){
      console.error(err.code);
      res.send({
        status: '_Failure',
        time:new Date().getTime()
      });
    });
  }
  // res.send({status:"feedprovider.update_OK", time:new Date()});
}

exports.patch = function(req, res) {
  console.info('/feed/provider');
  var patchprovider = req.body;
  var username = req.decoded.name;
  /* check input */

  /* update db */
  knexData('FEED_SEED')
  .where('ID', patchprovider.id)
  .update({
    Status_ID: patchprovider.status,
    Last_Update_Time: new Date(),
    Last_Update_User: username
  }).then(function(result){
    if (result) {
      res.send({
        status: '_OK',
        time:new Date().getTime()
      });
    } else {
      res.send({
        status: '_Failure',
        time:new Date().getTime()
      });
    }
  }).catch(function(err){
    console.error(err.code);
    res.send({
      status: '_Failure',
      time:new Date().getTime()
    });
  });
  // res.send({status:"feedprovider.patch_OK", time:new Date()});
}
