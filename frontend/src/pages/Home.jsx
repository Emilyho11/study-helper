import React, { useState, useEffect } from 'react'
import UploadFile from '../components/UploadFile.jsx'

const Home = () => {
  const [file, setFile] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [questions, setQuestions] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('questions');
    if (saved) {
      setQuestions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (questions) {
      localStorage.setItem('questions', JSON.stringify(questions));
    }
  }, [questions]);

  const handleClear = () => {
    setQuestions('')
    localStorage.removeItem('questions');
    setFile(null);
  };

  const handleRefresh = () => {
    if (!file) return;
    handleFileUpload(file);
  }

  const handleFileUpload = async (selectedFile) => {
    console.log('File uploaded:', selectedFile)
    setFile(selectedFile)
    setQuestions('')
    localStorage.removeItem('questions');
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
        <div className="flex justify-center space-x-4 mt-4">
          <button
            className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
            onClick={handleRefresh}
            disabled={!file}
            >
            Generate new questions
          </button>
          <button
            className='px-4 py-2 bg-red-200 rounded hover:bg-red-300'
            onClick={handleClear}
            disabled={!questions}
          >
            Clear
          </button>
        </div>
      )}

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