import React, { useState, useEffect } from 'react'
import UploadFile from '../components/UploadFile.jsx'

const Home = () => {
  const [file, setFile] = useState(null)
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  const [questionType, setQuestionType] = useState('');

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
    handleGenerateQuestions();
  }

  const handleFileUpload = async (selectedFile) => {
    console.log('File uploaded:', selectedFile);
    setFile(selectedFile);
    setQuestions('');
    localStorage.removeItem('questions');
  }

  const handleGenerateQuestions = async () => {
    if (!file || !difficulty || !questionType) return;
    setQuestions('');
    setQuestions('')
    setLoading(true)
    localStorage.removeItem('questions');
    const formData = new FormData()
    formData.append('file', file);
    formData.append('difficulty', difficulty);
    formData.append('questionType', questionType);

    try {
      const response = await fetch('/api/analyze', {
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
    } finally {
      setLoading(false)
    }
  }

  const splitQuestions = (text) => {
    if (!text) return '';
    const regex = /^\s*answers?\s*$/i;
    const lines = text.split('\n');
    const idx = lines.findIndex(line => regex.test(line.trim()));
    if (idx === -1) return text;
    // Preserve all original formatting (including empty lines)
    return lines.slice(0, idx).join('\n');
  };

  const splitAnswers = (text) => {
    if (!text) return '';
    const regex = /^\s*answers?\s*$/i;
    const lines = text.split('\n');
    const idx = lines.findIndex(line => regex.test(line.trim()));
    if (idx === -1) return '';
    const answers = lines.slice(idx + 1).filter(Boolean);
    return answers.join('\n');
  };

  const questionsParsed = splitQuestions(questions);
  const answersParsed = splitAnswers(questions);

  return (
    <div>
      <UploadFile onFileUpload={handleFileUpload} uploadedFile={file} />
      <div className="flex justify-center items-center gap-4 mt-2">
        <p>Select Difficulty:</p>
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="" disabled hidden>Select</option>
          <option value="easy">Easy</option>
          <option value="hard">Hard</option>
        </select>
        <p>Select Question Type:</p>
        <select
          value={questionType}
          onChange={e => setQuestionType(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="" disabled hidden>Select</option>
          <option value="knowledge">Testing Understanding (facts, terms, memorization)</option>
          <option value="scenario">Similar Questions (generate new questions like those in the file)</option>
          <option value="multiple-choice">Multiple Choice (choose the correct answer about the material)</option>
        </select>
        <button
          className={`px-2 py-1 rounded transition-colors duration-200 ${
            !questions
              ? 'text-white bg-green-700 hover:bg-green-600'
              : 'text-white bg-gray-500 hover:bg-gray-400'
          }`}
          onClick={!questions ? handleGenerateQuestions : handleRefresh}
          disabled={!file || !difficulty || !questionType || loading}
        >
          {!questions ? 'Generate Questions' : 'Generate New Questions'}
        </button>
      </div>
      {loading && (
        <div className="m-4 p-4 text-center text-lg text-blue-600">
          Generating questions, please wait...
        </div>
      )}

      {questions && !loading && (
        <div className="relative m-4 p-10 border rounded border-gray-300 bg-white shadow">
          <button
            className='absolute top-0 right-2 px-2 py-1 text-3xl text-red-600 rounded hover:text-red-300'
            onClick={handleClear}
            disabled={!questions}
          >
            x
          </button>
          <h3 className='mb-2 text-xl font-semibold text-[#2c4b7d]'>GENERATED EXAM QUESTIONS:</h3>
          <div className="mb-4 whitespace-pre-wrap font-sans px-4 text-[#2c4b7d]">
            {questionsParsed}
          </div>
          {answersParsed && (
            <>
              <hr className="my-4" />
              <h4 className="text-lg font-semibold text-[#2c4b7d] mb-2">Answers:</h4>
              <div className="whitespace-pre-wrap font-sans px-4 text-[#2c4b7d]">
                {answersParsed}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Home;