---
title: "USB data wires: differential signaling"
---

The job of those data wires is to transfer a single signal (the "serial" in USB). This means USB is "half-duplex": at any given time, one end of the cable is the sender, and the other end the receiver.

How do those data wires work? First let's consider how they _don't_ work: via "single-ended signaling". This uses just a single data wire, as well as a ground wire. The data wire carries a varying voltage (i.e., varying compared to the ground), and the voltage is interpreted as the value of the signal.

A problem with single-ended signaling is electromagnetic interference. The interference adds noise to the voltage on the data wire.

For this reason, USB does not use the single-ended method. Instead it uses "differential signaling". Differential signaling transmits _two_ signals, `D+` and `D-`, using the single-ended encoding. The output signal is then the difference, `S = D+ - D-`. The insight here is that interference will usually affect both wires `D+` and `D-` in the same way, and so by subtracting the two noisy wires, we cancel out the noise.

In USB, the signal is digital: either a 1 or a 0. The receiver calculates `S`, then interprets a positive `S` as a 1, and a negative `S` as a 0. Thus, the sender can send a 1 by setting `D+` greater than `D-`, or conversely, send a 0 by setting `D+` less than `D-`.

In practice, the sender chooses voltages with enough differential that it is unlikely to be "flipped" by electromagnetic noise. The differential applied is 2.5V, by setting one line to 0.3V and the other to 2.8V.

Also, in practice, the receiver is a bit more picky: if `-200mV < S < 200mV`, it considers the signal to be neither a 0 nor a 1; it's too close to distinguish.
