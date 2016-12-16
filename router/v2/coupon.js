
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
  console.info('/coupon');

  var country = req.query.loc;
  var areacode = req.query.ac;
  var category = req.query.c;
  var merchant = req.query.m;
  var status = req.query.st;

  knexData.select('c.ID as id',
   'c.Expire_Time as expireTime', 'c.Active_Time as activeTime',
   'c.Status_ID as status',
   'c.Category_ID as cid',
   'c.Areacode as acid', 'cae.Name as acname',
   'c.Merchant_ID as mid', 'm.Name as mname',
   'c.Spot_ID as spotid',
   'ce.Lang as lang', 'ce.Name as name')
  .from('COUPON as c')
  .join('COUPON_EXPRESSION as ce', function(){
    this.on('c.ID', 'ce.ID');
  })
  .join('COUPON_AREA_EXPRESSION as cae', function(){
    this.on('c.Areacode', 'cae.ID');
    this.andOn('cae.Lang', 'ce.Lang');
  })
  .join("MERCHANT as m", function(){
    this.on('m.ID', 'c.Merchant_ID')
  })
  .where(function(){
    if (status) {
      this.where('c.Status_ID', status);
    } else {
      this.where('c.Status_ID', '>', -1);
    }
  })
  .then(function(result){
    // console.info(result);
    var resMap = {};
    result.forEach(function(entry){
      if (resMap[entry.id]) {
      } else {
        resMap[entry.id] = [];
      }
      var data = {
        id: entry.id,
        expireTime: entry.expireTime,
        activeTime: entry.activeTime,
        name: entry.name,
        cid: entry.cid,
        acid: entry.acid,
        acname: entry.acname,
        mid: entry.mid,
        mname: entry.mname,
        spotid: entry.spotid,
        spotname: entry.spotname,
        status: entry.status,
        lang: entry.lang
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
        if (item.expireTime) {
        } else {
          item.expireTime = entry.expireTime.getTime();
        }
        if (item.activeTime) {
        } else {
          item.activeTime = entry.activeTime.getTime();
        }
        if (item.acid) {
        } else {
          item.acid = entry.acid;
        }
        if (item.cid) {
        } else {
          item.cid = entry.cid;
        }
        if (item.mid) {
        } else {
          item.mid = entry.mid;
        }
        if (item.mname) {
        } else {
          item.mname = entry.mname;
        }
        if (item.spotid) {
        } else {
          item.spotid = entry.spotid;
        }
        if (item.status) {
        } else {
          item.status = entry.status;
        }
        if (item.name) {
        } else {
          item.name = {};
        }
        if (item.acname) {
        } else {
          item.acname = {};
        }
        if (item.spotname) {
        } else {
          item.spotname = {};
        }
        item.name[entry.lang] = entry.name;
        item.acname[entry.lang] = entry.acname;
        item.spotname[entry.lang] = entry.spotname;

      });
      return item;
    });

    res.send({
      status: '_OK',
      time:new Date().getTime(),
      // cnt?, hits?
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

  // res.send({status:"coupon.index_OK", time:new Date()});
}

exports.show = function(req, res) {
  console.info('/coupon');

  var cpid = req.params.id;
  var country = req.query.loc;
  var areacode = req.query.ac;
  var category = req.query.c;
  var merchant = req.query.m;
  var status = req.query.st;

  knexData.select('c.ID as id',
   'c.Expire_Time as expireTime', 'c.Active_Time as activeTime',
   'c.Status_ID as status',
   'c.Category_ID as cid',
   'c.Areacode as acid', 'cae.Name as acname',
   'c.Merchant_ID as mid',
   'm.Name as mname', 'm.Loc as loc',
   'c.Spot_ID as spotid',
   'c.ImageUrl as imageurl',
   'ce.Lang as lang', 'ce.Name as name', 'ce.Brief_Description as bdesc', 'ce.Description as desc', 'ce.Memo as memo')
  .from('COUPON as c')
  .join('COUPON_EXPRESSION as ce', function(){
    this.on('c.ID', 'ce.ID');
  })
  .join('COUPON_AREA_EXPRESSION as cae', function(){
    this.on('c.Areacode', 'cae.ID');
    this.andOn('cae.Lang', 'ce.Lang');
  })
  .join("MERCHANT as m", function(){
    this.on('m.ID', 'c.Merchant_ID')
  })
  .where('c.ID', cpid)
  .then(function(result){
    var resMap = {};
    result.forEach(function(entry){
      if (resMap[entry.id]) {
      } else {
        resMap[entry.id] = [];
      }
      var data = {
        id: entry.id,
        expireTime: entry.expireTime,
        activeTime: entry.activeTime,
        name: entry.name,
        bdesc: entry.bdesc,
        desc: entry.desc,
        memo: entry.memo,
        cid: entry.cid,
        loc: entry.loc,
        acid: entry.acid,
        acname: entry.acname,
        mid: entry.mid,
        mname: entry.mname,
        spotid: entry.spotid,
        spotname: entry.spotname,
        status: entry.status,
        lang: entry.lang,
        imageurl: entry.imageurl
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
        if (item.expireTime) {
        } else {
          item.expireTime = entry.expireTime.getTime();
        }
        if (item.activeTime) {
        } else {
          item.activeTime = entry.activeTime.getTime();
        }
        if (item.acid) {
        } else {
          item.acid = entry.acid;
        }
        if (item.cid) {
        } else {
          item.cid = entry.cid;
        }
        if (item.mid) {
        } else {
          item.mid = entry.mid;
        }
        if (item.loc) {
        } else {
          item.loc = entry.loc;
        }
        if (item.mname) {
        } else {
          item.mname = entry.mname;
        }
        if (item.spotid) {
        } else {
          item.spotid = entry.spotid;
        }
        if (item.imageurl) {
        } else {
          item.imageurl = entry.imageurl;
        }
        if (item.status) {
        } else {
          item.status = entry.status;
        }
        if (item.name) {
        } else {
          item.name = {};
        }
        if (item.bdesc) {
        } else {
          item.bdesc = {};
        }
        if (item.desc) {
        } else {
          item.desc = {};
        }
        if (item.memo) {
        } else {
          item.memo = {};
        }
        if (item.acname) {
        } else {
          item.acname = {};
        }
        if (item.spotname) {
        } else {
          item.spotname = {};
        }
        item.name[entry.lang] = entry.name;
        item.bdesc[entry.lang] = entry.bdesc;
        item.desc[entry.lang] = entry.desc;
        item.memo[entry.lang] = entry.memo;
        item.acname[entry.lang] = entry.acname;
        item.spotname[entry.lang] = entry.spotname;

      });
      return item;
    });

    res.send({
      status: '_OK',
      time: new Date().getTime(),
      // cnt? hits?
      data:resList
    });
  })
  .catch(function(err){
    console.log(err);
    res.send({
      status: '_Failure',
      time: new Date().getTime()
    });
  });

  // res.send({status:"coupon.show_OK", time:new Date()});
}

exports.create = function(req, res) {
  console.info('POST /coupon');
  console.info(req.body);
  console.info(req.body.json);

  /* validation */
  var id = uuid.v4();
  var body = JSON.parse(req.body.json);
  var aTime = parseInt(body.activeTime);
  var eTime = parseInt(body.expireTime);
  var merchant = body.merchant;
  var spot = body.spot; // this could be dangerous when spot becomes to an array
  var area = body.area;

  var s_tags = '';
  body.categoryTags.forEach(function(value){
    s_tags += '"'+value+'",';
  });
  s_tags = '[' + s_tags.substr(0, s_tags.length-1) + ']';

  var insertCouponData;
  if (req.files.img) {
    var temp_path = req.files.img.path;
    // var file_name = req.files.img.name;
    var file_name = 'coupon-'+id+'.jpg';
    var new_location; // change by env.

    if (env=='prod') {
      new_location = 'pro_uploads/';
    } else if (env=='stg') {
      new_location = '/a/stg-qa-nintl101z/zipang_asia/cpnImg/';
    } else {
      new_location = 'uploads/';
    }

    insertCouponData = {
      ID: id,
      Merchant_ID: merchant,
      Spot_ID: spot,
      Category_ID: s_tags,
      Expire_Time: new Date(eTime),
      Active_Time: new Date(aTime),
      Status_ID: 1,
      Last_Update_Time: new Date(),
      Areacode: area,
      ImageUrl: file_name
    };

    fs.copy(temp_path, new_location+file_name, function(err){
      if (err) {
        console.error(err);
        res.send({
          status: '_Failure',
          time: new Date().getTime()
        });
      } else {
        if (insertCouponFunc(id, insertCouponData, body, merchant, spot, area, aTime, eTime, s_tags)) {
          res.send({
            status: '_OK',
            time: new Date().getTime()
          });
        } else {
          res.send({
            status: '_Failure',
            time:new Date().getTime()
          });
        }
      }
    });
  } else {
    insertCouponData = {
      ID: id,
      Merchant_ID: merchant,
      Spot_ID: spot,
      Category_ID: s_tags,
      Expire_Time: new Date(eTime),
      Active_Time: new Date(aTime),
      Status_ID: 1,
      Last_Update_Time: new Date(),
      Areacode: area,
      ImageUrl: null
    };

    if (insertCouponFunc(id, insertCouponData, body, merchant, spot, area, aTime, eTime, s_tags)) {
      res.send({
        status: '_OK',
        time: new Date().getTime()
      });
    } else {
      res.send({
        status: '_Failure',
        time: new Date().getTime()
      });
    }
  }
  // res.send({status:"coupon.create_OK", time:new Date()});
}

exports.update = function(req, res) {
  console.info('PUT /coupon');

  /* validation */
  var body = JSON.parse(req.body.json);
  var id = req.params.id;
  var aTime = parseInt(body.activeTime);
  var eTime = parseInt(body.expireTime);
  var merchant = body.merchant;
  var spot = body.spot; // this could be dangerous when spot becomes to an array
  var area = body.area;
  var imagename = body.imagename;

  var s_tags = '';
  body.categoryTags.forEach(function(value){
    s_tags += '"'+value+'",';
  });

  s_tags = '[' + s_tags.substr(0, s_tags.length-1) + ']';


  var updateCouponData;
  if (req.files.img) {
    var temp_path = req.files.img.path;
    // var file_name = req.files.img.name;
    var file_name = 'coupon-'+id+'.jpg';
    var new_location; // change by env.

    if (env=='prod') {
      new_location = 'pro_uploads/';
    } else if (env=='stg') {
      new_location = '/a/stg-qa-nintl101z/zipang_asia/cpnImg/';
    } else {
      new_location = 'uploads/';
    }

    updateCouponData =   {
        Spot_ID: spot,
        Category_ID: s_tags,
        Expire_Time: new Date(eTime),
        Active_Time: new Date(aTime),
        Last_Update_Time: new Date(),
        Areacode: area,
        ImageUrl: file_name
      };
    fs.copy(temp_path, new_location+file_name, function(err){
      if (err) {
        console.error(err);
        res.send({
          status: '_Failure',
          time:new Date().getTime()
        });
      } else {
        if (updateCouponFunc(id, updateCouponData, body, merchant, spot, area, aTime, eTime, s_tags)) {
          res.send({
            status: '_OK',
            time:new Date().getTime()
          });
        } else {
          res.send({
            status: '_Failure',
            time: new Date().getTime()
          });
        }
      }
    });
  } else if (imagename=='') {
    updateCouponData =   {
        Spot_ID: spot,
        Category_ID: s_tags,
        Expire_Time: new Date(eTime),
        Active_Time: new Date(aTime),
        Last_Update_Time: new Date(),
        Areacode: area,
        ImageUrl: null
      };
    if (updateCouponFunc(id, updateCouponData, body, merchant, spot, area, aTime, eTime, s_tags)) {
      res.send({
        status: '_OK',
        time: new Date().getTime()
      });
    } else {
      res.send({
        status: '_Failure',
        time:new Date().getTime()
      });
    }
  } else {
    updateCouponData =   {
        Spot_ID: spot,
        Category_ID: s_tags,
        Expire_Time: new Date(eTime),
        Active_Time: new Date(aTime),
        Last_Update_Time: new Date(),
        Areacode: area
      };
    if (updateCouponFunc(id, updateCouponData, body, merchant, spot, area, aTime, eTime, s_tags)) {
      res.send({
        status: '_OK',
        time:new Date().getTime()
      });
    } else {
      res.send({
        status: '_Failure',
        time: new Date().getTime()
      });
    }
  }

  // res.send({status:"coupon.update_OK", time:new Date()});
}

exports.patch = function(req, res) {
  console.info('PATCH /coupon');
  var status = req.body.status;
  var id = req.params.id;

  if(status!=1 && status!=0 && status!=-1) {
    res.send({
      status: '_Failure',
      time: new Date().getTime()
    });
  }

  knexData('COUPON').update({
    Status_ID: status,
    Last_Update_Time: new Date()
  }).where('ID', id)
  .then(function(result){
    var data = {
      id: id,
      status: status,
      op: 'patch'
    };
    client.lpush('coupon-index', JSON.stringify(data));
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
  // res.send({status:"coupon.patch_OK", time:new Date()});
}

exports.delete = function(req, res) {
  console.info('DELETE /coupon');
  var id = req.params.id;

  knexData('COUPON').update({
    Status_ID: -1,
    Last_Update_Time: new Date()
  }).where('ID', id)
  .then(function(result){
    var data = {
      id: id,
      op: 'delete'
    }
    client.lpush('coupon-index', JSON.stringify(data));
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

  // res.send({status:"coupon.delete_OK", time:new Date()});
}

//
var insertCouponFunc = function(id, insertCouponData, body, merchant, spot, area, aTime, eTime, s_tags) {
  knexData('COUPON')
  .insert(insertCouponData).then(function(result){
    var couponExpArray = [];
    var couponExp_en = {
      ID: id,
      Lang: 'en',
      Name: body.name.en,
      Brief_Description: body.bdesc.en,
      Description: body.desc.en,
      Memo: body.memo.en
    }
    var couponExp_ja = {
      ID: id,
      Lang: 'ja',
      Name: body.name.ja,
      Brief_Description: body.bdesc.ja,
      Description: body.desc.ja,
      Memo: body.memo.ja
    }
    var couponExp_zhtw = {
      ID: id,
      Lang: 'zh-TW',
      Name: body.name.zhtw,
      Brief_Description: body.bdesc.zhtw,
      Description: body.desc.zhtw,
      Memo: body.memo.zhtw
    }

    couponExpArray.push(couponExp_en);
    couponExpArray.push(couponExp_ja);
    couponExpArray.push(couponExp_zhtw);

    knexData.batchInsert('COUPON_EXPRESSION', couponExpArray)
    .returning('id')
    .then(function(ids){
      var data = {
        id: id,
        merchant: merchant,
        spot: spot,
        areacode: {
          id: area
        },
        category: {
          id: JSON.parse(s_tags)
        },
        activeTime: aTime,
        expireTime: eTime,
        status: 1
      };
      client.lpush('coupon-index', JSON.stringify(data));
      return true;
    }).catch(function(err){
      console.error(err);
      return false;
    });
  }).catch(function(err){
    console.error(err);
    return false;
  });
};

var updateCouponFunc = function(id, updateCouponData, body, merchant, spot, area, aTime, eTime, s_tags) {
  knexData('COUPON')
  .update(updateCouponData)
  .where('ID', id)
  .then(function(result){
    var couponExp_en = {
      ID: id,
      Lang: 'en',
      Name: body.name.en,
      Brief_Description: body.bdesc.en,
      Description: body.desc.en,
      Memo: body.memo.en
    }
    var couponExp_ja = {
      ID: id,
      Lang: 'ja',
      Name: body.name.ja,
      Brief_Description: body.bdesc.ja,
      Description: body.desc.ja,
      Memo: body.memo.ja
    }
    var couponExp_zhtw = {
      ID: id,
      Lang: 'zh-TW',
      Name: body.name.zhtw,
      Brief_Description: body.bdesc.zhtw,
      Description: body.desc.zhtw,
      Memo: body.memo.zhtw
    }

    knexData('COUPON_EXPRESSION')
    .update({
      Name: body.name.en,
      Brief_Description: body.bdesc.en,
      Description: body.desc.en,
      Memo: body.memo.en
    }).where('ID', id)
    .andWhere('Lang', 'en')
    .then(function(result){
      knexData('COUPON_EXPRESSION')
      .update({
        Name: body.name.ja,
        Brief_Description: body.bdesc.ja,
        Description: body.desc.ja,
        Memo: body.memo.ja
      }).where('ID', id)
      .andWhere('Lang', 'ja')
      .then(function(result){
        knexData('COUPON_EXPRESSION')
        .update({
          Name: body.name.zhtw,
          Brief_Description: body.bdesc.zhtw,
          Description: body.desc.zhtw,
          Memo: body.memo.zhtw
        }).where('ID', id)
        .andWhere('Lang', 'zh-TW')
        .then(function(result){
          var data = {
            id: id,
            merchant: merchant,
            spot: spot,
            areacode: {
              id: area
            },
            category: {
              id: JSON.parse(s_tags)
            },
            activeTime: aTime,
            expireTime: eTime,
            op: "update"
          };
          client.lpush('coupon-index', JSON.stringify(data));
          client.hdel('CouponExprMapping', id);
          return true;
        }).catch(function(err){
          console.error(err);
          return false;
        });
      }).catch(function(err){
        console.error(err);
        return false;
      });
    }).catch(function(err){
      console.error(err);
      return false;
    });
  }).catch(function(err){
    console.error(err);
    return false;
  });
};
