variable "newrelic_api_key" {
  type = "string"
  description = "New Relic Admin User API key"
}

variable "newrelic_app_name" {
  type = "string"
  description = "New Relic Application Name in APM"
  default = "newrelic-k8s-node-redis"
}

provider "newrelic" {
  api_key = "${var.newrelic_api_key}"
}

data "newrelic_application" "app" {
  name = "${var.newrelic_app_name}"
}

#
# Dashboards
#

resource "newrelic_dashboard" "exampledash" {
  title = "New Relic Kubernetes Demo"

  widget {
    title         = "Average Transaction Duration for ${var.newrelic_app_name}"
    row           = 1
    column        = 1
    width         = 2
    visualization = "line_chart"
    nrql          = "SELECT AVERAGE(duration) from Transaction WHERE appName='${var.newrelic_app_name}' TIMESERIES auto"
  }

  widget {
    title         = "Page Views for ${var.newrelic_app_name}"
    row           = 1
    column        = 3
    width         = 1
    visualization = "billboard"
    nrql          = "SELECT count(*) FROM PageView SINCE 1 week ago WHERE appName='${var.newrelic_app_name}'"
  }

  widget {
    title         = "Average Transaction Duration for ${var.newrelic_app_name} by Pod"
    row           = 2
    column        = 1
    width         = 2
    visualization = "faceted_line_chart"
    nrql          = "SELECT average(duration) from Transaction FACET K8S_POD_NAME where appName='${var.newrelic_app_name}' TIMESERIES auto"
  }

  widget {
    title         = "Pod Count by Node"
    row           = 2
    column        = 3
    width         = 1
    visualization = "facet_bar_chart"
    nrql          = "SELECT uniquecount(podName) from K8sPodSample where status='Running' FACET nodeName since 10 minutes ago UNTIL 1 minute AGO"
  }

  widget {
    title         = "Desired vs Available Pods"
    row           = 3
    column        = 1
    width         = 2
    visualization = "line_chart"
    nrql          = "SELECT latest(podsDesired) as 'Desired Pods', latest(podsReady) as 'Available Pods' FROM K8sReplicasetSample TIMESERIES SINCE 30 MINUTES AGO UNTIL 1 minute AGO"
  }

  widget {
    title         = "Nodes in ASGs"
    row           = 3
    column        = 3
    width         = 1
    visualization = "facet_bar_chart"
    nrql          = "SELECT uniqueCount(ec2InstanceId) from ComputeSample FACET `ec2Tag_aws:autoscaling:groupName`"
  }
}

#
# Alert Policy and Condition
#

resource "newrelic_alert_policy" "default_alert_policy" {
  name = "Default Alert Policy"
}

resource "newrelic_alert_condition" "bad_apdex" {
  policy_id = "${newrelic_alert_policy.default_alert_policy.id}"

  name        = "bad_apdex"
  type        = "apm_app_metric"
  entities    = ["${data.newrelic_application.app.id}"]
  metric      = "apdex"
  condition_scope = "application"

  term {
    duration      = 5
    operator      = "below"
    priority      = "critical"
    threshold     = "0.45"
    time_function = "all"
  }
}

#
# Alert Policy Notifications
#

resource "newrelic_alert_channel" "email_channel" {
  name = "Email Admin"
  type = "email"

  configuration = {
    recipients              = "noreply@newrelic.com"
    include_json_attachment = "1"
  }
}

resource "newrelic_alert_policy_channel" "default_email_channel" {
  policy_id  = "${newrelic_alert_policy.default_alert_policy.id}"
  channel_id = "${newrelic_alert_channel.email_channel.id}"
}