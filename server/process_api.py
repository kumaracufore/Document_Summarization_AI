from fastapi import FastAPI, File, UploadFile, Form, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import openai
import PyPDF2
import shutil
from typing import List
import json

app = FastAPI()

# === Configuration ===
BASE_PATHS = {
    "uploads": "uploads",
    "summaries": "summaries",
    "pending": "uploads/{section}/pending",
    "accepted": "uploads/{section}/accepted",
    "rejected": "uploads/{section}/rejected",
    "session": "uploads/session.json"
}

api_key = ""
# === CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Utility: Extract PDF Text ===
def extract_text_from_pdf(pdf_path, char_limit=None):
    text = ""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            if page.extract_text():
                text += page.extract_text()
        if char_limit:
            text = text[:char_limit]
    return text

# === Utility: Generate Summary ===
def get_summary_and_confidence(text):
    openai.api_key = api_key

    ocr_garbage_indicators = [
        len(text) < 200,
        text.count('?') > 10,
        any(c in text for c in ['�', '¤', '�']),
    ]
    is_possibly_ocr_garbage = any(ocr_garbage_indicators)

    if is_possibly_ocr_garbage:
        prompt = f"""

You are an expert in document analysis. The following document appears to be poorly recognized (likely from OCR). Based on whatever information is extractable, provide a **very brief summary** (2–4 lines) that could help a human decide whether to approve or reject the document.

Document Content:
{text}

Please respond in this format:
Brief Summary:
<summary here>
Confidence Score: <1 to 10>"""
    else:
        prompt = f"""
You are an expert document analyst. Read the following document and produce a **detailed summary** approximately 2 pages long (around 1000–1200 words). Start with what the document is and what it is used for, then give a full content summary.

**Do not include any step-by-step instructions or numbered procedures. Focus only on the purpose, structure.**

Also, rate your confidence in understanding and summarizing the content on a scale of 1 to 10.

Document Content:
{text}

Please respond in this format:
Summary:
<your summary here>
Confidence Score: <1 to 10>
"""

    response = openai.chat.completions.create(
        model="o4-mini",
        messages=[
            {"role": "system", "content": "You are a highly accurate and concise summarization assistant."},
            {"role": "user", "content": prompt}
        ],
    )
    return response.choices[0].message.content

# === Session Management ===
def load_session():
    if os.path.exists(BASE_PATHS["session"]):
        with open(BASE_PATHS["session"], "r") as f:
            return json.load(f)
    return {}

def save_session(data):
    with open(BASE_PATHS["session"], "w") as f:
        json.dump(data, f, indent=2)

# === Upload Endpoint ===
@app.post("/upload")
async def upload_and_process(file: UploadFile = File(...), section: str = Form("general")):
    pending_folder = BASE_PATHS["pending"].format(section=section)
    summary_folder = os.path.join(BASE_PATHS["summaries"], section)

    os.makedirs(pending_folder, exist_ok=True)
    os.makedirs(summary_folder, exist_ok=True)

    filename = file.filename or "uploaded_file.pdf"
    file_path = os.path.join(pending_folder, filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_pdf(file_path)
    summary = get_summary_and_confidence(text)

    summary_path = os.path.join(summary_folder, f"{filename}.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(summary or "")

    session = load_session()
    session[filename] = {"section": section, "status": 0}
    save_session(session)

    return {"status": "success", "message": "Uploaded successfully"}

# === Updated: List Files Based on View (pending, accepted, rejected) ===
@app.get("/files")
def list_uploaded_files(section: str = Query(...), view: str = Query("pending")):
    summary_folder = os.path.join(BASE_PATHS["summaries"], section)
    session = load_session()
    result = []

    status_map = {"pending": 0, "accepted": 1, "rejected": 2}
    target_status = status_map.get(view, 0)

    for fname, data in session.items():
        if data["section"] == section and data["status"] == target_status:
            folder_key = view
            filepath = os.path.join(BASE_PATHS[folder_key].format(section=section), fname)
            if os.path.exists(filepath):
                summary_path = os.path.join(summary_folder, f"{fname}.txt")
                try:
                    summary = open(summary_path, "r", encoding="utf-8").read()
                except Exception as e:
                    summary = f"Failed to read summary: {str(e)}"
                result.append({"filename": fname, "summary": summary, "status": target_status})

    return {"files": result}

# === Status Update Helper ===
def move_and_update_status(filename, section, new_status):
    session = load_session()
    if filename not in session:
        return {"status": "error", "message": "File not found in session"}

    current_status = session[filename]["status"]
    old_folder = BASE_PATHS[["pending", "accepted", "rejected"][current_status]].format(section=section)
    new_folder = BASE_PATHS[["pending", "accepted", "rejected"][new_status]].format(section=section)

    os.makedirs(new_folder, exist_ok=True)

    old_path = os.path.join(old_folder, filename)
    new_path = os.path.join(new_folder, filename)

    if not os.path.exists(old_path):
        return {"status": "error", "message": "File not found in expected location"}

    shutil.move(old_path, new_path)
    session[filename]["status"] = new_status
    save_session(session)
    return {"status": "success"}

# === Accept ===
@app.post("/accept")
def accept_file(section: str = Form(...), filename: str = Form(...)):
    return move_and_update_status(filename, section, 1)

# === Reject ===
@app.post("/reject")
def reject_file(section: str = Form(...), filename: str = Form(...)):
    return move_and_update_status(filename, section, 2)

# === Accept it back ===
@app.post("/accept-back")
def accept_back_file(section: str = Form(...), filename: str = Form(...)):
    return move_and_update_status(filename, section, 1)
