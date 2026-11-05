#!/usr/bin/env python3
"""
HEARTFLOW_OS · Periodic Telemetry Ingestion Worker
--------------------------------------------------
Generates clinically realistic physiological vitals and sends inference
telemetry queries to the HEARTFLOW_OS backend at randomized intervals (5-6 hours),
ensuring the clinical telemetry audit database remains populated with live records.

Supports both:
  - One-shot execution: python backend/worker.py --once (Ideal for GitHub Actions / Cron)
  - Continuous daemon:  python backend/worker.py (Default: randomized 5-6 hour loop)
"""

import os
import sys
import time
import json
import random
import argparse
import urllib.request
import urllib.error
from datetime import datetime

DEFAULT_API_URL = os.getenv(
    "HEARTFLOW_API_URL",
    "https://idkhowtocodefr-hf-backend.hf.space/heartflow/predict"
)

# Clinically realistic physiological profile archetypes
ARCHETYPES = [
    {
        "name": "Healthy Baseline",
        "weight": 40,
        "hr": (65.0, 84.0),
        "spo2": (97.0, 99.0),
        "sys": (114.0, 126.0),
        "dia": (74.0, 84.0),
        "temp": (36.6, 37.2),
    },
    {
        "name": "Stage 2 Hypertensive",
        "weight": 20,
        "hr": (78.0, 98.0),
        "spo2": (95.0, 98.0),
        "sys": (158.0, 185.0),
        "dia": (98.0, 114.0),
        "temp": (36.8, 37.3),
    },
    {
        "name": "Acute Asthmatic Hypoxemia",
        "weight": 15,
        "hr": (96.0, 118.0),
        "spo2": (88.0, 92.0),
        "sys": (126.0, 140.0),
        "dia": (80.0, 88.0),
        "temp": (37.0, 37.5),
    },
    {
        "name": "Arrhythmia / Tachycardia",
        "weight": 15,
        "hr": (130.0, 156.0),
        "spo2": (92.0, 96.0),
        "sys": (138.0, 162.0),
        "dia": (88.0, 98.0),
        "temp": (36.8, 37.4),
    },
    {
        "name": "Febrile / Sepsis Surveillance",
        "weight": 10,
        "hr": (104.0, 124.0),
        "spo2": (94.0, 97.0),
        "sys": (102.0, 118.0),
        "dia": (64.0, 74.0),
        "temp": (38.6, 39.4),
    },
]

def generate_telemetry_vector() -> dict:
    """Samples a clinical archetype and applies gaussian jitter."""
    weights = [a["weight"] for a in ARCHETYPES]
    archetype = random.choices(ARCHETYPES, weights=weights, k=1)[0]
    
    hr = round(random.uniform(*archetype["hr"]) + random.gauss(0, 1.0), 1)
    spo2 = round(min(100.0, max(75.0, random.uniform(*archetype["spo2"]) + random.gauss(0, 0.4))), 1)
    sys_bp = round(random.uniform(*archetype["sys"]) + random.gauss(0, 1.5), 1)
    dia_bp = round(random.uniform(*archetype["dia"]) + random.gauss(0, 1.0), 1)
    temp = round(random.uniform(*archetype["temp"]) + random.gauss(0, 0.1), 1)

    # Sanity checks
    if dia_bp >= sys_bp:
        dia_bp = sys_bp - 25.0

    return {
        "archetype": archetype["name"],
        "payload": {
            "Heart_Rate": hr,
            "SpO2_Level": spo2,
            "Systolic_BP": sys_bp,
            "Diastolic_BP": dia_bp,
            "Body_Temp": temp,
        }
    }

def post_telemetry(api_url: str, telemetry: dict, timeout: int = 25) -> bool:
    """Posts telemetry packet to HEARTFLOW_OS /predict endpoint."""
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    payload = telemetry["payload"]
    archetype = telemetry["archetype"]
    
    print(f"[{now_str}] [HEARTFLOW WORKER] Transmitting telemetry query...")
    print(f"  Target:    {api_url}")
    print(f"  Archetype: {archetype}")
    print(f"  Vitals:    HR={payload['Heart_Rate']} BPM | SpO2={payload['SpO2_Level']}% | BP={payload['Systolic_BP']}/{payload['Diastolic_BP']} mmHg | Temp={payload['Body_Temp']}°C")

    body_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=body_bytes,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "HEARTFLOW_OS-TelemetryWorker/1.2.0 (Autonomous-Clinician)",
        },
        method="POST"
    )

    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            latency_ms = (time.time() - t0) * 1000
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)
            
            label = data.get("prediction_label", "Unknown")
            conf = data.get("probability", 0.0)
            is_risk = data.get("prediction", False)
            
            print(f"[{now_str}] SUCCESS (HTTP {response.status} in {latency_ms:.1f}ms)")
            print(f"  Diagnosis:  {label} (Confidence: {conf * 100:.1f}%)")
            print(f"  Risk Alert: {'CRITICAL / AT RISK' if is_risk else 'NOMINAL / STABLE'}")
            print(f"  Database:   Record successfully appended to session audit log.\n")
            return True
    except urllib.error.HTTPError as e:
        latency_ms = (time.time() - t0) * 1000
        error_msg = e.read().decode("utf-8", errors="replace")
        print(f"[{now_str}] HTTP ERROR {e.code} ({latency_ms:.1f}ms): {error_msg}\n", file=sys.stderr)
        return False
    except Exception as e:
        latency_ms = (time.time() - t0) * 1000
        print(f"[{now_str}] CONNECTION ERROR ({latency_ms:.1f}ms): {str(e)}\n", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="HEARTFLOW_OS Autonomous Telemetry Worker")
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run once and exit (for cron jobs / GitHub Actions)"
    )
    parser.add_argument(
        "--url",
        type=str,
        default=DEFAULT_API_URL,
        help=f"Target /predict endpoint URL (default: {DEFAULT_API_URL})"
    )
    parser.add_argument(
        "--min-hours",
        type=float,
        default=5.0,
        help="Minimum randomized sleep hours between ticks in loop mode (default: 5.0)"
    )
    parser.add_argument(
        "--max-hours",
        type=float,
        default=6.0,
        help="Maximum randomized sleep hours between ticks in loop mode (default: 6.0)"
    )
    args = parser.parse_args()

    print("=" * 70)
    print("HEARTFLOW_OS · TELEMETRY INGESTION WORKER DAEMON")
    print(f"Endpoint: {args.url}")
    print(f"Mode:     {'One-Shot Cron Execution' if args.once else f'Continuous Loop ({args.min_hours}-{args.max_hours} hrs randomized interval)'}")
    print("=" * 70 + "\n")

    if args.once:
        telemetry = generate_telemetry_vector()
        success = post_telemetry(args.url, telemetry)
        sys.exit(0 if success else 1)

    # Continuous loop mode
    while True:
        telemetry = generate_telemetry_vector()
        post_telemetry(args.url, telemetry)
        
        sleep_sec = random.uniform(args.min_hours * 3600, args.max_hours * 3600)
        sleep_hrs = sleep_sec / 3600
        wake_time = datetime.fromtimestamp(time.time() + sleep_sec).strftime("%Y-%m-%d %H:%M:%S")
        
        print(f">> Next telemetry stream scheduled in {sleep_hrs:.2f} hours (at {wake_time}). Sleeping...")
        print("-" * 70)
        time.sleep(sleep_sec)

if __name__ == "__main__":
    main()

