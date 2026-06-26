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

|  |  |
| --- | --- |
| Timing Resolution | 4 ns, 8 ns, 20 ns, 100 ns, 1 us |
| Pulse Range | 20 ns to 5,000 s |
| Pulse Frequency | 0.0004 Hz to 1.9 MHz |
| Single-channel Jitter | < 0.1 ns |
| Inter-channel Jitter | <0.3 ns |
| Triggering | Internal, External, Gated |
| Output Voltage | 5 V |
| Output Impedance | 50 Ohms |

Additionally, 
 - Three (3) independent clocks mapped to all 8 output channels
 - Variable timing for each internal clock
 - Each clock can skip certain number of external triggers
 - Each clock can add delay between external trigger signal and pulse sequence signal
 - Each clock can be gated to an external trigger
 - Internal clocks and pulse sequncers can have different clock dividers