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

| Parameter                     | Value                                  |
| ----------------------------- | -------------------------------------- |
| **Internal Timing Generator** |                                        |
| Period Range                  | 0.0004 Hz to 5 MHz                     |
| Resolution                    | 4 ns Clock Divider                     |
| Accuracy                      | 4 ns Clock Divider                     |
| PLL Frequency                 | 250 MHz                                |
| Crystal Oscillator            | 12 MHz 30 ppm                          |
| Clock Divider Range           | 1 to 65,500                            |
| Jitter                        | Usually < 0.1 ns                       |
| Modes                         | Normal, Single Shot, Burst, Duty Cycle |
| Triggering                    | Internal, External, Gated              |
| Counter Depths                | 32 Bits                                |
| Outputs                       | T0 Event Out                           |
| Pulse Duration                | 20 ns * Clock Divider                  |
| Output Voltage                | 3.3 V or 5 V                           |
| Output Impedance              | ~50 Ohms                               |
| Output Rise/Fall              | < 4 ns                                 |
| **Channel Timing Generator**  |                                        |
| Pulse Range                   | 28 ns to 10 s Clock Divider            |
| Resolution                    | 4 ns Clock Divider                     |
| Accuracy                      | 4 ns Clock Divider                     |
| Clock Divider Range           | 1 to 65,500                            |
| Single-channel Jitter         | Usually < 0.1 ns                       |
| Inter-channel Jitter          | Usually < 0.4 ns                       |
| Modes                         | Normal, Single Shot, Burst, Duty Cycle |
| Triggering                    | T0, CH A-H, Gated                      |
| Counter Depths                | 32 Bits                                |
| Delay Counter Depth           | 31 Bits (1 bit used for output state)  |
| Output State/Delay Buffer     | 7 Output State/Delay Pairs             |
| Output Voltage                | 3.3 V or 5 V                           |
| Output Impedance              | ~50 Ohms                               |
| Output Rise/Fall              | < 4 ns                                 |
| **Miscellaneous**             |                                        |
| Output Channels               | 8 Independent Channels                 |
| Input Channels                | 2 (1 Ext. Trigger; 1 Gate)             |
| Min. Trigger Length           | 8 ns Clock Divider                     |
| Trigger Jitter                | 4 ns Clock Divider                     |
| Trigger to Output Delay       | 28 ns Clock Divider                    |



 For more info, visit the OpenSYnc Github page [here](https://github.com/ErichZimmer/OpenSync/tree/main).