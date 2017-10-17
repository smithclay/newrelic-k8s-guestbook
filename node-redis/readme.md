## newrelic-k8s-guestbook-node-redis
### simple dockerized node.js express application

This is an intentially simple express-based node.js web app that talks to a redis database. It's designed to run on a Kubernetes cluster, including managed clusters like Google Container Enginer (GKE) but can also run standalone.

### dev requirements

* `node` > 6
* `express` (4.16) and the `newrelic` agent (2.3.0)

### running locally

```
    node index.js
```

### building the image

```
    docker build . -t smithclay/newrelic-k8s-node-redis
```

### running the image locally

```
    docker run -d -p 3000:3000 smithclay/newrelic-k8s-node-redis
```
