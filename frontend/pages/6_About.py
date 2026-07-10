import streamlit as st
import graphviz

st.set_page_config(page_title="About Project", page_icon="ℹ️", layout="wide")

st.title("ℹ️ About the Project")

st.markdown("""
### TinyML Heart Health Monitoring Dashboard

This dashboard is a prototype of an end-to-end Machine Learning pipeline specifically designed to operate natively on resource-constrained embedded edge hardware ("TinyML"), targeting microcontrollers such as the ESP32 or ARM Cortex-M architecture.
""")

st.markdown("---")

st.markdown("### 🏗️ System Architecture")
# Create a Graphviz flowchart for the About page
graph = graphviz.Digraph(node_attr={'shape': 'box', 'style': 'rounded,filled', 'fillcolor': '#f2f2f2', 'fontname': 'Helvetica'})
graph.attr(rankdir='LR') # Left to Right layout

# Define nodes
graph.node('UI', '🖥️ Streamlit UI', fillcolor='#ffcccc')
graph.node('API', '⚙️ FastAPI Backend', fillcolor='#ccffcc')
graph.node('ENS', '🧠 Ensemble Engine\n(RF, SVM, NN, LogReg, KNN)', fillcolor='#ccccff')
graph.node('SHAP', '🔍 SHAP Explainer', fillcolor='#ffffcc')
graph.node('EXPORT', '⚡ TinyML Transpiler\n(INT8 Quantization)', fillcolor='#ffccff')
graph.node('MCU', '📟 Edge Device\n(ESP32 / Arduino)', fillcolor='#e6ccff')

# Define edges
graph.edge('UI', 'API', label=' REST JSON')
graph.edge('API', 'ENS', label=' Predict')
graph.edge('API', 'SHAP', label=' Explain')
graph.edge('API', 'EXPORT', label=' Export C-Code')
graph.edge('EXPORT', 'MCU', label=' Flash Firmware')

st.graphviz_chart(graph, use_container_width=True)

st.markdown("---")
st.markdown("### ✨ Core Capabilities")

col1, col2 = st.columns(2)

with col1:
    st.info("""
    **⚡ TinyML & Edge AI Optimization**\n
    Traditional machine learning models process inference entirely in the cloud, generating heavy dependency on network transmission. This project supports **Edge AI**, converting Python-trained traditional classifiers into compiled C-code arrays for offline deployment on limited hardware.
    We implement **INT8 Quantization**, scaling 64-bit Floating Point (`double`) coefficients down into 8-bit integers (`int8_t`). This scaling effectively shrinks memory payload by nearly 75% on microcontrollers.
    """)
    
    st.success("""
    **🤝 Ensemble Machine Learning**\n
    The predictive core relies on an Ensemble Engine. Different constituent models (KNN, Random Forest, SVM, Small NN, Logistic Regression) independently evaluate patient input variables and compute probabilties. A Soft-Voting technique averages their confidence scores to produce an overall healthy/at-risk prediction.
    """)

with col2:
    st.warning("""
    **🔍 SHAP Clinical Explainability**\n
    In the medical space, a black-box model is often untrusted. The project leverages SHapley Additive exPlanations (**SHAP**) natively connected to the Random Forest model layer. SHAP assigns absolute baseline impact scores to every incoming feature, interpreting *why* the AI predicted a specific condition and quantifying mathematically whether individual factors act as risk vectors or protective measures.
    """)
    
    st.error("""
    **🔄 Continuous Learning (MLOps)**\n
    System robustness requires adaptability. The **MLOps settings** permit uploading newly captured CSV datasets spanning emerging patient patterns. Submitting retraining logic prompts the backend pipeline to independently spin up `Scikit-Learn` algorithms to overwrite `.pkl` binary files, seamlessly refreshing the intelligence available on the dashboard.
    """)

st.markdown("---")

st.markdown("""
*Developed as an educational implementation demonstrating scalable, fully interpretable Edge-based Machine Learning platforms for modern Healthcare telemetry.*
""")
