module.exports = function(app, db) {

  var jwt = require('jsonwebtoken');
  var bcrypt = require('bcryptjs');


 app.all('/*', checkUser);

  function checkUser(req, res, next) {
    if (req.path == '/users/login') return next();
    if (req.path == '/users' && req.method=='POST') return next();

    console.log('authenticating: ' + req.method + ' ' + req.path);

    var token = null;
    if (req.query && req.query.token)
      token = req.query.token;
    else
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
      token = req.headers.authorization.split(' ')[1];
    else return res.status(401).send('token required');


    jwt.verify(token, 'topsecrets', {
      issuer: 'Karthikeyan'
    }, function(err, decoded) {
      if (err) return res.status(401).send(err);
      console.log('authenticated: ' + req.method + ' ' + req.path);
      req.query.data=decoded.data;
      req.sanitizeQuery('data._id').toMongoId();

      return next();
    });
  }

  app.route('/users/login').get(function(req, res) {
    console.log('login');
    if (!req.query && !req.query.username && !req.query.password)
      return res.status(400).send('Please enter username and password');

    db.collection('users').findOne({
        username: req.query.username
      }, {},
      function(err, docs) {
        if (err) return res.status(500).send(err);
        if (!docs) return res.status(401).send('No User Found');

        bcrypt.compare(req.query.password, docs.password, function(cryptError, verified) {
          if (cryptError || !verified) return res.status(401).send(cryptError || 'Incorrect Password');

          var token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            iss: 'Karthikeyan',
            data: {
              _id: docs._id,
              role: docs.role
            }
          }, 'topsecrets');

          req.query.password = null;
          return res.status(200).send(token);
        });
      });
  });

};
