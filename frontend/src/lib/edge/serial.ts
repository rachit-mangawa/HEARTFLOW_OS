import { PatientVitals } from "./types";

export type SerialConnectionStatus = "idle" | "connected" | "loopback" | "error" | "unsupported";

export interface SerialBridgeHandle {
  disconnect: () => void;
  mode: "hardware" | "loopback";
}

export function isWebSerialSupported(): boolean {
  return typeof window !== "undefined" && "serial" in navigator;
}

/**
 * Parses raw serial packet lines emitted from microcontrollers running PlatformIO firmware.
 * Supports both JSON format and standard NMEA-style telemetry: $HR,SPO2,SYS,DIA,TEMP*CHECKSUM
 */
export function parseSerialPacket(line: string): PatientVitals | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // 1. JSON Telemetry Frame
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (
        typeof parsed.Heart_Rate === "number" ||
        typeof parsed.hr === "number"
      ) {
        return {
          Heart_Rate: parsed.Heart_Rate ?? parsed.hr ?? 75,
          SpO2_Level: parsed.SpO2_Level ?? parsed.spo2 ?? 98,
          Systolic_BP: parsed.Systolic_BP ?? parsed.sys ?? 120,
          Diastolic_BP: parsed.Diastolic_BP ?? parsed.dia ?? 80,
          Body_Temp: parsed.Body_Temp ?? parsed.temp ?? 37.0,
        };
      }
    } catch {
      // not JSON
    }
  }

  // 2. Comma-Delimited or NMEA-style line: $HR,SPO2,SYS,DIA,TEMP
  const cleanLine = trimmed.startsWith("$") ? trimmed.substring(1) : trimmed;
  const noChecksum = cleanLine.split("*")[0];
  const parts = noChecksum.split(",").map((s) => parseFloat(s.trim()));

  if (parts.length >= 5 && parts.every((p) => !isNaN(p))) {
    return {
      Heart_Rate: parts[0],
      SpO2_Level: parts[1],
      Systolic_BP: parts[2],
      Diastolic_BP: parts[3],
      Body_Temp: parts[4],
    };
  }

  return null;
}

interface SerialPortLike {
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  readable: ReadableStream<BufferSource>;
}

/**
 * Connects to physical microcontroller via Chromium Web Serial API at 115,200 baud.
 */
export async function connectWebSerial(
  onPacket: (vitals: PatientVitals) => void,
  onStatusChange: (status: SerialConnectionStatus, message: string) => void
): Promise<SerialBridgeHandle> {
  if (!isWebSerialSupported()) {
    onStatusChange("unsupported", "Web Serial API not supported in this browser. Engage Silicon Loopback instead.");
    throw new Error("Web Serial API unsupported");
  }

  try {
    const navSerial = (navigator as unknown as { serial: { requestPort: () => Promise<SerialPortLike> } }).serial;
    const port = await navSerial.requestPort();
    await port.open({ baudRate: 115200 });

    onStatusChange("connected", "ESP32_XTENSA_ONLINE // 115,200 BAUD // UART_STREAM_ACTIVE");

    let isReading = true;
    const decoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();

    let buffer = "";

    const readLoop = async () => {
      try {
        while (isReading) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            buffer += value;
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              const vitals = parseSerialPacket(line);
              if (vitals) {
                onPacket(vitals);
              }
            }
          }
        }
      } catch (err: unknown) {
        if (isReading) {
          const errMsg = err instanceof Error ? err.message : String(err);
          onStatusChange("error", `UART Stream read fault: ${errMsg}`);
        }
      }
    };

    readLoop();

    const disconnect = async () => {
      isReading = false;
      try {
        await reader.cancel();
        await readableStreamClosed.catch(() => {});
        await port.close();
      } catch {
        // catch close errors
      }
      onStatusChange("idle", "DISCONNECTED");
    };

    return { disconnect, mode: "hardware" };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    onStatusChange("error", `Web Serial failed to open: ${errMsg}`);
    throw err;
  }
}

/**
 * Silicon Loopback Simulator: Generates physical UART byte streams for test environments without hardware.
 */
export function startSiliconLoopback(
  onPacket: (vitals: PatientVitals) => void,
  onStatusChange: (status: SerialConnectionStatus, message: string) => void
): SerialBridgeHandle {
  onStatusChange("loopback", "SILICON_LOOPBACK_BRIDGE_ACTIVE // ESP32_VIRTUAL_COM1 // 115,200 BAUD");

  let hr = 76.0;
  let spo2 = 98.2;
  let sys = 122.0;
  let dia = 81.0;
  let temp = 37.1;

  const timer = setInterval(() => {
    // Generate realistic sensor telemetry with sensor noise
    hr += (Math.random() - 0.48) * 3;
    spo2 += (Math.random() - 0.49) * 0.6;
    sys += (Math.random() - 0.48) * 2;
    dia += (Math.random() - 0.48) * 1.5;
    temp += (Math.random() - 0.5) * 0.1;

    hr = Math.max(55, Math.min(160, hr));
    spo2 = Math.max(82, Math.min(100, spo2));
    sys = Math.max(90, Math.min(190, sys));
    dia = Math.max(60, Math.min(115, dia));
    temp = Math.max(36.1, Math.min(39.0, temp));

    const vitals: PatientVitals = {
      Heart_Rate: Number(hr.toFixed(1)),
      SpO2_Level: Number(spo2.toFixed(1)),
      Systolic_BP: Number(sys.toFixed(1)),
      Diastolic_BP: Number(dia.toFixed(1)),
      Body_Temp: Number(temp.toFixed(1)),
    };

    onPacket(vitals);
  }, 1000);

  const disconnect = () => {
    clearInterval(timer);
    onStatusChange("idle", "DISCONNECTED");
  };

  return { disconnect, mode: "loopback" };
}
