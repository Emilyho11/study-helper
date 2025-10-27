import React, { useState } from 'react'
import UploadFile from '../components/UploadFile.jsx'

const Home = () => {
  const [file, setFile] = useState(null)
  const [textContent, setTextContent] = useState('')
  
  const handleFileUpload = (selectedFile) => {
    console.log('File uploaded:', selectedFile)
    setFile(selectedFile)

    // If it's a .txt file, read its contents
    if (selectedFile && (selectedFile.type === 'text/plain')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const contents = e.target.result
        console.log('File contents:', contents)
        setTextContent(contents)
      }
      reader.readAsText(selectedFile)
    }
  }

  return (
    <div>
      <div className='text-2xl font-semibold text-center mt-4'>Welcome to Study Helper</div>
      <UploadFile onFileUpload={handleFileUpload} />
      {file && (
        <div className="m-4 p-4 border rounded border-gray-300">
          <h3>Uploaded File:</h3>
          <p>Name: {file.name}</p>
          {file.type.startsWith('image/') && (
            <img
              src={URL.createObjectURL(file)}
              alt="Uploaded"
              className="max-w-xs mt-2"
            />
          )}
          {file.type === 'application/pdf' && (
            <embed
              src={URL.createObjectURL(file)}
              type="application/pdf"
              width="400"
              height="500"
            />
          )}
          {file.type === 'text/plain' && (
            <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
              <h4 className="font-semibold mb-2">Text File Contents:</h4>
              <pre>{textContent}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Home