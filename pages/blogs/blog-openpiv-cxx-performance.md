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

## Implentations
As an initial push towards fast and efficient PIV software, the core algorithms of OpenPIV-Python has been ported into c++ and wrapped with pybind11 to provide native Python behaviors. This includes:

Interpolation:
 - lagrange interpolation (k=1-5; substitute for spline interpolation)
 - lanczos (k=3,5; currently c++ only)
 - sinc (k=3,5; currently c++ only)
 
Deformation
 - forward
 - symmetric
Cross Correlation
 - circular
 - linear
 - normalized square error (work in progress; currently c++ only)
Peak Search
 - 2 peaks
 - 3 peaks (currently c++ only)
Subpixel Estimation
 - Gausian (3 point)
 - parabolic (3 point)
 - centroid (3 point)
 - Gaussian (3x3; currently c++ only)
Correlation Statistics
 - signal to noise
 - peak to peak
Validation
 - global threshold (u and v)
 - standard deviation theshold (u and v)
 - median theshold (u and v)
 - normalized median theshold (mag)
 - difference threshold (u an v; currently c++ only)

## Optimizations
Implementing PIV algorithms in c++ (and later Numba) provides a slew of techniques that can be used to increase performance. For one, the PIV cross correlation algorithm itself is embarrassingly parallel which means each correlation window is independent of all other windows. A basic optimization technique is to parallelize the cross correlation algorithm by splitting correlation windows into stacks and processing each stack in a thread. For instance, if a computer supports 16 threads through hyperthreading, all correlation windows can be broken down into 16 stacks of windows and processed independently. While this is great for ensemble averaged correlations, multithreading is not that efficient. As such, a better yet parallelization technique is multiprocessing where each PIV image is processed on its own process. For a lack of better words, the same 16 threads can process 16 PIV images in parallel. This presents a very efficient means for performing PIV as long as each PIV image pair is independent (e.g., no temporal or ensemble information).

Another area of optimization are interpolation algorithms. Interpolation kernels, especially those that use trigonometry function such as sin, can be quite slow. A basic way to increase interpolation performance is multithreading since each kernel is independent of all other kernels (yet again, embarrassingly parallel). However, multithreading should not be used in conjunction with multiprocessing, so other optimization techniques can also be deployed. A simple, yet elegant way of significantly increasing the performance of interpolation algorithms is through the use of lookup tables. By descritizing interpolation node offsets and using linear interpolation to reconstruct the weights, the different weights of an interpolation kernel can be precomputed. This offloads the high computational complexity of trigonometry functions or other complex interpolation weighting schemes to lookup tables and reduces the amount of operations performed per pixel or vector. As far as the author's knowledge, this is the first time open source PIV software has employed this optimization technique.

## Benchmarking

### Interpolation
As seen below, the increasing the interpolation order decreases error at the expense of computational complexity. For clarification, all units are in pixels for all images plotting errors.

![lagrange interpolation errors by interp order](/pages/blogs/assets/interp_comparison_symmetric_bias.png)

As a sanity check, the interpolation errors are also checked against SciPy's bspline interpolation algorithm (ndimage.map_coordinates) which was used as a baseline throughout development.

![c++ and scipy bspline interp comaprison](/pages/blogs/assets/interp_comparison_k3.png)

In comparison to OpenPIV-Python, two other interpolation algorithms were implemented: lanczos and sinc. Lanczos is basically a windowed sinc function due to sinc having a near-infinite kernel width due to perpetual oscilations. Both perform better than lagrange or bspline interpolation for particle sizes on the orders of two to four pixels. For a visual representation, the kernel weights are plotted below.

![lanczos and sinc kernel weights for k=3](/pages/blogs/assets/kernel_weights_sinc_k3.png)

The effect on particle diameter on interpolation quality is also visualized below.

![lancos and sinc kernel k=3 size test](/pages/blogs/assets/interp_symnmetric_bias_k3_particle_size.png)

### Cross Correlation
To analyze the performance of the new enhancements to the c++ version of OpenPIV, a basic recreation of the benchmark tests performed by William Thielicke at Optolution had been performed. The results of his benchmark on the performance of PIVlab can be seen [here](https://pivlab.blogspot.com/2019/09/evaluation-of-new-pivlab-v21-settings.html). A series of 8 batches of PIV images, each containing 500 image pairs, were created to test the effects of noise, particle loss, particle size, and displacements on PIV images. Each batch is characterized in the table below. Batches without a specified particle density are assumed to have a particles per pixels (ppp) ratio of 0.05.

| Batch # | Test Type | Conditions |
| --- | --- | --- |
| Batch 1 | Displacement test | 0% particle loss, 0% noise |
| Batch 2 | Displacement test | 5% particle loss, 5% noise |
| Batch 3 | Displacement test | 10% particle loss, 10% noise |
| Batch 4 | Displacement test | 15% particle loss, 15% noise |
| Batch 5 | Displacement test | 20% particle loss, 20% noise |
| Batch 6 | Noise test | 0% noise to 25% noise |
| Batch 7 | Particle size test | 0 pixels to 5 pixels |
| Batch 8 | Particle density test | 0 ppp to 0.2 ppp |

### Note, test is still in progress at the moment and won't be analyzed until July 5th due to time constraints...