import React, { useRef, useState } from 'react';

const UploadFile = ({ onFileUpload, uploadedFile }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current.click();
  }


  return (
    <div
      className={`m-4 p-6 border-2 rounded-lg flex flex-col items-center justify-center transition-colors duration-200 ${
        dragActive ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300 bg-white'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleUpload}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        className="mt-4 px-4 py-2 bg-[#2c4b7d] text-white rounded hover:bg-[#6086c0] transition-colors duration-200"
      >
        Select File
      </button>
      <div className='mt-2 text-gray-500 text-sm'>
        or drag and drop your file here
      </div>
      {uploadedFile && (
        <div className="text-center text-sm text-gray-700 mt-2">
          Uploaded file: <span className="font-semibold">{uploadedFile.name}</span>
        </div>
      )}
    </div>
  )
}

export default UploadFile