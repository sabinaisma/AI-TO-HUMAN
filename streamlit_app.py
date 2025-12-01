import os
import pdfminer.high_level
import docx
import streamlit as st
from google import genai

# Gemini API key will be set in Streamlit Cloud Secrets
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def extract_text(file_path):
    if file_path.endswith(".pdf"):
        return pdfminer.high_level.extract_text(file_path)
    elif file_path.endswith(".docx"):
        doc = docx.Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs])
    else:
        return ""

def get_ai_percentage(text):
    prompt = f"Estimate AI content 0-100%:\n{text}"
    resp = genai.chat.create(model="gemini-1.5-flash",
        messages=[{"role":"user","content":prompt}])
    return resp.last.message.content

def convert_to_human(text):
    prompt = f"Rewrite this text to look like a real student wrote it:\n{text}"
    resp = genai.chat.create(model="gemini-1.5-flash",
        messages=[{"role":"user","content":prompt}])
    return resp.last.message.content

st.title("AI Detector & Humanizer")
uploaded_file = st.file_uploader("Upload PDF or DOCX", type=["pdf","docx"])
if uploaded_file:
    with open("temp_file","wb") as f: f.write(uploaded_file.getbuffer())
    text = extract_text("temp_file")
    st.subheader("AI Detection")
    st.write(get_ai_percentage(text))
    st.subheader("Human-like Version")
    st.text_area("Output Text", convert_to_human(text), height=400)
