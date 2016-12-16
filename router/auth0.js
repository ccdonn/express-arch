var jwt = require('jsonwebtoken');

exports.get = function(req, res) {
  var token = jwt.sign({id: '00000153', name: 'donn'}, 'secret', {
    expiresIn: '1m'
  });
  res.send({token: token});
}
