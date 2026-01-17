import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Lock, User, Mail, ChevronRight, Stethoscope, Briefcase, Phone } from 'lucide-react';

export const Auth = () => {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>(Role.PATIENT);
  const [formData, setFormData] = useState({ name: '', username: '', email: '', phone: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      if (!formData.username) {
        setError('Username is required');
        return;
      }
      const success = login(formData.username, role);
      if (!success) setError('Invalid credentials or role mismatch.');
    } else {
      if (!formData.name || !formData.email || !formData.username || !formData.phone) {
          setError('All fields are required');
          return;
      }
      register({ name: formData.name, email: formData.email, username: formData.username, phone: formData.phone, role });
    }
  };

  const RoleCard = ({ r, icon: Icon, label }: any) => (
    <div 
      onClick={() => setRole(r)}
      className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center justify-center space-y-2 ${role === r ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
    >
      <Icon className={role === r ? 'text-white' : 'text-gray-400'} size={24} />
      <span className={`text-xs font-semibold ${role === r ? 'text-white' : 'text-gray-400'}`}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">SyncroMed AI</h1>
            <p className="text-gray-400">Next-Gen Hospital Operating System</p>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <div className="flex bg-black/20 p-1 rounded-xl mb-6">
            <button 
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500'}`}
                onClick={() => setIsLogin(true)}
            >
                Login
            </button>
            <button 
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500'}`}
                onClick={() => setIsLogin(false)}
            >
                Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs text-gray-400 mb-3 uppercase tracking-wider text-center">Select your Portal</label>
                <div className="grid grid-cols-4 gap-2 mb-6">
                    <RoleCard r={Role.PATIENT} icon={User} label="Patient" />
                    <RoleCard r={Role.DOCTOR} icon={Stethoscope} label="Doctor" />
                    <RoleCard r={Role.ADMIN} icon={Lock} label="Admin" />
                    <RoleCard r={Role.PHARMACIST} icon={Briefcase} label="Pharma" />
                </div>
            </div>

            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full glass-input pl-10 p-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}

            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Username" 
                className="w-full glass-input pl-10 p-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>

            {!isLogin && (
              <>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full glass-input pl-10 p-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Contact Number" 
                  className="w-full glass-input pl-10 p-3 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              </>
            )}
            
            {/* Demo Password Hint */}
            <div className="text-xs text-gray-500 text-center">
                (Login using username only)
                {isLogin && role === Role.ADMIN && <div className="text-blue-400 mt-1">Username: admin</div>}
                {isLogin && role === Role.DOCTOR && <div className="text-blue-400 mt-1">Username: house</div>}
                {isLogin && role === Role.PATIENT && <div className="text-blue-400 mt-1">Username: john</div>}
                {isLogin && role === Role.PHARMACIST && <div className="text-blue-400 mt-1">Username: pharma</div>}
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center space-x-2 transition-all mt-4"
            >
              <span>{isLogin ? 'Access Dashboard' : 'Create Account'}</span>
              <ChevronRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
