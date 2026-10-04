import asyncio
from typing import AsyncGenerator
from simulator import PatientDataSimulator
from inference import evaluate
from schemas import PatientData

class TelemetryStreamer:
    """
    Deep Module for Telemetry Streaming.
    Encapsulates the simulator lifecycle, ML inference threading, and payload formatting.
    Provides a simple async generator interface.
    """
    def __init__(self, ensemble_model):
        self.ensemble_model = ensemble_model
        self.simulator = PatientDataSimulator()

    async def stream(self) -> AsyncGenerator[dict, None]:
        async for state in self.simulator.run():
            data = PatientData(**state)
            
            # Offload ML inference to thread pool to avoid blocking the event loop
            prediction_result = await asyncio.to_thread(evaluate, self.ensemble_model, data)
            
            front_pred = None
            if "error" not in prediction_result:
                front_pred = {
                    "is_at_risk": 1 if prediction_result.get("prediction") else 0,
                    "label": prediction_result.get("prediction_label"),
                    "confidence": prediction_result.get("probability"),
                    "disease_probs": prediction_result.get("disease_probs", {})
                }
            
            yield {
                "sensor_data": data.model_dump(),
                "prediction": front_pred
            }
