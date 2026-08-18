import streamlit as st
import graphviz

st.set_page_config(page_title="About Project", page_icon="ℹ️", layout="wide")

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

html, body, [class*="css"] { 
    font-family: 'Inter', sans-serif; 
    color: #e0e0e0;
}

.main {
    background-color: #0e1117;
}

h1 {
    font-weight: 800 !important;
    letter-spacing: -1px !important;
    color: #ffffff !important;
    font-size: 3rem !important;
    margin-bottom: 0.5rem !important;
}

h3 {
    font-weight: 700 !important;
    color: #00f2fe !important;
    margin-top: 2rem !important;
    font-size: 1.8rem !important;
}

p, li, div {
    font-size: 1.1rem !important;
    line-height: 1.6 !important;
}

.tech-badge {
    display: inline-block; 
    padding: 6px 16px; 
    margin: 0 8px 10px 0;
    border-radius: 50px; 
    font-size: 0.9rem; 
    font-weight: 600;
    background: rgba(255,255,255,0.05); 
    border: 1px solid rgba(255,255,255,0.1);
    color: #00f2fe; 
    transition: all 0.3s ease;
}

.tech-badge:hover { 
    background: rgba(0, 242, 254, 0.2); 
    border-color: #00f2fe; 
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 242, 254, 0.2);
}

.live-link {
    text-decoration: none; 
    font-weight: 600; 
    color: #4facfe;
    border-bottom: 1px dashed #4facfe;
    transition: all 0.2s ease;
}

.live-link:hover { 
    color: #00f2fe;
    border-bottom-style: solid;
}

/* Glass cards for the info/success/etc boxes */
div[data-testid="stExpander"], .stAlert {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 15px !important;
    backdrop-filter: blur(10px);
}

.stMarkdown {
    margin-bottom: 1rem;
}

</style>
""", unsafe_allow_html=True)

st.title("ℹ️ About the Platform")

st.markdown("""
This platform is a prototype of an end-to-end Machine Learning pipeline specifically designed to operate natively on resource-constrained embedded edge hardware (**TinyML**), targeting microcontrollers such as the **ESP32** or **ARM Cortex-M** architectures.

**Live Environments:**
* 🖥️ **Frontend Suite:** <a href="https://tinyml-heart-health-monitoring-dashboard-8xqogy2hibtlayt7popvs.streamlit.app/" target="_blank" class="live-link">Streamlit Cloud Deployment</a>
* ⚙️ **Backend Hub:** <a href="https://huggingface.co/spaces/IDKHowToCodeFr/tinyml-backend" target="_blank" class="live-link">Hugging Face Spaces API</a>

<div style="margin-top: 15px;">
    <span class="tech-badge">Python 3.9+</span>
    <span class="tech-badge">FastAPI</span>
    <span class="tech-badge">Streamlit</span>
    <span class="tech-badge">Scikit-Learn</span>
    <span class="tech-badge">SHAP</span>
    <span class="tech-badge">Docker</span>
    <span class="tech-badge">PyTest</span>
