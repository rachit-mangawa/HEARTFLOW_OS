FROM python:3.10-slim
WORKDIR /app

RUN apt-get update && apt-get install -y graphviz && rm -rf /var/lib/apt/lists/*

COPY frontend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
WORKDIR /app/frontend
EXPOSE 8501
CMD sh -c "streamlit run Home.py --server.port=${PORT:-8501} --server.address=0.0.0.0"
