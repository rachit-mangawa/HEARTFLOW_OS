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
graph = graphviz.Digraph(node_attr={'shape': 'box', 'style': 'rounded,filled', 'fontname': 'Helvetica', 'margin': '0.2'}, graph_attr={'rankdir': 'TB', 'splines': 'ortho', 'nodesep': '0.8'})

# Define UI & API nodes at the top
graph.node('UI', '🖥️ Streamlit Frontend\nInteractive Dashboard', fillcolor='#ff4b4b', fontcolor='white', color='#a30000', penwidth='2')
graph.node('API', '⚙️ FastAPI Backend\nRouting & API Logic', fillcolor='#009688', fontcolor='white', color='#004d40', penwidth='2')
graph.node('DB', '🗄️ SQLite DB\nPatient History', shape='cylinder', fillcolor='#9b59b6', fontcolor='white', color='#4a235a', penwidth='2')

# Core connections
graph.edge('UI', 'API', label=' REST JSON', color='#666666', fontcolor='#666666')
graph.edge('API', 'DB', label=' Read/Write', color='#666666', fontcolor='#666666')

# Machine Learning Subgraph
with graph.subgraph(name='cluster_ml') as ml:
    ml.attr(label='🧠 Machine Learning & Inference Pipeline', style='dashed', color='#aaaaaa', fontcolor='#888888')
    ml.node('ENS', 'Ensemble Engine\nSoft-Voting Aggregator', shape='diamond', fillcolor='#f2c94c', fontcolor='black', color='#b28900', penwidth='2')
    ml.node('MODELS', 'Classifiers\n(RF, SVM, LogReg, NN, KNN)', fillcolor='#f2c94c', fontcolor='black', color='#b28900', penwidth='2')
    ml.node('SHAP', '🔍 SHAP Explainer\nFeature Impact Analysis', fillcolor='#f2c94c', fontcolor='black', color='#b28900', penwidth='2')

# Hardware Export Subgraph
with graph.subgraph(name='cluster_edge') as edge:
    edge.attr(label='⚡ Hardware & Edge AI Export', style='dashed', color='#aaaaaa', fontcolor='#888888')
    edge.node('TRANS', 'C-Code Transpiler\nINT8 Quantization', fillcolor='#2d9cdb', fontcolor='white', color='#106093', penwidth='2')
    edge.node('HEADER', 'tinyml_model.h\nOptimized Header File', shape='note', fillcolor='#2d9cdb', fontcolor='white', color='#106093', penwidth='2')
    edge.node('MCU', '📟 ESP32 / ARM Cortex-M\nMicrocontroller Node', fillcolor='#2d9cdb', fontcolor='white', color='#106093', penwidth='2')

# Map Cross-cluster edges
graph.edge('API', 'ENS', label=' Predict', color='#333333')
graph.edge('ENS', 'MODELS', color='#333333')

graph.edge('API', 'SHAP', label=' Explain', color='#333333')
graph.edge('SHAP', 'MODELS', style='dashed', label=' Analyzes Trees', fontcolor='#555555', color='#555555')

graph.edge('API', 'TRANS', label=' Export Config', color='#333333')
graph.edge('TRANS', 'HEADER', label=' Scale FP32 to INT8', fontcolor='#555555', color='#555555')
graph.edge('HEADER', 'MCU', label=' Flash Firmware', color='#333333')

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
