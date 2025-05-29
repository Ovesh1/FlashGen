import React from "react";

function Flashcard({ question, answer }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p><strong>Q:</strong> {question}</p>
      <p><strong>A:</strong> {answer}</p>
    </div>
  );
}

export default Flashcard;
