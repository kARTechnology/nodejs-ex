module.exports = function(app, db) {
  var uuidv1 = require('uuid/v1');
  var collection = db.collection('users');
  var bcrypt = require('bcryptjs');

  db.createIndex('users', {
    "username": 1
  }, {
    unique: true
  }, function(err, indexName) {});


  app.route('/users/refreshtoken').get(function(req, res) {
    console.log("refreshtoken");
    req.checkQuery('data._id', 'Invalid _id').isMongoId();
    errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
      return console.error(errors);
    }
    req.sanitizeQuery('data._id').toMongoId();
    var newtok = uuidv1();

    collection.updateOne({
      "_id": req.query.data._id
    }, {
      $set: {
        "token": uuidv1()
      }
    }, function(err, docs) {
      if (err) {
        res.status(500).send(err);
        return console.error(err);
      } else {
        res.status(202).send(newtok);

      }
    });

  });
  app.route('/users/updatePassword').get(function(req, res) {
    console.log("updatePassword");
    req.checkQuery('data._id', 'Invalid _id').isMongoId();
    req.checkQuery('oldpass', 'Invalid old password').isLength({
      min: 4
    });
    req.checkQuery('newpass', 'Invalid new password').isLength({
      min: 4
    });
    errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
      return console.error(errors);
    }
    req.sanitizeQuery('data._id').toMongoId();

    db.collection('users').findOne({
        "_id": req.query.data._id
      }, {},
      function(err, docs) {
        if (err) return res.status(500).send(err);
        if (!docs) return res.status(401).send('No User Found');

        bcrypt.compare(req.query.oldpass, docs.password, function(cryptError, verified) {
          if (cryptError || !verified) return res.status(406 ).send(cryptError || 'Incorrect Old Password');

          db.collection('users').updateOne({
            "_id": req.query.data._id
          }, {
            $set: {
              "password": bcrypt.hashSync(req.query.newpass, 8)
            }
          }, function(err, docs) {
            if (err) {
              res.status(500).send(err);
              return console.error(err);
            } else {
              res.status(202).send(docs);
            }
          });


        });
      });
  });





  app.route('/users/getdevices').get(function(req, res) {
    console.log("getdevices");

    db.collection('users').findOne({
        _id: req.query.data._id
      },
      function(err, doc) {
        if (err) {
          return console.error(err);
        }

        db.collection('devicelogs').aggregate(
          [{
              $match: {
                "user": doc.username,
                "id": {
                  $ne: null
                }
              }
            },
            {
              $group: {
                _id: "$user",
                deviceids: {
                  $addToSet: {
                    id: "$id"
                  }
                }
              }
            }
          ]).toArray(function(err, docs) {
          if (err) {
            res.status(500).send(err);
            return console.error(err);
          } else {
            res.status(202).send(docs);

          }
        });

      });

  });


  app.route('/users/getlogs').get(function(req, res) {
    console.log("getlogs");

    req.checkQuery('deviceid', 'Invalid deviceid').isLength({
      min: 4
    });

    if (req.query.variable)
      req.checkQuery('variable', 'Invalid variable array').isArray();

    errors = req.validationErrors();
    if (errors) {
      res.status(400).send(errors);
      return console.error(errors);
    }

    var filter = {};
    if (req.query.variable) {
      req.sanitizeQuery('variable').toArray();
      req.sanitizeQuery('from').toDate();
      req.sanitizeQuery('to').toDate();

      filter = {
        variable: {
          $in: req.query.variable
        },
        timestamp: {$lte : req.query.to, $gte:req.query.from }

      };
    }
    filter.id = req.query.deviceid;

    db.collection('users').findOne({
        _id: req.query.data._id,
      },
      function(err, userdata) {
        if (err) {
          return console.error(err);
        }
        filter.user = userdata.username;
        console.log(filter);
        db.collection('devicelogs').find(filter).toArray(function(err, docs) {
          if (err) {
            res.status(500).send(err);
            return console.error(err);
          } else {
            res.status(200).send(docs);
          }
        });
      });

  });

  app.route('/users')
    .get(function(req, res) {
      collection.findOne({
        _id: req.query.data._id,
      }, {}, function(err, userdata) {
        if (err) {
          res.status(500).send(err);
          return console.error(err);
        } else {
          userdata.password = null;
          res.send(userdata);
        }
      });
    })
    .post(function(req, res) {
      req.sanitize('username').trim();
      req.checkBody('email', 'Invalid email').isEmail();
      req.checkBody('password', 'Invalid password').isLength({
        min: 4
      });
      //  req.checkQuery('password', 'Invalid password').isMobilePhone("en-IN");
      //  req.checkQuery('VehicleNumber', 'Invalid VehicleNumber').isAlphanumeric();

      errors = req.validationErrors();
      if (errors) {
        res.status(400).send(errors);
        return console.error(errors);
      }

      req.body.password = bcrypt.hashSync(req.body.password, 8);


      collection.insertOne({
        "username": req.body.username,
        "password": req.body.password,
        "email": req.body.email,
        "token": uuidv1(),
        "active": false

      }, function(err, docs) {
        if (err) {
          res.status(500).send(err);
          return console.error(err);
        } else {
          res.status(200).send(docs);
        }
      });
    })
    .put(function(req, res) {
      req.checkQuery('_id', 'Invalid _id').isMongoId();

      errors = req.validationErrors();
      if (errors) {
        res.status(400).send(errors);
        return console.error(errors);
      }
      req.sanitizeQuery('_id').toMongoId();

      collection.updateOne({
        "_id": req.query._id
      }, {
        $set: {
          "username": req.query.username,
          "password": req.query.password,
          "email": req.query.email,
          "role": req.query.role
        }
      }, function(err, docs) {
        if (err) {
          res.status(500).send(err);
          return console.error(err);
        } else {
          res.status(202).send(docs);

        }
      });
    })
    .delete(function(req, res) {
      req.checkQuery('_id', 'Invalid _id').isMongoId();

      errors = req.validationErrors();
      if (errors) {
        res.status(400).send(errors);
        return console.error(errors);
      }
      req.sanitizeQuery('_id').toMongoId();

      collection.deleteOne({
        "_id": req.query._id
      }, function(err, docs) {
        if (err) {
          res.status(500).send(err);
          return console.error(err);
        } else {
          res.send(docs);
        }
      });
    });
};
