from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File
import PyPDF2
from docx import Document
import io



app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/parse_file")
async def parse_file(file: UploadFile = File(...)):
    try:
        print(file)
        file_content = await file.read()
        filename = file.filename.lower() if file.filename else ""
        
        if filename.endswith('.pdf'):
            # Parse PDF file
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text_content = ""
            for idx, page in enumerate(pdf_reader.pages):
                text_content += f"Page {idx + 1}\n"
                text_content += page.extract_text() + "\n"
            return {"success": True, "data": {"text_content": text_content.strip()}}
            
        elif filename.endswith('.docx'):
            # Parse DOCX file
            docx_file = io.BytesIO(file_content)
            doc = Document(docx_file)
            text_content = ""
            for paragraph in doc.paragraphs:
                text_content += paragraph.text + "\n"
            return {"success": True, "data": {"text_content": text_content.strip()}}
            
        elif filename.endswith(('.txt', '.md')):
            # Parse plain text files
            text_content = file_content.decode('utf-8')
            return {"success": True, "data": {"text_content": text_content}}
            
        else:
            return {"success": False, "error": f"Unsupported file type. Supported formats: PDF, DOCX, TXT, MD"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}



