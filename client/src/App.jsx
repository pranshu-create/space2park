import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DemoControlPanel from './components/DemoControlPanel';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import BookingCheckout from './pages/BookingCheckout';
import MyBookings from './pages/MyBookings';
import Events from './pages/Events';
import OwnerPortal from './pages/OwnerPortal';
import HostPortal from './pages/HostPortal';
import AdminAuthority from './pages/AdminAuthority';

export default function App() {
  const [vehicleMode, setVehicleMode] = useState('car');
  const [heatmapActive, setHeatmapActive] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container font-body-md">
      {/* Persistent Global Header */}
      <Navbar vehicleMode={vehicleMode} setVehicleMode={setVehicleMode} />

      {/* Main Content Router */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home vehicleMode={vehicleMode} setVehicleMode={setVehicleMode} />} />
          <Route path="/explore" element={<Explore vehicleMode={vehicleMode} setVehicleMode={setVehicleMode} />} />
          <Route path="/book/:spaceId" element={<BookingCheckout />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/events" element={<Events />} />
          <Route path="/owner/dashboard" element={<OwnerPortal />} />
          <Route path="/owner/spaces/new" element={<OwnerPortal />} />
          <Route path="/owner/scan" element={<OwnerPortal />} />
          <Route path="/host/events/new" element={<HostPortal />} />
          <Route path="/admin/authority" element={<AdminAuthority />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Persistent Footer */}
      <Footer />

      {/* Judge Demo Control Panel (SIH 2026 Floating HUD) */}
      <DemoControlPanel
        heatmapActive={heatmapActive}
        onToggleHeatmap={() => setHeatmapActive(!heatmapActive)}
        onTriggerAllocationAnimation={() => {
          alert('Allocation Ray Animation triggered across Indore venue corridors!');
        }}
        onResetComplete={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
