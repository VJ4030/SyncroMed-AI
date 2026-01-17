import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, CreditCard, Clock, Activity, MessageSquare, Phone, Mail, Send, User, Download } from 'lucide-react';
import { AIChat } from '../components/AIChat';
import { GeminiService } from '../services/geminiService';

export const PatientDashboard = () => {
  const { currentUser, patients, doctors, messages, sendMessage, activeTab, setActiveTab } = useApp();
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState('');

  const me = patients.find(p => p.email === currentUser?.email);
  const myDoctor = doctors.find(d => d.id === me?.assignedDoctorId);
  const showMessages = activeTab === 'MESSAGES';

  const handleExplain = async (rx: string) => {
    setExplaining(true);
    const text = await GeminiService.explainPrescription(rx);
    setExplanation(text);
    setExplaining(false);
  };

  const handleSendMsg = () => {
      if (msgInput.trim() && myDoctor) {
          sendMessage(myDoctor.id, msgInput);
          setMsgInput('');
      }
  };

  const handlePayBill = () => {
      if (!me) return;
      
      // Simulate Payment
      alert("Payment Successful! Downloading receipt...");

      // Generate Receipt text
      const receiptContent = `
SYNCROMED AI HOSPITAL - OFFICIAL RECEIPT
----------------------------------------
Date: ${new Date().toLocaleString()}
Receipt ID: #${Math.floor(Math.random() * 1000000)}

Patient Details:
Name: ${me.name}
ID: ${me.id}
Email: ${me.email}

----------------------------------------
DESCRIPTION                  AMOUNT
----------------------------------------
Hospital Services           ₹${me.pendingBills}
Consultation Fees           Included
Pharmacy Charges            Included
----------------------------------------
TOTAL PAID:                 ₹${me.pendingBills}
----------------------------------------
Status: PAID
Payment Mode: Online (Demo)

Thank you for trusting SyncroMed AI.
      `;

      // Create downloadable blob
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt_${me.id}_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (!me) return <div>Loading...</div>;

  // --- Messages View ---
  if (showMessages) {
      const myMessages = messages.filter(m => 
          (m.senderId === me.id && m.receiverId === myDoctor?.id) || 
          (m.senderId === myDoctor?.id && m.receiverId === me.id)
      );

      return (
          <div className="h-full flex flex-col glass-card rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-full">
                          <MessageSquare className="text-blue-400" size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Chat with Dr. {myDoctor?.name || 'Unassigned'}</h2>
                        <p className="text-xs text-green-400">Online</p>
                      </div>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20">
                  {myMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                          <MessageSquare size={40} className="opacity-20" />
                          <p>Start a conversation with your doctor.</p>
                      </div>
                  ) : (
                      myMessages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.senderId === me.id ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                                  msg.senderId === me.id 
                                  ? 'bg-blue-600 text-white rounded-br-none' 
                                  : 'bg-white/10 text-gray-200 rounded-bl-none'
                              }`}>
                                  <p className="text-sm">{msg.content}</p>
                                  <p className="text-[10px] opacity-50 mt-1 text-right">{msg.timestamp}</p>
                              </div>
                          </div>
                      ))
                  )}
              </div>

              <div className="p-4 bg-white/5 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                      <input 
                          value={msgInput}
                          onChange={e => setMsgInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSendMsg()}
                          placeholder={myDoctor ? "Type your message..." : "No doctor assigned"}
                          disabled={!myDoctor}
                          className="flex-1 glass-input p-3 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                      <button 
                          onClick={handleSendMsg}
                          disabled={!myDoctor}
                          className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all disabled:opacity-50"
                      >
                          <Send size={20} />
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- Dashboard View ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Health & History */}
      <div className="lg:col-span-2 space-y-6">
        {/* Status Card */}
        <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border-cyan-500/30">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Hello, {me.name}</h2>
              <p className="text-blue-200">Patient ID: <span className="font-mono">{me.id.toUpperCase()}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Current Status</p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <span className={`w-3 h-3 rounded-full ${me.status === 'Critical' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                <span className="font-semibold text-white">{me.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Doctor Card */}
        <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <User className="text-purple-400" />
                <span>Assigned Doctor</span>
            </h3>
            {myDoctor ? (
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-4">
                        <img src={myDoctor.avatar} className="w-16 h-16 rounded-full border-2 border-purple-500/50" alt="Doctor" />
                        <div>
                            <h4 className="text-lg font-bold text-white">{myDoctor.name}</h4>
                            <p className="text-purple-300 text-sm">{myDoctor.specialty}</p>
                            <div className="flex space-x-4 mt-2 text-xs text-gray-400">
                                <span className="flex items-center space-x-1"><Mail size={12}/> <span>{myDoctor.email}</span></span>
                                <span className="flex items-center space-x-1"><Phone size={12}/> <span>{myDoctor.phone || 'N/A'}</span></span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setActiveTab('MESSAGES')}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                        <MessageSquare size={16} />
                        <span>Contact</span>
                    </button>
                </div>
            ) : (
                <div className="text-center py-6 text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                    No doctor assigned yet. Please contact reception.
                </div>
            )}
        </div>

        {/* Medical History Timeline */}
        <div className="glass-card p-6 rounded-2xl">
           <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
             <FileText className="text-cyan-400" />
             <span>Medical History</span>
           </h3>
           <div className="space-y-6">
             {me.history.length === 0 ? (
                 <p className="text-gray-500 italic">No medical records found.</p>
             ) : me.history.map((record) => (
               <div key={record.id} className="relative pl-6 border-l-2 border-white/10 pb-6 last:pb-0">
                 <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-cyan-600 border-2 border-gray-900"></div>
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                   <div className="flex justify-between mb-2">
                     <span className="text-sm text-cyan-300 font-mono">{record.date}</span>
                     <span className="text-xs text-gray-400">ID: {record.id}</span>
                   </div>
                   <h4 className="text-lg font-semibold text-white mb-1">{record.diagnosis}</h4>
                   <p className="text-sm text-gray-300 mb-3">Symptoms: {record.symptoms}</p>
                   
                   <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Prescription</p>
                     <p className="text-sm text-green-300 font-mono">{record.prescription}</p>
                     <button 
                        onClick={() => handleExplain(record.prescription)}
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline flex items-center space-x-1"
                     >
                         <span>AI Explain this</span>
                         {explaining && <span className="animate-spin">⌛</span>}
                     </button>
                   </div>
                   {explanation && (
                       <div className="mt-3 p-3 bg-indigo-900/30 border border-indigo-500/30 rounded-lg text-sm text-indigo-200">
                           <span className="font-bold block mb-1">Gemini Explanation:</span>
                           {explanation}
                           <button onClick={() => setExplanation(null)} className="block mt-2 text-xs text-indigo-400 hover:text-white">Close</button>
                       </div>
                   )}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Right Column: Bills & AI Chat */}
      <div className="space-y-6">
        {/* Pending Bills */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <CreditCard className="text-yellow-400" />
            <span>Outstanding Bills</span>
          </h3>
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm mb-2">Total Due</p>
            <p className="text-4xl font-bold text-white mb-6">₹{me.pendingBills}</p>
            <button 
                onClick={handlePayBill}
                disabled={me.pendingBills === 0}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center space-x-2"
            >
              <Download size={18} />
              <span>{me.pendingBills > 0 ? "Pay & Download Receipt" : "No Dues"}</span>
            </button>
          </div>
        </div>

        {/* AI Assistant */}
        <AIChat 
            contextPrompt={`You are a helpful hospital assistant for patient ${me.name}. You have access to generic medical knowledge. Do not give specific diagnosis. Be empathetic.`} 
            placeholder="Ask about your health or bills..." 
        />
      </div>
    </div>
  );
};
