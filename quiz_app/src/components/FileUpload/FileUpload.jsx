import React, { useState, useRef } from 'react';

export const FileUpload = ({ onFileSelect, acceptedTypes = ".pdf,.txt,.docx" }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file) => {
    setUploadedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (onFileSelect) {
      onFileSelect(null);
    }
    inputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form 
        className={`
          border-2 border-dashed rounded-xl p-6 sm:p-8 text-center bg-gray-50 
          transition-all duration-300 cursor-pointer min-h-[180px] sm:min-h-[200px] 
          flex items-center justify-center
          ${dragActive 
            ? 'border-green-500 bg-green-50 border-solid transform scale-102 sm:scale-105' 
            : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes}
          onChange={handleChange}
        />
        
        {!uploadedFile ? (
          <div className="flex flex-col items-center gap-4">
            <div className={`text-gray-500 mb-2 transition-colors duration-300 ${
              dragActive ? 'text-green-500' : 'group-hover:text-green-500'
            }`}>
              <svg width="40" height="40" className="sm:w-12 sm:h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 15L12 12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 m-0">
              {dragActive ? "Drop your file here" : "Upload your document"}
            </h3>
            <p className="text-gray-500 m-0 text-sm">
              Drag and drop your file here, or click to browse
            </p>
            <button
              type="button"
              onClick={onButtonClick}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors duration-200 text-sm hover:bg-green-600"
            >
              Browse Files
            </button>
            <p className="text-gray-400 text-xs m-0">
              Supported formats: PDF, TXT, DOCX
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 w-full">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-green-500 flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium text-gray-700 m-0 text-sm">{uploadedFile.name}</p>
                <p className="text-gray-500 text-xs m-0">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="bg-transparent border-none text-red-500 cursor-pointer p-2 rounded flex items-center justify-center transition-colors duration-200 hover:bg-red-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}; 