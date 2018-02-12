# newrelic-k8s-guestbook
### simple kubernetes app instrumented using New Relic APM

## Requirements

* New Relic License Key
* AWS or Google Cloud Account
* kubectl

You'll want to fork this repository and adjust the `NEWRELIC_LICENSE_KEY` environment variable to point to your account.

## APM instrumentation background

This example uses the [Kubernetes Downward API to expose Pod metadata to the running container as environment variables](https://kubernetes.io/docs/tasks/inject-data-application/environment-variable-expose-pod-information/).

Inside the node.js application, `newrelic.addCustomParameters()` is used to annoate every express.js web transcation (and an error) with Kuberenetes metadata. 

```
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
```

This makes it easier to debug and troubleshoot cluster-specific issues using application transaction traces and is surfaced in the UI (and Insights):

![traced_error_for_error_-_newrelic-k8s-node-redis_-_new_relic](https://user-images.githubusercontent.com/27153/31741413-ffda451c-b408-11e7-837f-0613e25898d9.png)

Instructions are also below on how to install New Relic Infrastucture on the cluster as well.

## Creating the cluster

A Kubernetes cluster is required. This has been tested using Google Container Engine (i.e. Google-flavored managed Kubernetes) and AWS using the [`kops`](https://github.com/kubernetes/kops/blob/master/docs/aws.md) tool but should work on any *Kubernetes 1.8* cluster.

### AWS

The latest version of [`kops`](https://github.com/kubernetes/kops/blob/master/docs/aws.md) makes setting up a kubernetes cluster on AWS significantly easier. Follow the [kops installation instructions](https://github.com/kubernetes/kops/blob/master/docs/aws.md) for your AWS account.

### Google Cloud

If using Google Cloud make sure you've imported your cluster credentials so `kubectl` will work correctly.

```
gcloud container clusters get-credentials [gke-cluster-name] --zone [gke-zone]
```

Run the following commands using `kubectl` on the cluster.
 It will create the nessecary services and deployments.

### Running the New Relic-instrumented guestbook app on the cluster

With kubectl connected to the cluster, run:

```
$ kubectl create -f k8s/guestbook-all-in-one.yaml
service "redis-master" created
deployment "redis-master" created
service "redis-slave" created
deployment "redis-slave" created
service "frontend" created
deployment "frontend" created
```

### Installing New Relic Infrastructure integrations

Based on the instructions on the [New Relic documentation website](https://docs.newrelic.com/docs/kubernetes-monitoring-integration).

Install [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics). This repository has bundled v1.2.0 for easy deployment.

```
$ kubectl apply -f k8s/kube-state-metrics-1.2.0
```

Next, install the New Relic Infrastructure daemonset. Modify the file to point to your cluster and license key:

```
$ kubectl apply -f k8s/newrelic/newrelic-infra-beta2.yml
```

### Deleting the deployment

```
$ kubectl delete -f k8s/guestbook-all-in-one.yaml
```
### Deleting the cluster

```
$ kops delete cluster <<cluster-name>>
```
