import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, User, FileText, Activity, Save, Plus, Clock, MessageSquare, Send, ClipboardPlus, Search, Check, X } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { Patient, Doctor } from '../types';

export const DoctorDashboard = () => {
  const { currentUser, patients, addMedicalRecord, activeTab, messages, sendMessage, sendPharmacyRequest, pharmacyRequests } = useApp();
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [consultation, setConsultation] = useState({ symptoms: '', diagnosis: '', prescription: '', notes: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [selectedChatPatientId, setSelectedChatPatientId] = useState<string | null>(null);
  const [medRequestName, setMedRequestName] = useState('');

  // Filter only assigned patients
  const myPatients = patients.filter(p => p.assignedDoctorId === currentUser?.id);
  const isScheduleView = activeTab === 'SCHEDULE';
  const isMessagesView = activeTab === 'MESSAGES';
  const isPharmacyView = activeTab === 'PHARMACY';

  const handleAIAnalysis = async () => {
    if (!consultation.symptoms || !activePatient?.vitals) return;
    setAiLoading(true);
    const analysis = await GeminiService.analyzeSymptoms(
        consultation.symptoms, 
        JSON.stringify(activePatient.vitals)
    );
    setConsultation(prev => ({ ...prev, diagnosis: analysis }));
    setAiLoading(false);
  };

  const handleSaveRecord = () => {
      if(!activePatient) return;
      const record = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          doctorId: currentUser?.id,
          ...consultation
      };
      addMedicalRecord(activePatient.id, record);
      alert("Consultation saved & Patient History updated.");
      setConsultation({ symptoms: '', diagnosis: '', prescription: '', notes: '' });
      setActivePatient(null);
  };

  const handleSendMsg = () => {
      if (msgInput.trim() && selectedChatPatientId) {
          sendMessage(selectedChatPatientId, msgInput);
          setMsgInput('');
      }
  };

  const handleMedRequest = () => {
      if (medRequestName.trim()) {
          sendPharmacyRequest(medRequestName);
          setMedRequestName('');
          alert("Request sent to Pharmacy.");
      }
  };

  // --- Pharmacy View ---
  if (isPharmacyView) {
      const myRequests = pharmacyRequests.filter(r => r.doctorId === currentUser?.id);
      return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
              {/* Request Form */}
              <div className="glass-card p-6 rounded-2xl flex flex-col h-fit">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                      <ClipboardPlus className="text-blue-400" />
                      <span>Request Medicine from Pharmacy</span>
                  </h3>
                  <div className="space-y-4">
                      <p className="text-sm text-gray-400">Ask the pharmacist to check availability for a specific medicine.</p>
                      <input 
                          type="text" 
                          placeholder="Medicine Name (e.g. Doxycycline 100mg)"
                          className="w-full glass-input p-3 rounded-xl focus:border-blue-500 outline-none"
                          value={medRequestName}
                          onChange={e => setMedRequestName(e.target.value)}
                      />
                      <button 
                          onClick={handleMedRequest}
                          disabled={!medRequestName}
                          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
                      >
                          Send Request
                      </button>
                  </div>
              </div>

              {/* Request Status List */}
              <div className="glass-card p-6 rounded-2xl flex flex-col overflow-hidden">
                  <h3 className="text-xl font-bold text-white mb-6">Request History</h3>
                  <div className="overflow-y-auto flex-1 custom-scrollbar space-y-3">
                      {myRequests.length === 0 ? (
                          <p className="text-gray-500 text-center mt-10">No requests made yet.</p>
                      ) : myRequests.map(req => (
                          <div key={req.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center">
                              <div>
                                  <p className="font-bold text-white">{req.medicineName}</p>
                                  <p className="text-xs text-gray-400">{req.timestamp}</p>
                              </div>
                              <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                                  req.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' :
                                  req.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-500 border border-green-500/50' :
                                  'bg-red-500/20 text-red-500 border border-red-500/50'
                              }`}>
                                  {req.status === 'PENDING' && <Clock size={12} />}
                                  {req.status === 'AVAILABLE' && <Check size={12} />}
                                  {req.status === 'UNAVAILABLE' && <X size={12} />}
                                  <span>{req.status}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  // --- Messages View ---
  if (isMessagesView) {
      const chatPatient = patients.find(p => p.id === selectedChatPatientId);
      const currentChatMessages = messages.filter(m => 
          (m.senderId === currentUser?.id && m.receiverId === selectedChatPatientId) ||
          (m.senderId === selectedChatPatientId && m.receiverId === currentUser?.id)
      );

      return (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
              {/* Chat List */}
              <div className="col-span-4 glass-card rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/10 bg-white/5">
                      <h3 className="font-bold text-white flex items-center space-x-2">
                          <MessageSquare size={18} className="text-blue-400"/>
                          <span>Recent Messages</span>
                      </h3>
                  </div>
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                      {myPatients.length === 0 ? (
                           <p className="text-center text-gray-500 mt-10 text-sm">No patients assigned.</p>
                      ) : myPatients.map(p => {
                          const lastMsg = messages
                            .filter(m => m.senderId === p.id || m.receiverId === p.id)
                            .pop();
                          return (
                            <div 
                                key={p.id} 
                                onClick={() => setSelectedChatPatientId(p.id)}
                                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedChatPatientId === p.id ? 'bg-blue-600/20' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-white">{p.name}</h4>
                                    <span className="text-[10px] text-gray-500">{lastMsg?.timestamp}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 truncate">
                                    {lastMsg ? lastMsg.content : 'No messages yet'}
                                </p>
                            </div>
                          );
                      })}
                  </div>
              </div>

              {/* Chat Area */}
              <div className="col-span-8 glass-card rounded-2xl overflow-hidden flex flex-col">
                  {chatPatient ? (
                      <>
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center space-x-3">
                             <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold">
                                 {chatPatient.name.charAt(0)}
                             </div>
                             <div>
                                 <h3 className="font-bold text-white">{chatPatient.name}</h3>
                                 <p className="text-xs text-gray-400">Patient ID: {chatPatient.id}</p>
                             </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20">
                            {currentChatMessages.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500">No conversation yet. Say Hi!</div>
                            ) : (
                                currentChatMessages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                                            msg.senderId === currentUser?.id 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-white/10 text-gray-200 rounded-bl-none'
                                        }`}>
                                            <p>{msg.content}</p>
                                            <p className="text-[10px] opacity-50 mt-1 text-right">{msg.timestamp}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center space-x-3">
                            <input 
                                value={msgInput}
                                onChange={e => setMsgInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMsg()}
                                placeholder="Type a message to patient..."
                                className="flex-1 glass-input p-3 rounded-xl focus:outline-none focus:border-blue-500"
                            />
                            <button 
                                onClick={handleSendMsg}
                                className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                      </>
                  ) : (
                      <div className="h-full flex items-center justify-center text-gray-500 flex-col space-y-4">
                          <MessageSquare size={48} className="opacity-20" />
                          <p>Select a patient to view messages</p>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // --- Schedule Grid View ---
  if (isScheduleView) {
      const timeSlots = Array.from({length: 12}, (_, i) => i + 8); // 8 AM to 7 PM
      return (
          <div className="h-full space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Calendar className="text-cyan-400" />
                  <span>Weekly Schedule ({currentUser?.name})</span>
              </h2>
              <div className="glass-card p-6 rounded-2xl h-[calc(100vh-12rem)] overflow-auto custom-scrollbar">
                  <div className="grid grid-cols-6 gap-4 min-w-[800px]">
                      {/* Header */}
                      <div className="col-span-1"></div>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                          <div key={day} className="text-center font-bold text-blue-300 pb-4 border-b border-white/10 uppercase tracking-wider">{day}</div>
                      ))}
                      
                      {/* Slots */}
                      {timeSlots.map(hour => (
                          <React.Fragment key={hour}>
                              <div className="text-right pr-4 text-gray-400 text-sm font-mono -mt-2">
                                  {hour}:00
                              </div>
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
                                  // Logic: Check if the CURRENT user's schedule contains this hour
                                  // The mock data formats are like "09:00" or "14:00"
                                  const hourStr = `${hour < 10 ? '0' + hour : hour}:00`;
                                  const isWorkHour = (currentUser as Doctor).schedule?.includes(hourStr);
                                  
                                  // Simple logic to distribute "work days" for visualization based on doctor ID or random factor if not specified
                                  // For mock purposes: Doc1 works Mon/Wed/Fri, Doc2 works Tue/Thu based on constants logic
                                  // But here we need to visualize it based on the `isWorkHour` being true.
                                  // Let's assume the `schedule` array implies daily availability for this MVP grid, 
                                  // OR we refine the constants to imply specific days. 
                                  // To make it simple and visual: Active hours appear on specific days based on a hash of the user ID + day
                                  
                                  const dayIndex = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(day);
                                  // Mock logic: Spread schedule across days differently for visual distinction
                                  const isScheduledDay = (currentUser?.id === 'doc1' && (day === 'Mon' || day === 'Wed' || day === 'Fri')) ||
                                                         (currentUser?.id === 'doc2' && (day === 'Tue' || day === 'Thu')) ||
                                                         (!['doc1', 'doc2'].includes(currentUser?.id || '') && (dayIndex % 2 === 0)); // Random logic for new registered docs

                                  const isBusy = isWorkHour && isScheduledDay;

                                  return (
                                      <div key={`${day}-${hour}`} className="h-20 border-t border-white/5 relative group transition-all hover:bg-white/5 rounded-lg">
                                          {isBusy && (
                                              <div className="absolute inset-1 bg-cyan-600/30 border border-cyan-500/50 rounded-lg p-2 animate-in fade-in zoom-in duration-300">
                                                  <p className="text-xs font-bold text-cyan-200">Available</p>
                                                  <p className="text-[10px] text-cyan-100/70">Consultation Slot</p>
                                              </div>
                                          )}
                                      </div>
                                  )
                              })}
                          </React.Fragment>
                      ))}
                  </div>
              </div>
          </div>
      )
  }

  // --- Clinical View (My Patients) ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
      {/* Sidebar List */}
      <div className="lg:col-span-4 flex flex-col space-y-6 h-full">
        {/* Patient List */}
        <div className="glass-card p-6 rounded-2xl flex-1 overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                <User className="text-blue-400" size={20} />
                <span>Patient Queue</span>
            </h3>
            <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar pr-2">
                {myPatients.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center mt-10">No patients assigned yet.</p>
                ) : myPatients.map(p => (
                    <div 
                        key={p.id}
                        onClick={() => setActivePatient(p)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${activePatient?.id === p.id ? 'bg-blue-600/30 border-blue-500' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold text-white">{p.name}</p>
                                <p className="text-xs text-gray-400">{p.age} yrs • {p.gender}</p>
                            </div>
                            {p.status === 'Critical' && <Activity size={16} className="text-red-500 animate-pulse" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Main Clinical Area */}
      <div className="lg:col-span-8 h-full">
         {activePatient ? (
             <div className="glass-card p-8 rounded-2xl h-full flex flex-col">
                 <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                     <div>
                         <h2 className="text-2xl font-bold text-white">{activePatient.name}</h2>
                         <div className="flex space-x-4 mt-2 text-sm text-gray-300">
                             <span>Blood: {activePatient.bloodType}</span>
                             <span>BP: {activePatient.vitals?.bp}</span>
                             <span>Temp: {activePatient.vitals?.temp}°C</span>
                         </div>
                     </div>
                     <button onClick={() => setActivePatient(null)} className="text-sm text-gray-400 hover:text-white">Close</button>
                 </div>

                 <div className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                     <div className="space-y-4">
                         <label className="block text-sm font-medium text-cyan-300">Symptoms</label>
                         <textarea 
                            className="w-full h-32 glass-input p-4 rounded-xl resize-none focus:border-cyan-500 focus:outline-none"
                            placeholder="Patient complaints..."
                            value={consultation.symptoms}
                            onChange={e => setConsultation({...consultation, symptoms: e.target.value})}
                         />
                         <button 
                            onClick={handleAIAnalysis}
                            disabled={aiLoading || !consultation.symptoms}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-medium text-white flex items-center justify-center space-x-2 hover:opacity-90 disabled:opacity-50"
                         >
                             {aiLoading ? <span className="animate-spin">⌛</span> : <Activity size={18} />}
                             <span>AI Diagnosis Assist</span>
                         </button>
                     </div>

                     <div className="space-y-4">
                         <label className="block text-sm font-medium text-cyan-300">AI Suggestions & Diagnosis</label>
                         <div className="w-full h-44 bg-black/20 border border-white/10 rounded-xl p-4 overflow-y-auto text-sm text-gray-300">
                             {consultation.diagnosis ? (
                                 <div className="whitespace-pre-line">{consultation.diagnosis}</div>
                             ) : (
                                 <span className="text-gray-600 italic">Analysis will appear here...</span>
                             )}
                         </div>
                     </div>

                     <div className="col-span-2 space-y-4 pt-4 border-t border-white/10">
                         <label className="block text-sm font-medium text-cyan-300">Prescription</label>
                         <div className="flex space-x-2">
                             <input 
                                className="flex-1 glass-input p-3 rounded-xl"
                                placeholder="e.g. Paracetamol 500mg, twice daily"
                                value={consultation.prescription}
                                onChange={e => setConsultation({...consultation, prescription: e.target.value})}
                             />
                             <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20"><Plus size={20} /></button>
                         </div>
                     </div>
                     
                     <div className="col-span-2">
                        <label className="block text-sm font-medium text-cyan-300 mb-2">Doctor's Notes</label>
                        <textarea 
                            className="w-full h-24 glass-input p-3 rounded-xl resize-none"
                            placeholder="Additional observations..."
                            value={consultation.notes}
                            onChange={e => setConsultation({...consultation, notes: e.target.value})}
                        />
                     </div>
                 </div>

                 <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                     <button 
                        onClick={handleSaveRecord}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white py-3 px-8 rounded-xl font-bold flex items-center space-x-2 transition-all"
                     >
                         <Save size={18} />
                         <span>Finalize Consultation</span>
                     </button>
                 </div>
             </div>
         ) : (
             <div className="h-full flex items-center justify-center glass-card rounded-2xl border-dashed border-2 border-white/20">
                 <div className="text-center text-gray-500">
                     <User size={48} className="mx-auto mb-4 opacity-50" />
                     <p>Select a patient from the list to start consultation</p>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};
