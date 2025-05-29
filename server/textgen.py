from transformers import pipeline
import json
import nltk
from nltk.tokenize import sent_tokenize

nltk.download('punkt')

try:
    with open("offset.txt", "r") as f:
        offset = int(f.read().strip())
except:
    offset = 0

with open("input.txt", "r", encoding="utf-8") as f:
    full_text = f.read()

chunk_size = 1500
context = full_text[offset:offset + chunk_size]

if not context.strip():
    with open("offset.txt", "w") as f:
        f.write("0")
    print(json.dumps([]))
    exit()

with open("offset.txt", "w") as f:
    f.write(str(offset + chunk_size))

sentences = [s.strip() for s in sent_tokenize(context) if 40 < len(s.strip()) < 300 and '?' not in s]

if len(sentences) == 0:
    print(json.dumps([]))
    exit()

qa = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

flashcards = []
for sentence in sentences[:3]:
    question = f"What does this mean: \"{sentence}\""
    try:
        result = qa(question=question, context=context)
        flashcards.append({
            "question": question,
            "answer": result['answer']
        })
    except:
        continue

print(json.dumps(flashcards))
