import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { AdminDashboard } from './pages/AdminDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDashboard } from './pages/PatientDashboard';
import { PharmacistDashboard } from './pages/PharmacistDashboard';
import { Role } from './types';

const AppContent = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <Layout>
      {currentUser.role === Role.ADMIN && <AdminDashboard />}
      {currentUser.role === Role.DOCTOR && <DoctorDashboard />}
      {currentUser.role === Role.PATIENT && <PatientDashboard />}
      {currentUser.role === Role.PHARMACIST && <PharmacistDashboard />}
    </Layout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
