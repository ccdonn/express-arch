
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
  console.info('/coupon/category');

  var st = req.query.st;
  if(st!=1 && st!=0 && st!=-1) {
    res.send({
      status: '_Failure',
      time:new Date().getTime()
    });
  }

  knexData.select('c.ID as id', 'c.Sort as sort', 'c.Status_ID as status', 'ce.Lang as lang', 'ce.Name as name')
  .from('COUPON_CATEGORY as c')
  .join('COUPON_CATEGORY_EXPRESSION as ce', function(){
    this.on('c.ID', 'ce.ID');
  })
  .where(function(){
    if (st==1 || st==0 || st==-1) {
      this.where('c.Status_ID', st);
    } else {
      this.where('c.Status_ID', '!=', -1);
    }
  })
  .orderBy('c.Sort')
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
      time: new Date().getTime(),
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
  // res.send({status:"couponcategory.index_OK", time:new Date()});
}

exports.show = function(req, res) {
  res.send({status:"couponcategory.show_OK", time:new Date()});
}

exports.create = function(req, res) {
  res.send({status:"couponcategory.create_OK", time:new Date()});
}

exports.update = function(req, res) {
  res.send({status:"couponcategory.update_OK", time:new Date()});
}

exports.patch = function(req, res) {
  res.send({status:"couponcategory.patch_OK", time:new Date()});
}
