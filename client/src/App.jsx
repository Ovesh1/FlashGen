import React from "react";
import { useState } from "react";
import axios from "axios";
import Flashcard from "./components/Flashcard";

function App() {
  const [file, setFile] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadPDF = async () => {
    if (!file) return alert("Please select a PDF");
    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await axios.post("http://localhost:5000/upload", formData);
      if (res.data.flashcards.length === 0) {
        alert("✅ Flashcards are already generated for the full file. Offset has reset.");
      } else {
        setFlashcards(prev => [...prev, ...res.data.flashcards]);
      }
    } catch (err) {
      alert("❌ Failed to upload PDF");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">📘 FlashGen</h1>
      <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} />
      <button onClick={uploadPDF} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded">
        Generate Flashcards
      </button>

      {loading && <p className="mt-4">Processing...</p>}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {flashcards.map((card, i) => (
          <Flashcard key={i} question={card.question} answer={card.answer} />
        ))}
      </div>
    </div>
  );
}

export default App;
