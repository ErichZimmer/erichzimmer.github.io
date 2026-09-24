---
title: "OpenSync - World's First Open Source, Open Hardware PIV Synchronizer [WIP]"
date: "2026-06-21"
tags:
  - PIV
  - Hardware
summary: "OpenSync - World's first open source, open hardware PIV synchronizer with great performance at a low cost."
---

# Introduction

The research community is overwhelmingly reliant on commercial and often propietary equipment as a means to further their studies. This equipment often comes at a steep cost of ownership which can limit an institution or organization's ability to perform research in their respective fields. For instance, a commercial synchronizer for particle image velocimetry (PIV) and similar experiments had a cost of ownership of around $9,000 USD (I. Nepomnyi, personal communication, May 18, 2025). Since the timing of laboratory equipment is critical for accurate and precise measurements, this piece of equipment alone could already cause financial strain for those who lack substantial funding.

As an initial push towards making flow measurements more available to researchers, especially those who lack funding, an effort has been made to design and engineer a complete open source, open hardware synchronizer with performance on par with its commercial and propietary counterparts. This has resulted in the creation of OpenSync, an eight (8) channel digital pulse generator. OpenSync is a very low cost synchronizer with a focus placed primarily on providing accurate and precise timing control for detailed flow measurements. This milestone in community-driven PIV hardware development provides a means for more institutions and organizations to enjoy the benefits of PIV and other measurement techniques without having to spend a sizeable portion of grant money on digital pulse generators.

At the core of OpenSync is the RP2350 microcontroller from the Raspberry Pi Foundation. This nifty microcontroller contains many features that make it well suited for pulse generation and timing. For one, it includes independent hardware blocks that can execute simple programs called programmable input output (PIO) blocks. PIO blocks can run several simple programs independently from the main CPU and with cycle-accurate timing. Additionally, the RP2350 microcontroller contains to CPU cores which allows for one to be dedicated to timing oeprations and another for USB communication via a standard commands for programmable instruments (SCPI) interface. The unique hardware of this microcontroller allows for one to avoid having to synthesize and validate designs on field programmable gate arrays (FPGAs) or complex programmable logic devices (CPLDs). This means that the implementation of the synchronizer can be written in the c programming language making it easy to maintain and enhance. To provide a more proffesional user experience, a custom PCB and enclosure is provided such that an OpenSync device mirrors that of its commercial and propietary counterparts.

## Features

OpenSync provides enough features to suite the needs of most users in the research community. For instance, see below.

<table>
  <tr>
    <th colspan="2">Internal Timing Generator</th>
  </tr>
  <tr>
    <td>Period Range</td>
    <td>0.0004 Hz to 5 MHz</td>
  </tr>
  <tr>
    <td>Resolution</td>
    <td>4 ns * Clock Divider</td>
  </tr>
  <tr>
    <td>Accuracy</td>
    <td>4 ns * Clock Divider</td>
  </tr>
  <tr>
    <td>PLL Frequency</td>
    <td>250 MHz</td>
  </tr>
  <tr>
    <td>Crystal Oscillator</td>
    <td>12 MHz 30 ppm</td>
  </tr>
  <tr>
    <td>Clock Divider Range</td>
    <td>1 to 65,500</td>
  </tr>
  <tr>
    <td>Jitter</td>
    <td>Usually < 0.1 ns</td>
  </tr>
  <tr>
    <td>Modes</td>
    <td>Normal, Single Shot, Burst, Duty Cycle</td>
  </tr>
  <tr>
    <td>Triggering</td>
    <td>Internal, External, Gated</td>
  </tr>
  <tr>
    <td>Counter Depths</td>
    <td>32 Bits</td>
  </tr>
  <tr>
    <td>Outputs</td>
    <td>T0 Event Out</td>
  </tr>
  <tr>
    <td>Pulse Duration</td>
    <td>20 ns * Clock Divider</td>
  </tr>
  <tr>
    <td>Output Voltage</td>
    <td>3.3 V or 5 V</td>
  </tr>
  <tr>
    <td>Output Impedance</td>
    <td>~50 Ohms</td>
  </tr>
  <tr>
    <td>Output Rise/Fall</td>
    <td>< 4 ns</td>
  </tr>

  <tr>
    <th colspan="2">Channel Timing Generator</th>
  </tr>
  <tr>
    <td>Pulse Range</td>
    <td>28 ns to 10 s * Clock Divider</td>
  </tr>
  <tr>
    <td>Resolution</td>
    <td>4 ns * Clock Divider</td>
  </tr>
  <tr>
    <td>Accuracy</td>
    <td>4 ns * Clock Divider</td>
  </tr>
  <tr>
    <td>Clock Divider Range</td>
    <td>1 to 65,500</td>
  </tr>
  <tr>
    <td>Single-channel Jitter</td>
    <td>Usually < 0.1 ns</td>
  </tr>
  <tr>
    <td>Inter-channel Jitter</td>
    <td>Usually < 0.4 ns</td>
  </tr>
  <tr>
    <td>Modes</td>
    <td>Normal, Single Shot, Burst, Duty Cycle</td>
  </tr>
  <tr>
    <td>Triggering</td>
    <td>T0, CH A-H, Gated</td>
  </tr>
  <tr>
    <td>Counter Depths</td>
    <td>32 Bits</td>
  </tr>
  <tr>
    <td>Delay Counter Depth</td>
    <td>31 Bits (1 bit used for outptu state)</td>
  </tr>
  <tr>
    <td>Output State/Delay Buffer</td>
    <td>7 Output State/Delay Pairs</td>
  </tr>
  <tr>
    <td>Output Voltage</td>
    <td>3.3 V or 5 V</td>
  </tr>
  <tr>
    <td>Output Impedance</td>
    <td>~50 Ohms</td>
  </tr>
  <tr>
    <td>Output Rise/Fall</td>
    <td>< 4 ns</td>
  </tr>
  <tr>
    <th colspan="2">Miscellaneous</th>
  </tr>
  <tr>
    <td>Output Channels</td>
    <td>8 Independent Channels</td>
  </tr>
  <tr>
    <td>Input Channels</td>
    <td>2 (1 Ext. Trigger; 1 Gate)</td>
  </tr>
  <tr>
    <td>Min. Trigger Length</td>
    <td>8 ns * Clock Divider</td>
  </tr>
  <tr>
    <td>Trigger Jitter</td>
    <td>4 ns * Clock Divider</td>
  </tr>
  <tr>
    <td>Trigger to Output Delay</td>
    <td>28 ns * Clock Divider</td>
  </tr>
</table>


 For more info, visit the OpenSYnc Github page [here](https://github.com/ErichZimmer/OpenSync/tree/main).