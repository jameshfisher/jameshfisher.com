---
title: "Summarize metrics with random deletion"
draft: true
---

You have a metric for which you have a result every second
You can't keep this granularity forever; it would be too big
Standard solution: produce e.g. hourly logs with summaries e.g. min max mean p50 p99
My suggested alternative: just keep the original data points, but randomly delete some
You can then run any aggregations over them when required

How does random deletion affect expected percentiles?