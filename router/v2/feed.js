
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
  res.send({status:"feed.index_OK", time:new Date()});
}

exports.show = function(req, res) {
  console.info('GET /feed/:id');

  var id = req.params.id;
  knexData.raw('select f.ID as id, Title, Link, Image_Link, Description, '
    + ' date_format(Published_Date,"%Y-%m-%d %T") as publishedDate, f.Status_ID status, '
    + ' fs.Lang as lang, fs.Loc as loc, fs.Name as name, f.Tags as tags '
    + ' from FEED as f join FEED_SEED as fs on fs.ID=f.Seed_ID '
    + ' where f.ID=\''+id+'\'')
    .then(function(result){
      // console.info('res='+result[0][0]);
      res.send({
        status: '_OK',
        time: new Date().getTime(),
        data: {
          id: result[0][0].id,
          title: result[0][0].Title,
          link: result[0][0].Link,
          imageLink: result[0][0].Image_Link,
          desc: result[0][0].Description,
          publishedDate: result[0][0].publishedDate,
          status: result[0][0].status,
          lang: result[0][0].lang,
          loc: result[0][0].loc,
          tags: JSON.parse(result[0][0].tags),
          name: result[0][0].name
        }
      });
    }).catch(function(err){
      console.error(err.code);
      res.send({
        status: "_Failure",
        time: new Date().getTime()
      });
    });
  // res.send({status:"feed.show_OK", time:new Date()});
}

exports.create = function(req, res) {
  console.info('/feed');

  var seedid = req.body.seedid;
  var tags = req.body.tags;
  var title = req.body.title;
  var url = req.body.url;
  var imageurl = req.body.imageurl;
  var pdate = req.body.pdate;
  var username = req.decoded.name;
  var status = (req.body.status==1)?1:0;

  tags = JSON.parse(JSON.parse(tags));
  // console.info('statsu='+status);

  var db_var_tags = '';
  tags.forEach(function(item){
    db_var_tags += '"'+item+'",';
  });
  db_var_tags = '['+db_var_tags.substr(0,db_var_tags.length-1)+']';

  knexData.count('f.ID as hit').from('FEED as f')
  .where('Link', url)
  .then(function(result){
    // judge by result

    if (result[0].hit>0) {
      res.send('Fail, Duplicate');
      return ;
    } else {
      var id = uuid.v4();

      knexData('FEED')
      .insert({
        ID: id,
        Seed_ID: seedid,
        Title: title,
        Link: url,
        Image_Link: imageurl,
        Description: '',
        Content: null,
        Published_Date: pdate,
        Last_Update_Time: new Date(),
        Status_ID: status,
        Last_Update_User: username,
        Create_User: username,
        Create_Time: new Date(),
        Tags: db_var_tags
      }).then(function(result){
        queryString = 'Select f.ID id,f.Title title,f.Link link,f.Image_Link imageLink,f.Description description,UNIX_TIMESTAMP(Published_Date)*1000 as publishedDate, f.Tags tags, f.Status_ID statusId,fs.Name mediaName, fs.Lang lang, fs.Loc loc, fs.Duration duration from FEED f join FEED_SEED fs on f.Seed_ID=fs.ID where fs.Status_ID>=0 and f.ID="'+id+'"';
        knexData.raw(queryString)
          .then(function(data){
            // console.info(JSON.stringify(data[0][0]));
            if (data && data[0] && data[0][0]) {
              client.lpush('fed-index', JSON.stringify(data[0][0]));
            }
          }).catch(function(err){
            // ?
            throw err;
          });
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
    }
  }).catch(function(err){
    console.error(err);
    res.send({
      status: '_Failure',
      time: new Date().getTime()
    })
  });

  // res.send({status:"feed.create_OK", time:new Date()});
}

exports.update = function(req, res) {
  console.info('PUT /feed/:id');

  var username = req.decoded.name;
  var id = req.params.id;
  var link = req.body.link;
  var imagelink = req.body.imagelink;
  var title = req.body.title;
  var pdate = req.body.pdate;
  var tags = req.body.tags;
  var s_tags = '';
  tags.forEach(function(value){
    s_tags += '"'+value+'",';
  });
  s_tags = '[' + s_tags.substr(0, s_tags.length-1) + ']';

  knexData('FEED')
  .where('ID', id)
  .update({
    Title: title,
    Link: link,
    Image_Link: imagelink,
    Published_Date: pdate,
    Tags: s_tags,
    Last_Update_User: username,
    Last_Update_Time: new Date()
  })
  .then(function(result){
    var queryString = 'Select f.ID id,f.Title title,f.Link link,f.Image_Link imageLink,f.Description description,UNIX_TIMESTAMP(Published_Date)*1000 as publishedDate,'
      +' f.Tags tags,f.Status_ID statusId,\'update\' as op,fs.Name mediaName, fs.Lang lang, fs.Loc loc, fs.Duration duration from FEED f join FEED_SEED fs on f.Seed_ID=fs.ID '
      +' where fs.Status_ID>=0 and f.ID=\''+id+'\'';
    knexData.raw(queryString)
      .then(function(data){
        // console.info(JSON.stringify(data[0][0]));
        if (data && data[0] && data[0][0]) {
          client.lpush('fed-index', JSON.stringify(data[0][0]));
        }
      }).catch(function(err){
        console.error(err);
        res.send({
          status:"_Failure",
          time: new Date()
        });
      });
    res.send({
      status:"_OK",
      time: new Date()
    });
  }).catch(function(err){
    console.error(err);
    res.send({
      status:"_Failure",
      time: new Date()
    });
  });

  // res.send({status:"feed.update_OK", time:new Date()});
}

exports.patch = function(req, res) {
  res.send({status:"feed.patch_OK", time:new Date()});
}

exports.delete = function(req, res) {
  res.send({status:"feed.patch_OK", time:new Date()});
}
