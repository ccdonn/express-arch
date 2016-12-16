
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
  res.send({status:"spot.index_OK", time:new Date()});
}

exports.show = function(req, res) {
  res.send({status:"spot.show_OK", time:new Date()});
}

exports.create = function(req, res) {
  res.send({status:"spot.create_OK", time:new Date()});
}

exports.update = function(req, res) {
  res.send({status:"spot.update_OK", time:new Date()});
}

exports.patch = function(req, res) {
  res.send({status:"spot.patch_OK", time:new Date()});
}

exports.delete = function(req, res) {
  res.send({status:"spot.delete_OK", time:new Date()});
}

exports.patchphoto = function(req, res) {
  console.log('PATCH /spot/:spotid/majorphoto/:photoid');
  var photoid = req.params.photoid;
  var spotid = req.params.spotid;

  knexData('SPOT_PHOTO')
  .where('Spot_ID', spotid)
  .andWhere('Major', 1)
  .update({
    Major: 0,
    Last_Update_User: req.decoded.name,
    Last_Update_Time: new Date()
  }).then(function(result){
    knexData('SPOT_PHOTO')
    .where('ID', photoid)
    .andWhere('Spot_ID', spotid)
    .update({
      Major: 1,
      Last_Update_User: req.decoded.name,
      Last_Update_Time: new Date()
    })
    .then(function(result){
      knexData.select()
      .from('SPOT_PHOTO')
      .where('ID', photoid)
      .then(function(result){
        var imgurl;
        if (result[0].Extend==1) {
          if (env=='prod') {
            console.info('img='+'prod-host/simg/'+spotid+'.'+photoid+'.jpg');
          } else if (env=='stg') {
            imgurl = 'https://stg-api-rmsg.rdcnw.net/zipangu/master/sptImg/'+spotid+'.'+photoid+'.jpg';
            console.info('img='+imgurl);
            client.lpush('spot-index', JSON.stringify({
              id: spotid,
              op: 'update',
              photo: {
                imageUrl:imgurl,
                imageUrlPrefix: null,
                imageUrlSuffix: null,
                width: 0,
                height: 0
              }
            }));
            client.hdel('SpotMapping', spotid);

            res.send({
              status:'_OK',
              time:new Date()
            });

          } else {
            imgurl = 'localhost/simg/'+spotid+'.'+photoid+'.jpg';
            client.lpush('spot-index', JSON.stringify({
              id:spotid, op:'update',
              photo:{
                imageUrl:imgurl,
                imageUrlPrefix: null,
                imageUrlSuffix: null,
                width: null,
                height: null
              }
            }));
            res.send({
              status:'_OK',
              time:new Date()
            });

          }
        } else {
          imgurl = result[0].Prefix+'500x340'+result[0].Suffix;
          client.lpush('spot-index', JSON.stringify({
            id:spotid, op:'update',
            photo:{
              imageUrl:imgurl,
              imageUrlPrefix: null,
              imageUrlSuffix: null,
              width: null,
              height: null
            }
          }));
          res.send({
            status: '_OK',
            time: new Date()
          });

        }
      }).catch(function(err){
        res.send({
          status: '_Failure',
          time: new Date()
        });
      });
    }).catch(function(err){
      console.error(err);
      res.send({
        status: '_Failure',
        time: new Date()
      });
    });
  }).catch(function(err){
    console.error(err);
    res.send({
      status:'_Failure',
      time: new Date()
    });
  });
  // res.send({status:"spot.delete_OK", time:new Date()});
}

exports.removephoto = function(req, res) {
  console.log('DELETE /spot/:spotid/removephoto/:photoid');
  var photoid = req.params.photoid;
  var spotid = req.params.spotid;

  knexData('SPOT_PHOTO')
  .where('ID', photoid)
  .andWhere('Spot_ID', spotid)
  .update({
    Status_ID: -1,
    Last_Update_User: req.decoded.name,
    Last_Update_Time: new Date()
  })
  .then(function(result){
    res.send({
      status: '_OK',
      time: new Date()
    });
  }).catch(function(err){
    console.error(err);
    res.send({
      status:'_Failure',
      time: new Date()
    });
  });

  // res.send({status:"spot.delete_OK", time:new Date()});
}
