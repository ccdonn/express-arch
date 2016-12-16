
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
  console.info('/merchant');
  // console.info(req.query.q);
  var pagesize = (req.query.ps)?req.query.ps:50;
  var page = (req.query.p)?req.query.p:1;
  var loc = req.query.loc;
  var st = req.query.st;
  var qkey = req.query.q;
  var checkPass = true;

  if (st) {
    if(st!=1 && st!=0 && st!=-1) {
      // throw exception
      checkPass = false;
      res.send({
        status: '_Failure',
        time: new Date().getTime()
      });
    }
  }
  if (loc) {
    if (loc!='TW' && loc!='JP') {
      checkPass = false;
      res.send({
        status: '_Failure',
        time: new Date().getTime()
      });
    }
  } else {
    checkPass = false;
    res.send({
      status: '_Failure',
      time: new Date().getTime()
    });
  }

  if (checkPass) {
    knexData.count('m.ID as hit').from('MERCHANT as m')
    .where(function(){
      if (st==1 || st==0 || st==-1) {
        this.where('m.Status_ID', st);
      } else {
        this.where('m.Status_ID', '!=', -1);
      }
    })
    .andWhere(function(){
      if (loc) {
        this.where('m.Loc', loc);
      }
    })
    .andWhere(function(){
      if (qkey) {
        this.where('m.Name', 'like', '%'+qkey+'%');
      }
    })
    .then(function(result){
      var hit = result[0].hit;
      knexData.select('m.ID as id', 'm.Name as name', 'm.Loc as loc', 'm.Status_ID as status')
      .count('s.Spot_ID as sptcnt')
      .from('MERCHANT as m')
      .leftJoin('SPOT as s', function(){
        this.on(function(){
          this.on('s.Merchant_ID', 'm.ID');
          this.andOn('s.Status_ID', '>', -1);
        })
      })
      .where(function(){
        if (st==1 || st==0 || st==-1) {
          this.where('m.Status_ID', st);
        } else {
          this.where('m.Status_ID', '!=', -1);
        }
      })
      .andWhere(function(){
        if (loc) {
          this.where('m.Loc', loc);
        }
      })
      .andWhere(function(){
        if (qkey) {
          this.where('m.Name', 'like', '%'+qkey+'%');
        }
      })
      .groupBy('m.ID')
      .having('sptcnt', '>=', 0)
      .limit(pagesize)
      .offset(pagesize*(page-1))
      .then(function(result) {
        res.send({
          status: '_OK',
          time: new Date().getTime(),
          cntr :result.length,
          hit :hit,
          data: result
        });
      }).catch(function(err){
        console.error(err);
        res.send({
          status: '_Failure',
          time: new Date().getTime()
        });
      });
    });
  }

  // res.send({status:"merchant.index_OK", time:new Date()});
}

exports.show = function(req, res) {
  console.info('/merchant/:id');
  var id = req.params.id;
  knexData.from('MERCHANT as m')
  .leftJoin('SPOT as s', function(){
    this.on('m.ID', 's.Merchant_ID');
    this.andOn('s.Status_ID', '>', -1);
  })
  .leftJoin('SPOT_EXPRESSION as se', function(){
    this.on('se.ID', 's.Spot_ID')
  })
  .where('m.ID', id)
  .then(function(result){
    // ?
    if (!result) {
      res.send({
        status: '_OK',
        time: new Date().getTime(),
        data: returnData
      });
    } else {
      var resMap = {};
      result.forEach(function(entry){
        if (entry.Spot_ID) {
          if (resMap[entry.Spot_ID]) {
          } else {
            resMap[entry.Spot_ID] = [];
          }
          var data = {
            sptid: entry.Spot_ID,
            lang: entry.Lang,
            sname: entry.Display_Name,
            scountry: entry.Country,
            scity: entry.City,
            saddress: entry.Address
          };
          resMap[entry.Spot_ID].push(data);
        }
      });
      var resList = [];
      console.info(Object.keys(resMap).length);
      if (Object.keys(resMap).length>0) {
        resList = Object.keys(resMap).map(function(key){
          var item = {};
          resMap[key].forEach(function(entry){
            if (item.id) {
            } else {
              item.id = entry.sptid;
            }
            if (item.name) {
            } else {
              item.name = {};
            }
            if (item.country) {
            } else {
              item.country = {};
            }
            if (item.city) {
            } else {
              item.city = {};
            }
            if (item.address) {
            } else {
              item.address = {};
            }
            item.name[entry.lang] = entry.sname;
            item.country[entry.lang] = entry.scountry;
            item.city[entry.lang] = entry.scity;
            item.address[entry.lang] = entry.saddress;

          });
          return item;
        });
      }

      var returnData = {
        id: id,
        name: result[0].Name,
        loc: result[0].Loc,
        spots: resList
      };
      console.info(returnData);
      res.send({
        status: '_OK',
        time: new Date().getTime(),
        // cnt? hit?
        data:returnData
      });
    }
  })
  .catch(function(err){
    console.error(err);
    res.send({
      status: '_Failure',
      time: new Date().getTime()
    });
  });
  // res.send({status:"merchant.show_OK", time:new Date()});
}

exports.create = function(req, res) {
  console.info('/merchant');
  var name = req.body.name;
  var loc = req.body.loc;

  knexData('MERCHANT')
  .insert({
    ID: uuid.v4(),
    Name: name,
    Loc: loc,
    Status_ID: 1,
    Last_Update_Time: new Date()
  }).then(function(result){
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

  // res.send({status:"merchant.create_OK", time:new Date()});
}

exports.update = function(req, res) {
  console.info('/merchant');
  var id = req.body.id;
  var name = req.body.name;
  var loc = req.body.loc;

  knexData('MERCHANT')
  .where('ID', id)
  .update({
    Name: name,
    Loc: loc,
    Last_Update_Time: new Date()
  }).then(function(result){
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
  // res.send({status:"merchant.update_OK", time:new Date()});
}

exports.patch = function(req, res) {
  console.info('/merchant');
  var id = req.body.id;
  var st = req.body.status;

  knexData('MERCHANT')
  .where('ID', id)
  .update({
    Status_ID: st,
    Last_Update_Time: new Date()
  }).then(function(result){
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

  // res.send({status:"merchant.patch_OK", time:new Date()});
}

exports.delete = function(req, res) {
  console.info('/merchant');
  var id = req.body.id;

  knexData('MERCHANT')
  .where('ID', id)
  .update({
    Status_ID: -1,
    Last_Update_Time: new Date()
  }).then(function(result){
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
  // res.send({status:"merchant.delete_OK", time:new Date()});
}
