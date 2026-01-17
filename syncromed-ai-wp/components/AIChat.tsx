import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const AIChat = ({ contextPrompt, placeholder }: { contextPrompt: string, placeholder: string }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
        const apiKey = process.env.API_KEY || '';
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `System Context: ${contextPrompt}. \n\n User Query: ${userMsg}`,
        });
        
        setHistory(prev => [...prev, { role: 'model', text: response.text || "I couldn't generate a response." }]);
    } catch (e) {
        setHistory(prev => [...prev, { role: 'model', text: "AI Service is currently offline. Please try again later." }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col h-[400px]">
      <div className="flex items-center space-x-2 mb-4 border-b border-white/10 pb-2">
        <Bot className="text-cyan-400" />
        <h3 className="font-semibold text-white">Gemini Medical Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2">
        {history.length === 0 && (
            <p className="text-gray-400 text-sm text-center mt-10">Ask me anything about your health or hospital procedures.</p>
        )}
        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-200'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-gray-500 animate-pulse">Gemini is thinking...</div>}
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={placeholder}
          className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
        />
        <button 
            onClick={handleSend}
            disabled={loading}
            className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors text-white disabled:opacity-50">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
