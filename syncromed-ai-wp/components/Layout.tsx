import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Activity, Users, Calendar, Pill, LayoutDashboard, UserPlus, FileText, AlertTriangle, MessageSquare, ClipboardPlus, ShoppingBag } from 'lucide-react';
import { Role } from '../types';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, logout, activeTab, setActiveTab } = useApp();

  if (!currentUser) return <>{children}</>;

  const NavItem = ({ icon: Icon, label, id }: any) => (
    <div 
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === id ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'hover:bg-white/5 text-gray-400'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/10 fixed h-full z-10 flex flex-col justify-between">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="bg-gradient-to-tr from-blue-500 to-cyan-400 p-2 rounded-lg">
              <Activity className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              SyncroMed
            </h1>
          </div>

          <nav className="space-y-2">
            <NavItem icon={LayoutDashboard} label="Dashboard" id="DASHBOARD" />
            
            {currentUser.role === Role.ADMIN && (
              <>
                <NavItem icon={Users} label="Patient Registry" id="PATIENTS" />
                <NavItem icon={UserPlus} label="Allocations" id="ALLOCATIONS" />
              </>
            )}
            
            {currentUser.role === Role.DOCTOR && (
              <>
                <NavItem icon={Calendar} label="My Schedule" id="SCHEDULE" />
                <NavItem icon={Users} label="My Patients" id="MY_PATIENTS" />
                <NavItem icon={MessageSquare} label="Patient Messages" id="MESSAGES" />
                <NavItem icon={ClipboardPlus} label="Pharmacy" id="PHARMACY" />
              </>
            )}
            
            {currentUser.role === Role.PHARMACIST && (
              <>
                <NavItem icon={Pill} label="Inventory Management" id="INVENTORY" />
                <NavItem icon={ShoppingBag} label="Medi Shop (POS)" id="MEDI_SHOP" />
              </>
            )}
            
            {currentUser.role === Role.PATIENT && (
              <>
                 <NavItem icon={FileText} label="My Records" id="RECORDS" />
                 <NavItem icon={MessageSquare} label="Messages" id="MESSAGES" />
              </>
            )}
          </nav>
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center space-x-3 mb-4">
             <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border border-white/30" />
             <div>
               <p className="text-sm font-semibold text-white">{currentUser.name}</p>
               <p className="text-xs text-blue-300 capitalize">{currentUser.role.toLowerCase()}</p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg transition-colors text-sm font-medium border border-red-500/20"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 pb-20">
        {children}
      </main>
    </div>
  );
};
