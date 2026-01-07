### Stats e metricas dos servicos  
  "telemetry/logging": {
      "level": "DEBUG",
      "prefix": "[KRAKEND]",
      "syslog": false,
      "stdout": true
    },
  "telemetry/metrics": {
    "collection_time": "60s",
    "proxy_disabled": false,
    "router_disabled": false,
    "backend_disabled": false,
    "endpoint_disabled": false,
    "listen_address": ":8090"
  },
  "telemetry/opencensus": {
    "exporters": {
      "prometheus": {
        "port": 9090,
        "namespace": "krakend"
      }
    },
    "sample_rate": 1.0,
    "reporting_period": 10,
    "enabled_layers": {
      "backend": true,
      "router": true,
      "http": true
    }
  },
    