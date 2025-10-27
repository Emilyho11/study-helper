import React from 'react'

const UploadFile = ({ onFileUpload }) => {
  const handleUpload = (e) => {
    if (onFileUpload) {
      onFileUpload(e.target.files[0])
    }
  }

  return (
    <div className="m-4 p-4 border-dashed border-2 border-gray-300 rounded">
      <input
        type="file"
        onChange={handleUpload}
      />
    </div>
  )
}

export default UploadFile