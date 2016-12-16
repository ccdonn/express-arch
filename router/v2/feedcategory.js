
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
  console.info('/feed/category');
  var qs = (req.query.s)?req.query.s:'';
  var qloc = (req.query.loc)?req.query.loc:'TW';
  var qk = (req.query.k)?req.query.k:'';

  knexData.select('fc.ID as id', 'fc.MType as mType', 'fc.Last_Update_Time as lastUpdateTime',
  'fc.Editor as editor', 'fc.Country as loc', 'fc.Status_ID as status',
  'fce1.Value as displayValue', 'fce1.Lang as displayValueLang',
  'fc.Sort as sort')
  .from('FEED_CATEGORY as fc')
  .join('FEED_CATEGORY_EXPRESSION as fce', function(){
    this.on(function(){
      this.on('fce.ID', 'fc.ID');
      this.andOn('fce.Type', 1)
    })
  })
  .where(function(){
    if (qs) {
      this.where('fc.Status_ID', qs);
    } else {
      this.where('fc.Status_ID', '>', -1);
    }
    if (qloc) {
      this.where('fc.Country', qloc);
    }
  })
  .orderBy('fc.Sort')
  .then(function(result){
    var resMap = {};
    result.forEach(function(entry){
      var data = {
        id: entry.id,
        mType: entry.mType,
        loc: entry.loc,
        status: entry.status,
        editor: entry.editor,
        lastUpdateTime: entry.lastUpdateTime,
        displayValue: entry.displayValue,
        displayValueLang: entry.displayValueLang,
        sort: entry.sort
      };

      if (resMap[entry.id]) {
      } else {
        resMap[entry.id] = [];
      }

      resMap[entry.id].push(data);
    });

    // console.info(resMap);

    var resList = Object.keys(resMap).map(function(key){
      var item = {};
      resMap[key].forEach(function(entry){
        if (item.id) {
        } else {
          item.id = entry.id;
        }

        if (item.status) {
        } else {
          item.status = entry.status;
        }

        if (item.mType) {
        } else {
          item.mType = entry.mType;
        }

        if (item.loc) {
        } else {
          item.loc = entry.loc;
        }

        if (item.editor) {
        } else {
          item.editor = entry.editor;
        }

        if (item.lastUpdateTime) {
        } else {
          item.lastUpdateTime = entry.lastUpdateTime;
        }

        if (item.displayValue) {
        } else {
          item.displayValue = {};
        }

        if (item.sort) {
        } else {
          item.sort = entry.sort;
        }

        item.displayValue[entry.displayValueLang] = entry.displayValue;
      });
      return item;
    });

    resList.sort(function(a,b) {return (a.sort > b.sort) ? 1 : ((b.sort > a.sort) ? -1 : 0);})

    res.send({
      status: "_OK",
      time:new Date().getTime(),
      cntr:resList.length,
      hit:resList.length,
      data:resList
    });
  });

  // res.send({status:"feedcategory.index_OK", time:new Date()});
}

exports.show = function(req, res) {
  res.send({status:"feedcategory.show_OK", time:new Date()});
}

exports.create = function(req, res) {
  console.info('/feed/category');
  var loc = req.body.loc;
  var mType = 1;
  var displayValue = req.body.displayValue;
  var editor = req.decoded.name;

  var newFeedCategory = [];

  var _new_feed_category = {
    'MType': mType,
    'Country': loc,
    'Sort': 99,
    'Status_ID': 0,
    'Last_Update_Time': new Date(),
    'Editor': editor
  };
  newFeedCategory.push(_new_feed_category);

  knexData.batchInsert('FEED_CATEGORY', newFeedCategory)
  .returning('id')
  .then(function(ids){
    var newFeedCategoryExpressionDisplay = [];

    newFeedCategoryExpressionDisplay = Object.keys(displayValue).map(function(key){
      var _new_feed_category_expression = {
        ID:ids,
        Type: 1,
        Lang: key,
        Value:displayValue[key],
        TagValue:ids
      };
      return _new_feed_category_expression;
    });

    var newFeedCategoryExpression = newFeedCategoryExpressionDisplay;

    knexData.batchInsert('FEED_CATEGORY_EXPRESSION', newFeedCategoryExpression)
    .then(function(result){
      client.expire('/feed/category', 1);
      res.send({
        status: '_OK',
        time:new Date().getTime()
      });
    })
    .catch(function(err){
      res.send({
        status: '_Failure',
        time:new Date().getTime()
      });
    });
  }).catch(function(err){
    res.send({
      status: '_Failure',
      time:new Date().getTime()
    });
  });
  // res.send({status:"feedcategory.create_OK", time:new Date()});
}

exports.update = function(req, res) {
  res.send({status:"feedcategory.update_OK", time:new Date()});
}

exports.patch = function(req, res) {
  console.info('/feed/category');
  var id = req.body.id;
  var status = req.body.status;
  var token = req.body.token;
  var username = req.decoded.name;

  knexData('FEED_CATEGORY')
  .where('ID', id)
  .update({
    Status_ID: status,
    Last_Update_Time: new Date(),
    Editor: username
  }).then(function(result){
    if (result) {
      client.expire('/feed/category', 1);
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
    // return true;
  }).catch(function(err){
    console.error(err);
    res.send({
      status: '_Failure',
      time:new Date().getTime()
    });
  });
  // res.send({status:"feedcategory.patch_OK", time:new Date()});
}
