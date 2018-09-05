var util = require('util'),
  bodyParser = require('body-parser'),
  express = require('express'),
  expressValidator = require('express-validator'),
  app = express();
app.use(bodyParser.json());
app.all('/*', function(req, res, next) {
  console.log(req.headers);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});
var ValidatorConfig = require('./ValidatorConfig.js')(app);
app.use('/', express.static('www'));

mongourl="mongodb://karthikx10:karthikx10@ds237192.mlab.com:37192/devicelogs";
console.log('hi:');

//-------------------------------------------------
var mosca = require('mosca');
var moscaSettings = {
  port: 1883,
  host: process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
  backend: {
    //using ascoltatore
    type: 'mongo',
    url: mongourl,
    pubsubCollection: 'ascoltatori',
    mongo: {}
  },
  persistence: {
    factory: mosca.persistence.Mongo,
    url: mongourl
  }
};
//-------------------------------------------------
var MongoClient = require('mongodb').MongoClient;
var db;
MongoClient.connect(mongourl, {
  useNewUrlParser: true
}, function(err, database) {
  if (err) {
     console.log('Unable to connect to the mongoDB server. Error:', err); return
  }
  console.log('connected');
  var server = new mosca.Server(moscaSettings);
  server.on('ready', function() {
    server.authenticate = authenticate;
    server.authorizePublish = authorizePublish;
    server.authorizeSubscribe = authorizeSubscribe;
    console.log('Mosca server is up and running');
  });
  server.on('clientConnected', clientConnected);
  server.on('clientDisconnected', clientDisconnected);
  server.on('published', published);

  db = database.db('devicelogs');
  var Authenticate = require('./Authenticate.js')(app, db);
  var UserOperations = require('./UserOperations.js')(app, db);

  app.listen(process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
  console.log("Listening on port 3000");
});
//-------------------------------------------------



function clientConnected(client) {
  console.log('Client Connected:', client.user);
}

function clientDisconnected(client) {
  console.log('Client Disconnected:', client.user);
}

function authenticate(client, username, password, callback) {
  console.log('device', username, password.toString());
  db.collection("users").findOne({
    username: username,
    token: password.toString()
  }, function(err, docs) {
    if (docs) {
      client.user = username;
      console.log('authenticated');
      callback(null, true);
    } else {
      console.log('---not found---');
    }
  });
}




authorizePublish = function(client, topic, payload, callback) {
  var auth = client.user == topic.split('/')[1];
  if (!auth) console.log('---UNauthorised---', topic);
  else {
    console.log('---authorised---', topic);
  }
  callback(null, auth);
};

authorizeSubscribe = function(client, topic, callback) {
  var auth = client.user == topic.split('/')[1];
  if (!auth) console.log('---UNauthorised---', topic);
  else {
    console.log('---authorised---', topic);
  }
  callback(null, auth);
};

function published(packet, client) {
  if (typeof packet.payload != "object") return;
  if (!client) return;
  packet.payload = packet.payload.toString();
  if (packet.payload == '') return;
  console.log('Published by user:-', client.user, 'clientid:-', client.id, 'packet:-', packet);

  var record = {};

  if (packet.topic.split('/')[4] != null) { //single value without ts  /user/devices/type/varname   value
    if (!isNaN(packet.payload)) {
      record.variable = packet.topic.split('/')[4].toLowerCase();
      record.val = parseFloat(packet.payload);
      record.timestamp = new Date();
      record.topic = packet.topic;
      record.user = client.user;
      record.id = client.id;



      console.log(record);
      db.collection("devicelogs").insertOne(record, function(err, records) {
        console.log("Record added");
      });
    }

    return;
  }
  if (packet.topic.split('/')[3] != null) { //json value   /user/devices/type   JSON
    var data = toJSON(packet.payload);
    if (data == undefined) {
      console.log('error parsing json');
      return;
    }

    record = {};
    var date;
    if (!data.timestamp)
      date = new Date();
    else
      date = new Date(data.timestamp * 1000);

    delete data.timestamp;
    record.timestamp = date;
    record.topic = packet.topic;
    record.user = client.user;
    record.id = client.id;
    for (var key in data)
      db.collection("devicelogs").insertOne({
        timestamp: date,
        topic: packet.topic,
        user: client.user,
        id: client.id,
        variable: key.toLowerCase(),
        val: parseFloat(data[key])
      }, function(err, records) {
        console.log("Record added");
      });

    return;
  }
  console.log('unable to parse data');

}




//-------------------------------------------------
function toJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}
//-------------------------------------------------
return;
var mqtt = require('mqtt');
var mqtt2 = require('mqtt');
var mqttclient2 = mqtt.connect('mqtt://localhost', {
  host: 'mqtt://localhost',
  username: 'kk',
  password: '0c3c3e80-a6e0-11e8-a7ac-3bfa6fe9f3d7',
  clientId: 'inverter-esp56456'
});
var mqttclient = mqtt.connect('mqtt://things.ubidots.com', {
  host: 'mqtts://things.ubidots.com',
  username: 'A1E-MyWWuBahkEjgJ7cqo5xJxPBCW0kxHo',
  password: '',  clientId: 'inverter-esp56456'

});

mqttclient2.on('connect', function() {
  console.log("lcalconn");
});

mqttclient.on('connect', function() {
  mqttclient.subscribe('/v1.6/devices/inverter/#', function(err) {
    if (err) {
      console.log("err");
    }
  });
});


mqttclient.on('message', function(topic, message) {
  console.log(message.toString());
  mqttclient2.publish('/kk' + topic.substring(topic.indexOf('6/') + 1), message);
});
