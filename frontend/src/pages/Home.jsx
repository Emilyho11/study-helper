import React, { useState, useEffect } from 'react'
import UploadFile from '../components/UploadFile.jsx'

const Home = () => {
  const [file, setFile] = useState(null)
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [shownAnswers, setShownAnswers] = useState({});

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
    setQuestions(null);
    localStorage.removeItem('questions');
    setFile(null);
    setShownAnswers({});
  };

  const handleRefresh = () => {
    if (!file) return;
    handleGenerateQuestions();
  }

  const handleFileUpload = async (selectedFile) => {
    console.log('File uploaded:', selectedFile);
    setFile(selectedFile);
    setQuestions(null);
    localStorage.removeItem('questions');
    setShownAnswers({});
  };

  const handleGenerateQuestions = async () => {
    if (!file || !difficulty || !questionType) return;
    setQuestions(null);
    setLoading(true);
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

      console.log('Received questions HEHEHE:', data);
      // Parse questions as JSON
      let parsed = null;
      try {
        parsed = typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions;
      } catch (error) {
        console.error('Error parsing questions:', error);
        parsed = null;
      }
      setQuestions(parsed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const toggleAnswer = (question) => {
    setShownAnswers(prev => ({
      ...prev,
      [question]: !prev[question]
    }));
  };
  
  return (
    <div>
      <UploadFile onFileUpload={handleFileUpload} uploadedFile={file} />
      <div className="flex flex-col lg:flex-row justify-center items-center gap-4 mt-2">
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
          className="px-2 py-1 border rounded w-full max-w-xs sm:w-auto"
        >
          <option value="" disabled hidden>Select</option>
          <option value="knowledge">Knowledge Questions (facts, terms)</option>
          <option value="similar">Similar Questions</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="scenario">Application/Scenario-Based Questions</option>
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
            {Object.entries(questions).map(([question, answer], index) => (
              <div key={index} className="mb-4 border-b pb-2">
                {/* Show question and choices */}
                <div className="font-medium" style={{ whiteSpace: 'pre-line' }}>
                  {index + 1}. {question}
                  {answer && answer.choices && (
                    <ul style={{ marginTop: 8 }}>
                      {Object.entries(answer.choices).map(([choice, text]) => (
                        <li key={choice}>
                          <strong>{choice}:</strong> {text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  className="mt-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => toggleAnswer(index)}
                >
                  {shownAnswers[index] ? 'Hide Answer' : 'Show Answer'}
                </button>
                {shownAnswers[index] && (
                  <div className="mt-1 mb-4 px-4 py-2 bg-gray-100 rounded text-gray-800">
                    {/* Show only the correct answer text */}
                    {answer && answer.choices && answer.answer
                      ? (
                        <span>
                          <strong>Correct Answer:</strong> {answer.choices[answer.answer]}
                        </span>
                      )
                      : answer
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home;