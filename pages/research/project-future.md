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
Throughout the years, there has been many attempts to make a low cost PIV system. These usually result in low cost systems revolving around CW lasers. Additionally, some commercial providers have also pushed to lower the costs of PIV systems such as Optolution (laser diode based technology) and Microvec (Nd:YAG based technology). However, there has yet to be a turing complete open source and open hardware pulsed PIV system for water and air flow measurements. As such, I have been designing a PIV system over the years that can both perform low to medium speed measurements (e.g., <30 m/s) in air or water.

## Projects

### OpenSync (Currently work-in-progress)
OpenSync is the first hardware project in this line of work which targets the timing requirements for a PIV system. It employs a microcontroller and custom PCB to create an 8 channel digital pulse generator with nanosecond resolution and sub-nanosecond jitter. It can effectively controll a flashlamp/diode pumped Nd:YAG laser and up to four cameras with individualized timing or a pulsed diode-based illumination source and up to seven cameras with individualized timing. It supports several features seen in commercial counterparts at a low cost of around $100 USD in parts, plus or minus some.

### OpenLPS (Next project after OpenSync)
OpenLPS is a pulsed light emitting diode (LED) system aimed towards providing a high intensity, non-coherent light for fluid measurement applications. Since LEDs are lambertian (basically a point source with high divergence), significant eye hazards that are present with lasers are effectively minimized. OpenLPS would have the ability to change LED bulbs with support for deep blue (highest power), blue, converted green (CG), and red wavelengths. Fiber coupling would also be supported to bundle the LED light into a relatively thin (0.5 mm to 2 mm thick) and safe light sheet. Peak LED power for blue wavelengths would be around 40-50 W CW and 60 to 80 W pulsed. Pulse lengths may range from 250 ns to CW with duty cycles of 10% or less for overdriven pulsed modes.

### OpenLDS
OpenLDS is a pulsed laser diode system (LDS) aimed towards providing a relatively high energy light sheet for flow measurement applications. Due ot the costs of diode lasers and optics, it comes in three editions: OpenLDS 50 W, OpenLDS 500 W, and OpenLDS 1,000 W. OpenLDS 50 W is the lowest cost to construct and is more than adequate for measurements in water or small areas of interest in air. OpenLDS 500 W and 1,000 W are designed explicitly with air flow measurement in mind and are capable of producing pulse energies of up to 75 mJ with duty cycles up to 15%. Light sheet thickness is excpected to be around 2-3 mm at 1 m focus distance due to individual laser diode alignment on the higher power lasers unless a spatial slit filter is used to block unwanted light. OpenLDS 50 W produces the thinnest light sheet due to having a higher quality beam. The cost of construction ranges from ~$250 for OpenLDS 50 W to ~$4,500 USD for OpenLDS 1,000 W.

### OpenVLS
OpenVLS is a pulsed 5x15 LED array made for the illumination of volumes. Similar to OpenLPS, it would support deep blue (highest power), blue, converted green (CG), and red wavelengths. Due to the dense packing of the LEDs, 450 W CW or 750 W pulsed radiant energy for blue wavelengths illuminate a 100 mm x 300 mm area. Multiple OpenVLS units can be seemlessly stacked to produce a large, uniform, and high energy volume illumination source. Pulse lengths can range from 250 ns to CW with up to 25% duty cycles in pulsed mode, similar to OpenLPS.

### OpenCIT
OpenCIT, or open hardware camera interframe tester, is a super simple camera interframe and exposure delay tester based on the OpenSync synchronizer and the pico 2 logic analyzer. Preliminary measurements can be taken using gpio pins on a camera to measure trigger delay to exposure, exposure to next accepted trigger, trigger jitter, and exposure jitter. Additionally, a camera w/ lens can be attached a  3D printed testing rig via a tripod mount and the delay to first exposure and blind time between two images can be empiracally validated. This allows for the suitability of different cameras to be tested and the most appropriate camera utilized for an experiment.

### OpenPTR
OpenPTR, or open hardware particle time respose tester, is a small desktop wind tunnel with a slit in the testing area specalized in testing the particle time response of different seed particles against a reference velocity field. This reference velocity field is usally 1-3 micron DEHS or similarly sized fog particles. The difference between the acceleration of the reference field and the particles being analyzed allows one to calculate the particle time response using central differences. Statistics typically converge after a few thousand images.

### OpenCapture
OpenCapture is an open source PIV image aquisition software that uses camera and synchronzier configs to simplify a PIV experiment. Camera profiles can be extracted from the information obtained from OpenCIT in addition to user-set exposure times. OpenSync profiles can be user generated and is loaded into an OpenSync device before an experiment is started. A CLI and GUI will be supplied for user convienence once the software design has been finished.

### OpenSeeder
OpenSeeder is a low cost air/helium filled soap bubble generator that targets small seed particle ranging from 120 microns to 1 mm. Using air instead of helium, the cost to operate this seed generator can be reduced at the expense of higher particle time responses (and hence, a focus placed on smaller soap bubbles). A microcontroller simplifies bubble generation based on presets and user configurations. 