
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
  console.info('/coupon/area');

  var loc = req.query.loc;
  var st = req.query.st;

  if (st) {
    if(st!=1 && st!=0 && st!=-1) {
      res.send({
        status: '_Failure',
        time:new Date().getTime()
      });
    }
  }
  if (loc) {
    if (loc!='TW' && loc!='JP') {
      res.send({
        status: '_Failure',
        time:new Date().getTime()
      });
    }
  } else {
    res.send({
      status: '_Failure',
      time:new Date().getTime()
    });
  }

  knexData.select('a.ID as id', 'a.Sort as sort', 'a.Status_ID as status', 'ae.Lang as lang', 'ae.Name as name')
  .from('COUPON_AREA as a')
  .join('COUPON_AREA_EXPRESSION as ae', function(){
    this.on('a.ID', 'ae.ID');
  })
  .where(function(){
    if (st==1 || st==0 || st==-1) {
      this.where('a.Status_ID', st);
    } else {
      this.where('a.Status_ID', '!=', -1);
    }
  })
  .andWhere('a.Loc', loc)
  .orderBy('a.Sort')
  .then(function(result){
    var resMap = {};
    result.forEach(function(entry){
      if (resMap[entry.id]) {
      } else {
        resMap[entry.id] = [];
      }
      var data = {
        id: entry.id,
        lang: entry.lang,
        name: entry.name,
        sort: entry.sort,
        status: entry.status
      };
      resMap[entry.id].push(data);
    });

    var resList = Object.keys(resMap).map(function(key){
      var item = {};
      resMap[key].forEach(function(entry){
        if (item.id) {
        } else {
          item.id = entry.id;
        }
        if (item.sort) {
        } else {
          item.sort = entry.sort;
        }
        if (item.status) {
        } else {
          item.status = entry.status;
        }
        if (item.name) {
        } else {
          item.name = {};
        }
        item.name[entry.lang] = entry.name;
      });
      return item;
    });

    resList.sort(function(a,b){return (a.sort>b.sort)?1:((b.sort>a.sort)?-1:0);});

    res.send({
      status: '_OK',
      time:new Date().getTime(),
      cntr:resList.length,
      hit:resList.length,
      data:resList
    });
  })
  .catch(function(err){
    console.log(err);
    res.send({
      status: '_Failure',
      time:new Date().getTime()
    });
  });
  // res.send({status:"couponarea.index_OK", time:new Date()});
}

exports.show = function(req, res) {
  res.send({status:"couponarea.show_OK", time:new Date()});
}

exports.create = function(req, res) {
  console.info('/coupon/area');
  var loc = req.body.loc;
  var name = req.body.name;

  knexData('COUPON_AREA')
  .insert({
    'ID': null,
    'Loc': loc,
    'Sort': 127,
    'Status_ID': 0,
    'Last_Update_Time': new Date()
  }).then(function(result){
    var areaExpr = [];
    areaExpr.push({
      'ID': result,
      'Lang': 'en',
      'Name': name['en']
    });
    areaExpr.push({
      'ID': result,
      'Lang': 'ja',
      'Name': name['ja']
    });
    areaExpr.push({
      'ID': result,
      'Lang': 'zh-TW',
      'Name': name['zh-TW']
    });

    knexData.batchInsert('COUPON_AREA_EXPRESSION', areaExpr)
    .then(function(result){
      res.send({
        status: '_OK',
        time:new Date().getTime()
      });
    }).catch(function(err){
      console.error(err);
      res.send({
        status: '_Failure',
        time:new Date().getTime()
      });
    });
  }).catch(function(err){
    console.error(err);
    res.send({
      status: '_Failure',
      time:new Date().getTime()
    });
  });
  // res.send({status:"couponarea.create_OK", time:new Date()});
}

exports.update = function(req, res) {
  console.info('PUT /coupon/area');
  var loc = req.body.loc;
  var name = req.body.name;
  var id = req.body.id;

  knexData('COUPON_AREA')
  .where('ID', id)
  .update({
    Loc: loc,
    Last_Update_Time: new Date()
  }).then(function(result){
    Promise.all([
      insertAreaExpr(id, 'en', name['en']),
      insertAreaExpr(id, 'ja', name['ja']),
      insertAreaExpr(id, 'zh-TW', name['zh-TW'])
    ]).then(function(value){
      res.send({
        status: '_OK',
        time:new Date().getTime()
      });
    }).catch(function(err){
      console.error(err);
      res.send({
        status: '_Failure',
        time: new Date().getTime()
      })
    });
  }).catch(function(err){
    console.error(err);
    res.send({
      status: '_Failure',
      time: new Date().getTime()
    })
  });
  // res.send({status:"couponarea.update_OK", time:new Date()});
}

exports.patch = function(req, res) {
  console.info('/coupon/area');
  var id = req.body.id;
  var st = req.body.status;

  knexData('COUPON_AREA')
  .where('ID', id)
  .update({
    Status_ID: st,
    Last_Update_Time: new Date()
  }).then(function(result){
    // check result?
    res.send({
      status: '_OK',
      time: new Date().getTime()
    });
  }).catch(function(err){
    console.error(err);
    res.send({
      status: '_Failure',
      time: new Date().getTime()
    });
  });
  // res.send({status:"couponarea.patch_OK", time:new Date()});
}

//
var insertAreaExpr = function(id, lang, name) {
  knexData('COUPON_AREA_EXPRESSION')
  .where('ID', id)
  .andWhere('Lang', lang)
  .update({
    'Name': name
  }).then(function(result){    // console.info('res='+result);
  }).catch(function(err){
    console.error(err);
  });
};
