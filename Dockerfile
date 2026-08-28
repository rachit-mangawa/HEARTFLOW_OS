FROM python:3.10-slim

WORKDIR /app

# Install system dependencies if required by any ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies from the backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy necessary directories for the backend to run
COPY backend/ ./backend/
COPY model/ ./model/
COPY data/ ./data/

# Hugging Face Spaces mandates port 7860
EXPOSE 7860

# Ensure Python knows where to find the backend module
ENV PYTHONPATH=/app

# Start the FastAPI server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
