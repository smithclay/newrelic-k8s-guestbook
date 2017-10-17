# newrelic-k8s-guestbook
### simple kubernetes app instrumented using New Relic APM

## Creating up the cluster

If using Google Cloud make sure you've imported your cluster credentials.

```
gcloud container clusters get-credentials [gke-cluster-name] --zone [gke-zone]
```

On a Kubernetes cluster, run the following commands. It will create the nessecary services and deployments.

```
$ kubectl create -f k8s/guestbook-all-in-one.yaml
service "redis-master" created
deployment "redis-master" created
service "redis-slave" created
deployment "redis-slave" created
service "frontend" created
deployment "frontend" created
```

### Deleting the cluster

```
$ kubectl delete -f k8s/guestbook-all-in-one.yaml
```