</div>
""", unsafe_allow_html=True)

st.markdown("---")

st.markdown("### 🏗️ System Architecture")
# Create a Graphviz flowchart for the About page
graph = graphviz.Digraph(node_attr={'shape': 'box', 'style': 'rounded,filled', 'fontname': 'Helvetica', 'margin': '0.3', 'fontsize': '12'}, 
                         graph_attr={'rankdir': 'TB', 'splines': 'ortho', 'nodesep': '1.0', 'bgcolor': 'transparent', 'fontcolor': 'white'})

# Define UI & API nodes at the top
graph.node('UI', '🖥️ Streamlit Frontend\nInteractive Dashboard (IST)', fillcolor='#ff4b4b', fontcolor='white', color='#a30000', penwidth='2')
graph.node('API', '⚙️ FastAPI Backend\nInternal Routing (UTC)', fillcolor='#009688', fontcolor='white', color='#004d40', penwidth='2')
graph.node('HUB', '🤗 HF Hub Dataset\nCentralized History Store', shape='folder', fillcolor='#ffcc00', fontcolor='#1a1a1a', color='#d4a017', penwidth='2')
graph.node('DB', '🗄️ SQLite DB\nLocal Instance Cache', shape='cylinder', fillcolor='#9b59b6', fontcolor='white', color='#4a235a', penwidth='2')

# Core connections
graph.edge('UI', 'API', label=' internal localhost:8000', color='#888888', fontcolor='#888888')
graph.edge('API', 'DB', label=' Read/Write', color='#888888', fontcolor='#888888')
graph.edge('API', 'HUB', label=' HfApi Sync (Persistent)', color='#888888', fontcolor='#888888')

# Machine Learning Subgraph
with graph.subgraph(name='cluster_ml') as ml:
    ml.attr(label='🧠 Machine Learning & Inference Pipeline', style='dashed', color='#555555', fontcolor='#aaaaaa')
    ml.node('ENS', 'Ensemble Engine\nSoft-Voting Aggregator', shape='diamond', fillcolor='#f2c94c', fontcolor='#1a1a1a', color='#b28900', penwidth='2')
    ml.node('MODELS', 'Classifiers\n(RF, SVM, LogReg, NN, KNN)', fillcolor='#f2c94c', fontcolor='#1a1a1a', color='#b28900', penwidth='2')
    ml.node('SHAP', '🔍 SHAP Explainer\nFeature Impact Analysis', fillcolor='#f2c94c', fontcolor='#1a1a1a', color='#b28900', penwidth='2')

# Hardware Export Subgraph
with graph.subgraph(name='cluster_edge') as edge:
    edge.attr(label='⚡ Hardware & Edge AI Export', style='dashed', color='#555555', fontcolor='#aaaaaa')
    edge.node('TRANS', 'C-Code Transpiler\nINT8 Quantization', fillcolor='#2d9cdb', fontcolor='white', color='#106093', penwidth='2')
    edge.node('HEADER', 'tinyml_model.h\nOptimized Header File', shape='note', fillcolor='#2d9cdb', fontcolor='white', color='#106093', penwidth='2')
    edge.node('MCU', '📟 ESP32 / ARM Cortex-M\nMicrocontroller Node', fillcolor='#2d9cdb', fontcolor='white', color='#106093', penwidth='2')

# Map Cross-cluster edges
graph.edge('API', 'ENS', label=' Predict', color='#cccccc', fontcolor='#cccccc')
graph.edge('ENS', 'MODELS', color='#cccccc')

graph.edge('API', 'SHAP', label=' Explain', color='#cccccc', fontcolor='#cccccc')
graph.edge('SHAP', 'MODELS', style='dashed', label=' Analyzes Trees', fontcolor='#888888', color='#888888')

graph.edge('API', 'TRANS', label=' Export Config', color='#cccccc', fontcolor='#cccccc')
graph.edge('TRANS', 'HEADER', label=' Scale FP32 to INT8', fontcolor='#888888', color='#888888')
graph.edge('HEADER', 'MCU', label=' Flash Firmware', color='#cccccc')

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
    **🔍 Data Synchronization & Localization**\n
    To support a distributed architecture, the system centralizes its **Patient History** on the Hugging Face Hub as a persistent storage layer. 
    The platform is fully time-zone aware: while the **Backend API** operates on a robust **UTC** standard for data integrity, the **Frontend Dashboard** automatically localizes all telemetry and history logs to **IST (Indian Standard Time, UTC+5:30)**.
    """)
    
    st.error("""
    **🔄 Continuous Learning (MLOps)**\n
    System robustness requires adaptability. The **MLOps settings** permit uploading newly captured CSV datasets spanning emerging patient patterns. Submitting retraining logic prompts the backend pipeline to independently spin up `Scikit-Learn` algorithms to overwrite `.pkl` binary files, seamlessly refreshing the intelligence available on the dashboard.
    """)

st.markdown("""
<div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); font-size: 0.85rem;">
    Designed as a scalable, fully interpretable Edge-based Machine Learning architecture for modern Healthcare telemetry.<br>
    MIT License
</div>
""", unsafe_allow_html=True)
