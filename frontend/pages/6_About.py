import streamlit as st
import graphviz

st.set_page_config(page_title="About Project", page_icon="ℹ️", layout="wide")

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

html, body, [class*="css"] { 
    font-family: 'Inter', sans-serif; 
    color: #FAFAFA;
}

.main {
    background-color: #0e1117;
}

h1 {
    font-weight: 800 !important;
    letter-spacing: -1.5px !important;
    color: #FFFFFF !important;
    font-size: 3.2rem !important;
    margin-bottom: 0.8rem !important;
}

h3 {
    font-weight: 700 !important;
    color: #AED9E0 !important; /* Sky Blue Pastel */
    margin-top: 2.5rem !important;
    font-size: 2rem !important;
    letter-spacing: -0.5px !important;
}

p, li, div {
    font-size: 1.15rem !important;
    line-height: 1.7 !important;
    color: #E0E0E0 !important;
}

.tech-badge {
    display: inline-block; 
    padding: 8px 18px; 
    margin: 0 10px 12px 0;
    border-radius: 50px; 
    font-size: 0.95rem; 
    font-weight: 600;
    background: rgba(174, 217, 224, 0.1); /* Sky Blue Tint */
    border: 1px solid rgba(174, 217, 224, 0.3);
    color: #AED9E0; 
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tech-badge:hover { 
    background: rgba(174, 217, 224, 0.2); 
    border-color: #AED9E0; 
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(174, 217, 224, 0.15);
}

.live-link {
    text-decoration: none; 
    font-weight: 600; 
    color: #AED9E0;
    border-bottom: 1px dashed rgba(174, 217, 224, 0.5);
    transition: all 0.2s ease;
}

.live-link:hover { 
    color: #FFFFFF;
    border-bottom: 1px solid #FFFFFF;
}

/* Enhanced Glass cards */
div[data-testid="stExpander"], .stAlert {
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 20px !important;
    backdrop-filter: blur(16px) saturate(180%);
    padding: 1.5rem !important;
}

/* Clinical Contrast for Info Blocks */
.stAlert p, .stAlert div, .stAlert b, .stAlert strong {
    color: #FFFFFF !important;
    font-size: 1.15rem !important;
}

.stMarkdown {
    margin-bottom: 1.2rem;
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
graph.node('UI', 'Streamlit Frontend\nInteractive Dashboard (IST)', fillcolor='#1c1f26', fontcolor='#FFFFFF', color='#FF4B4B', penwidth='2.5')
graph.node('API', 'FastAPI Backend\nInternal Routing (UTC)', fillcolor='#1c1f26', fontcolor='#FFFFFF', color='#00D1FF', penwidth='2.5')
graph.node('HUB', 'HF Hub Dataset\nCentralized History Store', shape='folder', fillcolor='#1c1f26', fontcolor='#FFFFFF', color='#FFD700', penwidth='2.5')
graph.node('DB', 'SQLite DB\nLocal Instance Cache', shape='cylinder', fillcolor='#1c1f26', fontcolor='#FFFFFF', color='#BF5AF2', penwidth='2.5')

# Core connections
graph.edge('UI', 'API', label=' internal localhost:8000', color='#475569', fontcolor='#94A3B8')
graph.edge('API', 'DB', label=' Read/Write', color='#475569', fontcolor='#94A3B8')
graph.edge('API', 'HUB', label=' HfApi Sync (Persistent)', color='#475569', fontcolor='#94A3B8')

# Machine Learning Subgraph
with graph.subgraph(name='cluster_ml') as ml:
    ml.attr(label='Machine Learning & Inference Pipeline', style='dashed', color='#334155', fontcolor='#94A3B8')
    ml.node('ENS', 'Ensemble Engine\nSoft-Voting Aggregator', shape='diamond', fillcolor='#1c1f26', fontcolor='#FFFFFF', color='#FF9F0A', penwidth='2.5')
    ml.node('MODELS', 'Classifiers\n(RF, SVM, LogReg, NN, KNN)', fillcolor='#1c1f26', fontcolor='#FFFFFF', color='#FF9F0A', penwidth='2.5')
    ml.node('SHAP', 'SHAP Explainer\nFeature Impact Analysis', fillcolor='#1c1f26', fontcolor='#FFFFFF', color='#FF9F0A', penwidth='2.5')

# Hardware Export Subgraph
with graph.subgraph(name='cluster_edge') as edge:
    edge.attr(label='Hardware & Edge AI Export', style='dashed', color='#334155', fontcolor='#94A3B8')
    edge.node('TRANS', 'C-Code Transpiler\nINT8 Quantization', fillcolor='#1c1f26', fontcolor='#FFFFFF', color='#32D74B', penwidth='2.5')
    edge.node('HEADER', 'tinyml_model.h\nOptimized Header File', shape='note', fillcolor='#1c1f26', fontcolor='#FFFFFF', color='#32D74B', penwidth='2.5')
    edge.node('MCU', 'ESP32 / ARM Cortex-M\nMicrocontroller Node', fillcolor='#1c1f26', fontcolor='#FFFFFF', color='#32D74B', penwidth='2.5')

# Map Cross-cluster edges
graph.edge('API', 'ENS', label=' Predict', color='#CBD5E1', fontcolor='#CBD5E1')
graph.edge('ENS', 'MODELS', color='#CBD5E1')

graph.edge('API', 'SHAP', label=' Explain', color='#CBD5E1', fontcolor='#CBD5E1')
graph.edge('SHAP', 'MODELS', style='dashed', label=' Analyzes Trees', fontcolor='#CBD5E1', color='#CBD5E1')

graph.edge('API', 'TRANS', label=' Export Config', color='#CBD5E1', fontcolor='#CBD5E1')
graph.edge('TRANS', 'HEADER', label=' Scale FP32 to INT8', fontcolor='#CBD5E1', color='#CBD5E1')
graph.edge('HEADER', 'MCU', label=' Flash Firmware', color='#CBD5E1', fontcolor='#CBD5E1')

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
