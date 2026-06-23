import streamlit as st

st.set_page_config(page_title="About Systems", page_icon="ℹ️")
st.title("ℹ️ Architecture Fundamentals")

st.markdown("""
### 🧠 TinyML Paradigm
TinyML intersects machine learning and embedded IoT devices. This project mimics edge intelligence by keeping computationally complex deep learning stacks out of the loop and utilizing lightweight linear models, trees, and small MLPs mapped inside a soft-voting ensemble mechanism.

### ⚙️ The Application Stack
- **FastAPI**: Serving as our lightweight REST API for handling JSON-form predictions asynchronously across nodes.
- **Streamlit**: Driving the real-time interaction, charting, and frontend dashboard cleanly without convoluted JS frameworks.
- **Docker Compose**: Orchestrating our microservices gracefully, mapping the API to `:8000` and UI to `:8501`.
- **GitHub Actions CI/CD**: Ensuring automated health checks, linting, and dependency verification before production merges.

Developed cleanly per TinyML efficiency constraints for medical AI.
""")
