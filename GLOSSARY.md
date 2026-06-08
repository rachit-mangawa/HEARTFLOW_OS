# GLOSSARY

### Anomaly
A detected clinical deviation from normotensive, homeostatic vitals, classified into discrete disease risks (Hypertension, Arrhythmia, Diabetes, Asthma, or Acute Coronary Syndrome).

### Baud Rate
The modulation transmission speed over the Universal Asynchronous Receiver-Transmitter (UART) serial bus, fixed at 115,200 symbols per second for the ESP32 firmware target.

### Diagnostic Probabilities
A normalized probability distribution across the cardiovascular classification space, computed via a weighted soft-voting ensemble across constituent machine learning models.

### Lead-II ECG
A clinical standard electrocardiographic vector measured between the right arm and left leg electrodes, exhibiting the canonical P-Q-R-S-T cardiac cycle morphology and maximum electrical axis alignment with ventricular depolarization.

### P-Q-R-S-T Complex
The fundamental electrophysiological signature of a single heartbeat:
- **P Wave**: Atrial depolarization.
- **PR Segment**: Conduction delay through the atrioventricular (AV) node.
- **QRS Complex**: Rapid ventricular depolarization.
- **ST Segment**: Isoelectric plateau period between ventricular depolarization and repolarization.
- **T Wave**: Ventricular repolarization.

### QRS Morphology
The spatial and temporal shape of the ventricular depolarization wave. Pathological deviations include widened complexes (bundle branch blocks, ventricular ectopy) and high-amplitude spikes.

### Quantization (INT8)
The process of transforming 32-bit floating point model weights and activations into 8-bit signed integers (-128 to 127) using affine scaling, reducing memory footprint by ~75% while maintaining inference fidelity.

### ST-Segment Elevation (STEMI)
A critical diagnostic displacement of the electrocardiographic ST segment above the baseline, indicating acute transmural myocardial ischemia (heart attack risk).

### Telemetry Packet
A delimited serial frame emitted by the microcontroller sensor bridge containing physiological scalars (`Heart_Rate`, `SpO2_Level`, `Systolic_BP`, `Diastolic_BP`, `Body_Temp`).

### TinyML
The deployment of machine learning algorithms onto resource-constrained microcontrollers (MCUs) characterized by strictly bounded SRAM (typically <512 KB), no operating system, and zero dynamic memory allocation (`malloc`).

### Web Serial API
A W3C browser capability allowing client-side web applications to establish bidirectional asynchronous serial communication with physical USB and Bluetooth UART peripherals.
