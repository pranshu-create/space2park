import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar({ vehicleMode = 'car', setVehicleMode }) {
  const location = useLocation();
  const { user, logout, demoLogin, isAuthenticated } = useAuth();
  const { connected } = useSocket();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const isActive = path => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-2xl border-b border-outline-variant/40">
      <div className="h-16 md:h-20 w-full px-margin-mobile md:px-margin flex items-center justify-between gap-space-md">
        
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-space-md shrink-0">
          <Link to="/" className="flex items-center gap-space-sm focus:outline-none group">
            <img src="/logo.svg" alt="SPACE2PARK" className="h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-space-md 2xl:gap-space-lg">
          <Link
            to="/"
            className={`font-label-md text-label-md transition-colors py-space-sm ${
              isActive('/') ? 'text-primary font-semibold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Home
          </Link>
          <Link
            to="/explore"
            className={`font-label-md text-label-md transition-colors py-space-sm ${
              isActive('/explore') ? 'text-primary font-semibold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Find Parking
          </Link>
          <Link
            to="/events"
            className={`font-label-md text-label-md transition-colors py-space-sm ${
              isActive('/events') ? 'text-primary font-semibold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Events
          </Link>
          <Link
            to="/owner/spaces/new"
            className={`font-label-md text-label-md transition-colors py-space-sm ${
              isActive('/owner/spaces/new') ? 'text-primary font-semibold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            List Your Space
          </Link>
          <Link
            to="/my-bookings"
            className={`font-label-md text-label-md transition-colors py-space-sm ${
              isActive('/my-bookings') ? 'text-primary font-semibold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            My Passes
          </Link>
        </nav>

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-space-sm md:gap-space-md shrink-0">
          
          {/* Indore GPS & Car/Bike Toggle */}
          <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container border border-outline-variant/50 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-tertiary">near_me</span>
            <span className="font-label-caps text-label-caps tracking-wider text-on-surface">Indore, MP</span>
            <span className="text-outline-variant">|</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('car')}
                className={`px-2 py-0.5 rounded-full font-label-caps text-[10px] uppercase font-bold transition-all ${
                  vehicleMode === 'car' ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Car
              </button>
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('bike')}
                className={`px-2 py-0.5 rounded-full font-label-caps text-[10px] uppercase font-bold transition-all ${
                  vehicleMode === 'bike' ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Bike
              </button>
            </div>
          </div>

          {/* Role Portal Quick Links */}
          {user?.role === 'owner' && (
            <Link to="/owner/dashboard" className="hidden lg:inline-flex items-center gap-1 text-xs text-primary font-label-caps uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/30">
              <span className="material-symbols-outlined text-[14px]">garage_home</span>
              Owner Portal
            </Link>
          )}

          {user?.role === 'host' && (
            <Link to="/host/events/new" className="hidden lg:inline-flex items-center gap-1 text-xs text-tertiary font-label-caps uppercase bg-tertiary/10 px-2.5 py-1 rounded-full border border-tertiary/30">
              <span className="material-symbols-outlined text-[14px]">event</span>
              Host Portal
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin/authority" className="hidden lg:inline-flex items-center gap-1 text-xs text-primary-fixed-dim font-label-caps uppercase bg-primary-container/20 px-2.5 py-1 rounded-full border border-primary/40">
              <span className="material-symbols-outlined text-[14px]">shield_person</span>
              Admin / Authority
            </Link>
          )}

          {/* Demo Roles Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/60 text-xs font-label-caps uppercase text-on-surface hover:border-primary transition-all flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>{user ? `Role: ${user.role}` : 'Demo Login'}</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-surface-container-highest/95 border border-outline-variant/60 shadow-2xl p-2 z-50 backdrop-blur-xl">
                <div className="text-[10px] font-label-caps uppercase text-on-surface-variant px-2 py-1">
                  1-Click Role Switcher
                </div>
                <button
                  type="button"
                  onClick={() => { demoLogin('seeker'); setDemoMenuOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-surface-bright flex items-center justify-between text-on-surface"
                >
                  <span>🏎️ Parking Seeker</span>
                  {user?.role === 'seeker' && <span className="text-tertiary text-xs">●</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { demoLogin('owner'); setDemoMenuOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-surface-bright flex items-center justify-between text-on-surface"
                >
                  <span>🏡 Space Owner</span>
                  {user?.role === 'owner' && <span className="text-tertiary text-xs">●</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { demoLogin('host'); setDemoMenuOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-surface-bright flex items-center justify-between text-on-surface"
                >
                  <span>🎪 Event Host</span>
                  {user?.role === 'host' && <span className="text-tertiary text-xs">●</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { demoLogin('admin'); setDemoMenuOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-surface-bright flex items-center justify-between text-on-surface"
                >
                  <span>🏛️ Admin / Authority</span>
                  {user?.role === 'admin' && <span className="text-tertiary text-xs">●</span>}
                </button>
                {isAuthenticated && (
                  <div className="pt-1 mt-1 border-t border-outline-variant/40">
                    <button
                      type="button"
                      onClick={() => { logout(); setDemoMenuOpen(false); }}
                      className="w-full text-left px-2 py-1 rounded text-[11px] text-error hover:bg-surface-bright"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Status Ping */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-primary-container/50 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(216,166,74,0.2)]">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-surface-container-lowest ${
                connected ? 'bg-tertiary animate-pulse' : 'bg-outline'
              }`}
              title={connected ? 'Live Telemetry Connected' : 'Telemetry Offline'}
            ></span>
          </div>

        </div>
      </div>
    </header>
  );
}
