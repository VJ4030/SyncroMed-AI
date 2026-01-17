import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, Doctor, Patient, Medicine, Appointment, HospitalStats, Message, PharmacyRequest } from '../types';
import { MOCK_USERS, MOCK_DOCTORS, MOCK_PATIENTS, MOCK_APPOINTMENTS, INITIAL_MEDICINES, INITIAL_STATS } from '../constants';

interface AppState {
  currentUser: User | null;
  doctors: Doctor[];
  patients: Patient[];
  medicines: Medicine[];
  appointments: Appointment[];
  stats: HospitalStats;
  activeTab: string; 
  messages: Message[];
  pharmacyRequests: PharmacyRequest[];
  
  // Actions
  login: (username: string, role: Role) => boolean;
  logout: () => void;
  register: (user: Partial<User> & { role: Role }) => void;
  allocatePatient: (patientId: string, doctorId: string) => void;
  addMedicalRecord: (patientId: string, record: any) => void;
  updateInventory: (id: string, newStock: number) => void;
  scheduleAppointment: (apt: Appointment) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  generateBill: (patientId: string, amount: number) => void;
  setActiveTab: (tab: string) => void;
  sendMessage: (receiverId: string, content: string) => void;
  sendPharmacyRequest: (medicineName: string) => void;
  updatePharmacyRequestStatus: (requestId: string, status: PharmacyRequest['status']) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [stats, setStats] = useState<HospitalStats>(INITIAL_STATS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pharmacyRequests, setPharmacyRequests] = useState<PharmacyRequest[]>([]);

  const login = (username: string, role: Role): boolean => {
    let foundUser: User | undefined;
    if (role === Role.ADMIN) foundUser = MOCK_USERS.find(u => u.username === username && u.role === Role.ADMIN);
    else if (role === Role.DOCTOR) foundUser = doctors.find(u => u.username === username);
    else if (role === Role.PATIENT) foundUser = patients.find(u => u.username === username);
    else if (role === Role.PHARMACIST) {
        if (username === 'pharma') {
             foundUser = { id: 'pharm1', name: 'Pharma Joe', username: 'pharma', email: 'pharma@syncromed.ai', role: Role.PHARMACIST, avatar: 'https://picsum.photos/100/100' };
        }
    }

    if (foundUser) {
      setCurrentUser(foundUser);
      setActiveTab('DASHBOARD');
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const register = (userData: Partial<User> & { role: Role }) => {
    const newUser = { 
      ...userData, 
      id: Math.random().toString(36).substr(2, 9),
      avatar: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 100)}`
    } as User;

    if (userData.role === Role.DOCTOR) {
      // Generate a random schedule for the new doctor
      const allHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
      const randomSchedule = allHours.filter(() => Math.random() > 0.5);
      
      setDoctors([...doctors, { 
          ...newUser, 
          specialty: 'General', 
          schedule: randomSchedule.length > 0 ? randomSchedule : ['09:00', '12:00'], 
          availabilityStatus: 'OFFLINE', 
          patientsAssigned: [] 
      } as Doctor]);
    } else if (userData.role === Role.PATIENT) {
      setPatients([...patients, { ...newUser, history: [], assignedDoctorId: null, pendingBills: 0, status: 'Outpatient' } as Patient]);
    }
    setCurrentUser(newUser);
  };

  const allocatePatient = (patientId: string, doctorId: string) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, assignedDoctorId: doctorId } : p));
    setDoctors(prev => prev.map(d => {
        const filtered = d.patientsAssigned.filter(pid => pid !== patientId);
        if (d.id === doctorId) {
            return { ...d, patientsAssigned: [...filtered, patientId] };
        }
        return { ...d, patientsAssigned: filtered };
    }));
  };

  const addMedicalRecord = (patientId: string, record: any) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, history: [record, ...p.history] };
      }
      return p;
    }));
  };

  const updateInventory = (id: string, newStock: number) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, stock: newStock } : m));
  };

  const scheduleAppointment = (apt: Appointment) => {
    setAppointments([...appointments, apt]);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const generateBill = (patientId: string, amount: number) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return { ...p, pendingBills: p.pendingBills + amount };
      }
      return p;
    }));
  };

  const sendMessage = (receiverId: string, content: string) => {
      if (!currentUser) return;
      const newMessage: Message = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          senderName: currentUser.name,
          receiverId,
          content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
  };

  const sendPharmacyRequest = (medicineName: string) => {
      if (!currentUser || currentUser.role !== Role.DOCTOR) return;
      const newRequest: PharmacyRequest = {
          id: Date.now().toString(),
          doctorId: currentUser.id,
          doctorName: currentUser.name,
          medicineName,
          status: 'PENDING',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setPharmacyRequests([newRequest, ...pharmacyRequests]);
  };

  const updatePharmacyRequestStatus = (requestId: string, status: PharmacyRequest['status']) => {
      setPharmacyRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status } : req
      ));
  };

  return (
    <AppContext.Provider value={{
      currentUser, doctors, patients, medicines, appointments, stats, activeTab, messages, pharmacyRequests,
      login, logout, register, allocatePatient, addMedicalRecord, updateInventory, scheduleAppointment, updateAppointmentStatus, generateBill, setActiveTab, sendMessage, sendPharmacyRequest, updatePharmacyRequestStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
