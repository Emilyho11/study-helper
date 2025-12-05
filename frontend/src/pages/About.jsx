import React from 'react'

const About = () => {
  return (
    <div>
      <div className="m-8 p-6 border rounded border-gray-300 bg-white shadow text-[#2c4b7d]">
        <h2 className="text-2xl font-bold mb-4 text-[#2c4b7d]">About Study Helper</h2>
        <p className="mb-4 text-[#2c4b7d]">
          Study Helper is an AI-powered tool designed to help you in generating practice questions tailored to your classes. By uploading any type of file (can be your professor's lecture notes or your own), you can specify the difficulty level and the type of questions you want it to generate.
          This app can create different types of questions based on your preferences. You can select: questions that test your understanding of the material, questions similar to those found in your notes, or multiple-choice questions.
        </p>
        <h3 className="text-xl font-semibold mb-2">Features:</h3>
        <ul className="list-disc list-inside mb-4">
          <li>Upload study material (PDFs, images, etc.).</li>
          <li>Select the difficulty level for the generated questions.</li>
          <li>Choose the question type: testing understanding, similar questions, or multiple choice.</li>
          <li>Generates questions for personalized notes.</li>
          <li>Re-generate new questions if needed.</li>
        </ul>
        <h3 className="text-xl font-semibold mb-2">How to Use:</h3>
        <ol className="list-decimal list-inside mb-4">
          <li>Navigate to the Home page.</li>
          <li>Upload your notes. Make sure the file is under 2MB. If it isn't, please use a file compression tool to reduce the size. (You can find a lot online).</li>
          <li>Select the desired difficulty level and question type.</li>
          <li>Click on "Generate Questions" to receive your customized practice questions.</li>
          <li>Click on "Generate New Questions" to receive new practice questions if you want more.</li>
        </ol>
        <p>
          The goal of Study Helper is to make studying more efficient and effective. It delivers personalized practice that aligns with the material covered in your classes and can generate exercises similar to those your professors might ask.
          Whether you are preparing for exams or looking to reinforce your learning, this app is here to help.
        </p>
      </div>
    </div>
  )
}

export default About;
