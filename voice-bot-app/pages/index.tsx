import { useState, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported. Please use Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onerror = () => alert('Voice input error. Try again.');
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
    recognitionRef.current = recognition;
  };

  const speak = (text: string) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    synth.speak(utter);
  };

  const sendMessage = async (msg?: string) => {
    const message = msg || input.trim();
    if (!message) return;
    setMessages(prev => [...prev, "🧑: " + message]);
    setInput('');
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    const reply = data.reply || "Sorry, something went wrong.";
    setMessages(prev => [...prev, "🤖: " + reply]);
    speak(reply);
  };

  return (
    <main style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>🎙️ Voice ChatGPT Interview Bot</h1>
      <button onClick={handleVoiceInput} disabled={listening}>
        {listening ? 'Listening...' : '🎤 Speak'}
      </button>
      <br /><br />
      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Or type..." rows={3} />
      <br />
      <button onClick={() => sendMessage()}>Send</button>
      <div style={{ marginTop: 20 }}>
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </main>
  );
}