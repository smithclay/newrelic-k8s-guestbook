## New Relic Infrastructure Agent Installation

This installs a containerized version of the New Relic infrastructure agent on every node in a Kubernetes cluster. (thanks to Drew Decker for these instructions)

### Set your license key

In a file in this directory named `nrconfig.env`, set your license key for your New Relic account. To find your license key, instructions are available on the [New Relic documentation site here](https://docs.newrelic.com/docs/accounts-partnerships/accounts/account-setup/license-key).

### Generate the secret config file

Run `./config-to-secret.sh`, which generates the secret configuration file `newrelic-config-secret.yaml`.

### Deploy the secret to the cluster

```
   $ kubectl create -f newrelic-config-secret.yaml
``` 

### Deploy the infrastructure daemonset

```
   $ kubectl create -f newrelic-infra-daemonset.yaml
```

### Verify installation

For the example app in this directory, when you view pods you should see output like this, where there's an infrastructure pod running on each worker node:

```
$  kubectl get pods
NAME                           READY     STATUS    RESTARTS   AGE
frontend-649927817-hkmv8       1/1       Running   0          21m
frontend-649927817-ntb7g       1/1       Running   0          21m
frontend-649927817-x7h1b       1/1       Running   0          21m
newrelic-infra-agent-5wf1n     1/1       Running   0          21s
newrelic-infra-agent-wcxrl     1/1       Running   0          21s
redis-master-106238132-6nbr5   1/1       Running   0          1h
redis-slave-3837281623-rd9xv   1/1       Running   0          1h
redis-slave-3837281623-rq2bc   1/1       Running   0          1h
```

### View in New Relic Infrastructure

After a few minutes, you can group process, network, and compute metrics by tags (like the cluster name):

![infrastructure_by_new_relic](https://user-images.githubusercontent.com/27153/31867057-72190e06-b73d-11e7-93fc-dd70ba4afd70.png)
