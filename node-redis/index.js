const newrelic = require('newrelic');
const redis = require('redis');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const redisHost = process.env.GET_HOSTS_ENV !== 'env' ? 'redis-master' : process.env.REDIS_MASTER_SERVICE_HOST;

const client = redis.createClient({ host: redisHost, port: 6379 });
app.set('view engine', 'pug');

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

app.get('/', function (req, res) {
  res.render('index', { title: 'Guestbook', message: 'Hello there!' })    
});

app.post('/', function(req, res) {
    var message = req.body.message;
    client.set('message', value, function(err) {
        if (err) {
            return res.stats(500).send(err);
        }
        res.redirect('/');        
    });
});

client.on('error', function(err) {
  console.log('Could not connect to redis host:', err);
  newrelic.noticeError(err, CUSTOM_PARAMETERS);
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});
