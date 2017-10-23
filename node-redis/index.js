const newrelic = require('newrelic');
const redis = require('redis');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const redisHost = process.env.GET_HOSTS_ENV !== 'env' ? 'redis-master' : process.env.REDIS_MASTER_SERVICE_HOST;

const client = redis.createClient({ host: redisHost, port: 6379 });
app.set('view engine', 'pug');
app.locals.newrelic = newrelic;

// Pauses for about 1 second
var lookBusy = function() {
  const end = Date.now() + 100;
  while (Date.now() < end) {
    const doSomethingHeavyInJavaScript = 1 + 2 + 3;
  }
};

// Throws an error 10% of the time
var maybeError = function() {
  var throwError = Math.floor(Math.random() * 10) === 1;
  if (throwError) {
    throw new Error('This is a synthetic error.');
  }
}

// Middleware for adding custom attributes
// These map to environment variables exposed in the pod spec
var CUSTOM_PARAMETERS = {
    'K8S_NODE_NAME': process.env.K8S_NODE_NAME,
    'K8S_HOST_IP': process.env.K8S_HOST_IP,
    'K8S_POD_NAME': process.env.K8S_POD_NAME,
    'K8S_POD_NAMESPACE': process.env.K8S_POD_NAMESPACE,
    'K8S_POD_IP': process.env.K8S_POD_IP,
    'K8S_POD_SERVICE_ACCOUNT': process.env.K8S_POD_SERVICE_ACCOUNT,
    'K8S_POD_TIER': process.env.K8S_POD_TIER
};

app.use(function(req, res, next) {
  newrelic.addCustomParameters(CUSTOM_PARAMETERS);
  next();
});

// Look busy middleware
app.use(function(req, res, next) {
  if (process.env.LOOK_BUSY) {
    console.log('looking busy')
    lookBusy();
  }

  next();
});

app.get('/', function (req, res) {
  if (process.env.THROW_ERROR) {
    try {
      maybeError();
    } catch (e) {
      console.error('error: ', e);
      newrelic.noticeError(e, CUSTOM_PARAMETERS);
      return res.status(500).send(e.toString());
    }
  }

  res.render('index', { title: 'Guestbook', message: 'Send a string to redis.' });
});

app.get('/message', function (req, res) {
  client.get('message', function(err, reply) {
    if (err) {
      console.error('error: ', e);
      return res.status(500).send(e);
    }
    return res.send(reply);
  });
});

app.get('/healthz', function (req, res) {
  res.status(200).send('OK');    
});

app.post('/', function(req, res) {
    var message = req.body.message;
    client.set('message', message, function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        res.redirect('/');        
    });
});

client.on('error', function(err) {
  console.error('Could not connect to redis host:', err);
  newrelic.noticeError(err, CUSTOM_PARAMETERS);
})

app.listen(process.env.PORT || 3000, function () {
  console.error('Example app listening on port 3000!');
});
