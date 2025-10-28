import React, { useState } from 'react'
import UploadFile from '../components/UploadFile.jsx'

const Home = () => {
  const [file, setFile] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [questions, setQuestions] = useState('')
  
  const handleFileUpload = async (selectedFile) => {
    console.log('File uploaded:', selectedFile)
    setFile(selectedFile)
    setQuestions('')
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error('Failed to analyze document')
      }
      const data = await response.json()
      setQuestions(data.questions)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className='text-2xl font-semibold text-center mt-4'>Welcome to Study Helper</div>
      <UploadFile onFileUpload={handleFileUpload} />
      {questions && (
        <div className="m-4 p-4 border rounded border-gray-300">
          <h3>Generated Exam Questions:</h3>
          <pre>{questions}</pre>
        </div>
      )}
    </div>
  )
}

export default Home