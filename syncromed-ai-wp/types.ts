export enum Role {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  ADMIN = 'ADMIN',
  PHARMACIST = 'PHARMACIST'
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: Role;
  avatar?: string;
}

export interface Doctor extends User {
  specialty: string;
  schedule: string[]; // e.g., ["09:00", "10:00"]
  availabilityStatus: 'ONLINE' | 'BUSY' | 'OFFLINE';
  patientsAssigned: string[]; // Patient IDs
}

export interface Patient extends User {
  age: number;
  gender: string;
  bloodType: string;
  history: MedicalRecord[];
  assignedDoctorId: string | null;
  status: 'Admitted' | 'Outpatient' | 'Discharged' | 'Critical';
  vitals?: {
    heartRate: number;
    bp: string;
    temp: number;
  };
  pendingBills: number; // In Rupees
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface PharmacyRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  medicineName: string;
  status: 'PENDING' | 'AVAILABLE' | 'UNAVAILABLE';
  timestamp: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  doctorId: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  expiry: string;
  minLevel: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  time: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
}

export interface HospitalStats {
  occupiedBeds: number;
  totalBeds: number;
  bloodBank: Record<string, number>; // "A+": 10
}

export interface AIAnalysisResult {
  text: string;
  confidence?: number;
  items?: string[];
}
