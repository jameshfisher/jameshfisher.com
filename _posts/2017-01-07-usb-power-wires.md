---
title: USB power wires
---

I stripped a USB cable. The cable itself has four wires: white, black, red, and green. Each USB cable has two ends, each with a _connector_. One one end is a type-A connector, and on the other a micro-B connector. The type-A connector has four pins, and the type-B has five!

What are the four wires? The four colors correspond to four names. The black and red are _power_ wires, and the white and green are _data_ wires. Black is "GND" or _ground_. The red is "VBUS", or +5 volts. The white is "D-" and the green is "D+", where "D" stands for _data_.

Each pin on the connector is connected to one of the four wires. On the type-A connector:

```
   |                            |
   +----------------------------+
   | +========================+ |
   | |   ___            ___   | |
   +-|  [___]          [___]  |-+
     |                        |
     +------------------------+
     |  |GND|  D+  D-  |+5V|  |
     +--+===+--==--==--+===+--+
     ||||||||||||||||||||||||||
     +------------------------+
```

Ignoring the data pins, you can just use USB to power things. I made a USB LED light by connecting:

- GND (black wire) to a 100 ohm resistor
- the resistor to the short (negative) leg of the LED
- the long leg to +5V (red wire)
- the USB A connector to my laptop
- ignore the data wires
