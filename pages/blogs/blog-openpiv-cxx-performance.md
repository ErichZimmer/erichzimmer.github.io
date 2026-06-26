---
title: "Upcoming OpenPIV c++ Optimizations"
date: "2026-06-24"
tags:
  - PIV
  - Software
  - Benchmarks
  - Performance
summary: "c++ optimizations to further increase the performance of OpenPIV-Python."
---

# Introduction

When processing large quantities of PIV images on consumer hardware, it may be often advantageous to provide optimized code paths to accelerate processing. For instance, if it takes five seconds to process a 12 MP PIV image pair and there are 10 batches of 100 image pairs, it would take approximately one hour and 23 minutes to process. If an optimized code path reduces that processing time to something along the lines of two seconds, the overall processing time is reduced to around 33 minutes. This is even more important when using parallelism to take advantage of hardware resources. As such, certain functionalities of OpenPIV-Python has been ported to a c++ library and binded using pybind11 to remain easy to use in a Python environment.

## More coming soon