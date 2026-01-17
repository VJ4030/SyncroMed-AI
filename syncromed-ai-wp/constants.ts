import { User, Role, Doctor, Patient, Medicine, HospitalStats, Appointment } from './types';

// Mock Initial Data for "Live Demo" feel
export const INITIAL_STATS: HospitalStats = {
  occupiedBeds: 45,
  totalBeds: 60,
  bloodBank: { 'A+': 12, 'O+': 8, 'B-': 3, 'AB+': 5 }
};

// Generate 100 Medicines with variety
const categories = ['Antibiotic', 'Analgesic', 'Chronic', 'Cardio', 'Dermatology', 'Neurology', 'Vitamins', 'Gastro', 'Respiratory', 'Psychiatry'];
const medicineNames = [
  'Paracetamol', 'Amoxicillin', 'Metformin', 'Ibuprofen', 'Atorvastatin', 'Omeprazole', 'Aspirin', 'Simvastatin', 'Lisinopril', 'Levothyroxine',
  'Amlodipine', 'Metoprolol', 'Losartan', 'Azithromycin', 'Gabapentin', 'Hydrochlorothiazide', 'Sertraline', 'Furosemide', 'Pantoprazole', 'Prednisone',
  'Ciprofloxacin', 'Doxycycline', 'Clindamycin', 'Cephalexin', 'Naproxen', 'Diclofenac', 'Tramadol', 'Codeine', 'Morphine', 'Oxycodone'
];

export const INITIAL_MEDICINES: Medicine[] = Array.from({ length: 100 }, (_, i) => {
  const baseName = medicineNames[i % medicineNames.length];
  const category = categories[i % categories.length];
  const suffix = Math.floor(i / medicineNames.length) > 0 ? ` Type-${String.fromCharCode(65 + Math.floor(i / medicineNames.length))}` : '';
  
  // Randomize stock to force some low stock items
  const isLowStock = Math.random() < 0.2; // 20% chance of low stock
  const stock = isLowStock ? Math.floor(Math.random() * 15) : Math.floor(Math.random() * 200) + 20;

  return {
    id: `m${i + 1}`,
    name: `${baseName}${suffix} ${100 + (i * 5)}mg`,
    category: category,
    stock: stock,
    price: Math.floor(Math.random() * 500) + 20,
    expiry: `202${5 + (i % 3)}-${1 + (i % 11)}-${1 + (i % 28)}`,
    minLevel: 20 // Fixed min level for easy logic
  };
});

export const MOCK_USERS: User[] = [
  { id: 'admin1', name: 'Sarah Connor', username: 'admin', email: 'admin@syncromed.ai', phone: '9876543210', role: Role.ADMIN, avatar: 'https://picsum.photos/100/100?random=1' },
];

export const MOCK_DOCTORS: Doctor[] = [
  { 
    id: 'doc1', 
    name: 'Dr. Gregory House', 
    username: 'house', 
    email: 'house@syncromed.ai', 
    phone: '9988776655', 
    role: Role.DOCTOR, 
    specialty: 'Diagnostician', 
    // Distinct schedule: Mornings Mon/Wed/Fri
    schedule: ['08:00', '09:00', '10:00', '11:00', '14:00'], 
    availabilityStatus: 'ONLINE', 
    patientsAssigned: ['pat1'], 
    avatar: 'https://picsum.photos/100/100?random=2' 
  },
  { 
    id: 'doc2', 
    name: 'Dr. Meredith Grey', 
    username: 'grey', 
    email: 'grey@syncromed.ai', 
    phone: '9123456789', 
    role: Role.DOCTOR, 
    specialty: 'General Surgery', 
    // Distinct schedule: Afternoons Tue/Thu
    schedule: ['13:00', '14:00', '15:00', '16:00', '17:00'], 
    availabilityStatus: 'BUSY', 
    patientsAssigned: [], 
    avatar: 'https://picsum.photos/100/100?random=3' 
  },
];

export const MOCK_PATIENTS: Patient[] = [
  { 
    id: 'pat1', 
    name: 'John Doe', 
    username: 'john',
    email: 'john@gmail.com', 
    phone: '8877665544',
    role: Role.PATIENT, 
    age: 34, 
    gender: 'Male', 
    bloodType: 'O+', 
    assignedDoctorId: 'doc1', 
    status: 'Admitted',
    vitals: { heartRate: 88, bp: '120/80', temp: 37.2 },
    pendingBills: 4500,
    history: [
      { id: 'h1', date: '2024-01-10', doctorId: 'doc1', symptoms: 'Severe headache, nausea', diagnosis: 'Migraine', prescription: 'Paracetamol, Rest', notes: 'Patient advised to avoid bright lights.' }
    ],
    avatar: 'https://picsum.photos/100/100?random=4'
  },
  { 
    id: 'pat2', 
    name: 'Jane Smith', 
    username: 'jane',
    email: 'jane@gmail.com', 
    phone: '7766554433',
    role: Role.PATIENT, 
    age: 28, 
    gender: 'Female', 
    bloodType: 'A+', 
    assignedDoctorId: null, 
    status: 'Outpatient',
    vitals: { heartRate: 72, bp: '118/75', temp: 36.6 },
    pendingBills: 0,
    history: [],
    avatar: 'https://picsum.photos/100/100?random=5'
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'apt1', patientId: 'pat1', doctorId: 'doc1', date: '2024-05-20', time: '10:00', status: 'APPROVED' }
];
