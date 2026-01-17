import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Activity, AlertTriangle, Link, BedDouble, Droplet } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { Role } from '../types';

export const AdminDashboard = () => {
  const { stats, doctors, patients, allocatePatient, register, activeTab } = useApp();
  const [prediction, setPrediction] = useState<any>(null);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [selectedPat, setSelectedPat] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: Role.DOCTOR });

  useEffect(() => {
    GeminiService.predictInflow(stats, new Date().toLocaleDateString('en-US', { weekday: 'long' }))
      .then(setPrediction);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAllocation = () => {
    if (selectedDoc && selectedPat) {
      allocatePatient(selectedPat, selectedDoc);
      alert("Patient allocation updated successfully!");
      setSelectedDoc('');
      setSelectedPat('');
    }
  };

  const handleQuickAdd = () => {
      if(newUser.name && newUser.email) {
          register(newUser);
          alert(`Added ${newUser.name} as ${newUser.role}`);
          setNewUser({ name: '', email: '', role: Role.DOCTOR });
      }
  }

  // --- Views Handling based on Sidebar ---
  const showRegistry = activeTab === 'PATIENTS';
  const showAllocations = activeTab === 'ALLOCATIONS';
  const showDashboard = activeTab === 'DASHBOARD';

  return (
    <div className="space-y-8">
      {/* Dashboard & Allocations rely on stats, so we show stats usually, 
          but for strict separation based on prompt "sidebar buttons working",
          we will show specific views. 
          Default view is Dashboard which shows stats + AI + Alerts. 
      */}

      {showDashboard && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm">Total Patients</p>
                    <p className="text-3xl font-bold text-white">{patients.length}</p>
                </div>
                <Users className="text-blue-400" size={32} />
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm">Active Doctors</p>
                    <p className="text-3xl font-bold text-white">{doctors.filter(d => d.availabilityStatus === 'ONLINE').length}</p>
                </div>
                <Activity className="text-green-400" size={32} />
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Bed Occupancy</p>
                        <div className="flex items-end space-x-2">
                            <p className="text-3xl font-bold text-white">{stats.occupiedBeds}</p>
                            <p className="text-sm text-gray-500 mb-1">/ {stats.totalBeds}</p>
                        </div>
                    </div>
                    <BedDouble className="text-orange-400" size={32} />
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">Blood Bank (A+)</p>
                        <p className="text-3xl font-bold text-white">{stats.bloodBank['A+']} <span className="text-xs font-normal">units</span></p>
                    </div>
                    <Droplet className="text-red-500" size={32} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <Activity className="text-indigo-300" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Gemini Inflow AI</h3>
                    </div>
                    
                    {prediction ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="text-gray-300">Predicted Load</span>
                        <span className="text-2xl font-bold text-white">{prediction.predictedCount} <span className="text-xs font-normal text-gray-400">patients</span></span>
                        </div>
                        <div>
                        <span className="text-xs font-uppercase text-gray-400 tracking-wider">RISK LEVEL</span>
                        <div className={`mt-2 py-2 px-3 rounded-lg text-center font-bold ${
                            prediction.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                        }`}>
                            {prediction.riskLevel}
                        </div>
                        </div>
                        <div>
                            <span className="text-xs font-uppercase text-gray-400 tracking-wider">AI SUGGESTION</span>
                            <p className="mt-1 text-sm text-gray-200 leading-relaxed italic">
                                "{prediction.suggestion}"
                            </p>
                        </div>
                    </div>
                    ) : (
                        <div className="animate-pulse flex space-x-2 items-center text-sm text-gray-400">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            <span>Analyzing historical data...</span>
                        </div>
                    )}
                </div>
                
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-bold mb-4">System Alerts</h3>
                    {stats.occupiedBeds > 40 && (
                        <div className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-2">
                            <AlertTriangle size={18} className="text-red-400 mt-1" />
                            <div className="text-sm">
                                <p className="text-red-200 font-semibold">High Bed Occupancy</p>
                                <p className="text-red-300/70">Consider postponing elective surgeries.</p>
                            </div>
                        </div>
                    )}
                    {patients.filter(p => !p.assignedDoctorId).length > 0 && (
                        <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <Users size={18} className="text-yellow-400 mt-1" />
                            <div className="text-sm">
                                <p className="text-yellow-200 font-semibold">Unassigned Patients</p>
                                <p className="text-yellow-300/70">Action required in Allocation.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </>
      )}

      {showAllocations && (
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Link size={20} className="text-cyan-400" />
              <span>Doctor-Patient Allocation (Full Control)</span>
            </h3>
            <p className="text-sm text-gray-400 mb-6">Select any patient (including already assigned) to re-allocate to a new doctor.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Select Patient</label>
                <select 
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  value={selectedPat}
                  onChange={(e) => setSelectedPat(e.target.value)}
                >
                  <option value="">-- Choose Patient --</option>
                  {/* List ALL patients to allow re-allocation */}
                  {patients.map(p => {
                      const assignedDoc = doctors.find(d => d.id === p.assignedDoctorId);
                      return (
                        <option key={p.id} value={p.id}>
                            {p.name} {assignedDoc ? `(Assigned: ${assignedDoc.name})` : '(Unassigned)'}
                        </option>
                      )
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Assign to Doctor</label>
                <select 
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                  value={selectedDoc}
                  onChange={(e) => setSelectedDoc(e.target.value)}
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialty}) - {d.patientsAssigned.length} patients</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleAllocation}
                disabled={!selectedDoc || !selectedPat}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all"
              >
                Update Allocation
              </button>
            </div>
          </div>
      )}

      {showRegistry && (
          <div className="space-y-8">
            {/* Quick Registry */}
            <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4">Quick Registration</h3>
                <div className="flex gap-4">
                    <input placeholder="Name" className="flex-1 glass-input p-2 rounded" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                    <input placeholder="Email" className="flex-1 glass-input p-2 rounded" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                    <select className="glass-input p-2 rounded" value={newUser.role} onChange={(e:any) => setNewUser({...newUser, role: e.target.value})}>
                        <option value="DOCTOR">Doctor</option>
                        <option value="PATIENT">Patient</option>
                    </select>
                    <button onClick={handleQuickAdd} className="bg-green-600 px-4 rounded hover:bg-green-500">Add</button>
                </div>
            </div>

           {/* Directory Table */}
           <div className="glass-card p-6 rounded-2xl overflow-hidden">
             <h3 className="text-xl font-semibold mb-4">Patient Directory</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-300">
                 <thead className="bg-white/5 uppercase font-medium">
                   <tr>
                     <th className="p-3">Name</th>
                     <th className="p-3">Username</th>
                     <th className="p-3">Status</th>
                     <th className="p-3">Assigned To</th>
                     <th className="p-3">Vitals</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {patients.map(p => {
                       const doc = doctors.find(d => d.id === p.assignedDoctorId);
                       return (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 font-medium text-white">{p.name}</td>
                            <td className="p-3 font-mono text-gray-400">{p.username}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'Critical' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                    {p.status}
                                </span>
                            </td>
                            <td className="p-3">{doc ? doc.name : <span className="text-red-400">Unassigned</span>}</td>
                            <td className="p-3">{p.vitals ? `BP: ${p.vitals.bp}` : 'N/A'}</td>
                        </tr>
                       )
                   })}
                 </tbody>
               </table>
             </div>
           </div>
          </div>
      )}
    </div>
  );
};
