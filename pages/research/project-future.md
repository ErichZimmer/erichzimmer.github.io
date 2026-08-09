---
title: "Future Projects"
date: "2026-06-24"
tags:
  - PIV
  - Hardware
  - Software
summary: "Future projects for PIV hardware and software."
---

# Introduction
Throughout the years, there has been many attempts to make a low cost PIV system. These usually result in low cost systems revolving around CW lasers. Additionally, some commercial providers have also pushed to lower the costs of PIV systems such as Optolution (laser diode based technology) and Microvec (Nd:YAGb based technology). However, there has yet to be a turing complete open source and open hardware pulsed PIV system for water and air flow measurements. As such, I have been designing a PIV system over the years that can both perform low to medium speed measurements (e.g., <30 m/s) in air or water.

## Projects

### OpenSync
OpenSync is the first hardware project in this line of work which targets the timing requirements for a PIV system. It employs a microcontroller and custom PCB to create an 8 channel (possible 16 channel in the distant future) digital pulse generator with nanosecond resolution and sub-nanosecond jitter. It can effectively controll a flashlamp/diode pumped Nd:YAG laser and up to four cameras with individualized timing or a pulse diode-based illumination source and up to seven cameras with individualized timing. It supports several features seen in commercial counterparts at a low cost of around $200 USD plus or minus some.

### OpenLDS
OpenLDS is a pulsed laser diode system (LDS) aimed towards providing a relatively high energy light sheet for flow measurement applications. With a peak power of around 1,200 Watts with >1,000 Watts usable energy, it can produce pulse energies of 1 mJ at 1 microsecond pulses to 75 mJ at 75 microsecond pulses with up to a 15% duty cycle. Light sheet thickness is excpected to be around 2-3 mm at 1 m focus distance due to individual laser diode alignment unless a spatial slit filter is used to block unwanted light.

### OpenLPS
OpenLPS is a pulsed light emitting diode (LED) system aimed towards providing a high intensity, non-coherent light for fluid measurement applications. Since LEDs are lambertian (basically a point source with high divergence), significant eye hazards that are present with lasers are effectively minimized. OpenLPS would have the ability to change LED bulbs with support for UV, deep blue, blue, green, converted green (CG), red, and white wavelengths. Fiber coupling would also be supported to bundle the LED light into a relatively thin and safe light sheet. Peak LED power for blue wavelengths would be around 40 W CW and 50 to 60 W pulsed. Pulse lengths may range from 250 ns to CW with duty cycles of less than 25% for pulsed modes.

### OpenVLS
OpenVLS is a pulsed 5x15 LED array made for the illumination of volumes. Similar to OpenLPS, it would support UV, deep blue, blue, green, converted green (CG), red, and white wavelengths. Due to the dense packing of the LEDs, 450 W CW or 750 W pulsed radiant energy for blue wavelengths illuminate a 100 mm x 300 mm area. Multiple OpenVLS units can be seemlessly stacked to produce a large, uniform, and high energy volume illumination source. Pulse lengths can range from 250 ns to CW with up to 25% duty cycles, similar to OpenLPS.

### OpenCIT
OpenCIT, or open hardware camera interframe tester, is a super simple camera interframe and exposure delay tester based on the OpenSync synchronizer. Using a 3D printed testing rig, a camera w/ lens can be attached to the rig via a tripod mound and the delay to first exposure and blind time between two images can be empiracally found. This allows for the suitability of different cameras to be tested and the most appropriate camera utilized for an experiment

### OpenPTR
OpenPTR, or open hardware particle time respose tester, is a small desktop wind tunnel with a slit in the testing area specalized in testing the particle time response of different seed particles against a reference velocity field. This reference velocity field is usally 1-3 micron DEHS or similarly sized fog particles.

### OpenCapture
OpenCapture is an open source PIV image aquisition software that uses camera and synchronzier configs to simplify a PIV experiment. Camera profiles can be extracted from the information obtained from OpenCIT in addition to user-set exposure times. OpenSync profiles can be user generated and is loaded into an OpenSync device before an experiment is started. A CLI and GUI will be supplied for user convienence once the software design has been finished.

### OpenSeeder
OpenSeeder is a low cost air/helium filled soap bubble generator that targets small seed particle ranging from 120 microns to 1 mm. Using air instead of helium, the cost to operate this seed generator can be reduced at the expense of higher particle time responses (and hence, a focus placed on smaller soap bubbles). A microcontroller simplifies bubble generation based on presets and user configurations.