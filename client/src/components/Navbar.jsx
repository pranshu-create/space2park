import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar({ vehicleMode = 'car', setVehicleMode }) {
  const location = useLocation();
  const { user, logout, demoLogin, isAuthenticated } = useAuth();
  const { connected } = useSocket();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = path => location.pathname === path;
  const currentRole = user?.role || 'seeker';

  // Role-specific navigation links
  const getNavLinks = () => {
    switch (currentRole) {
      case 'owner':
        return [
          { label: 'Home', path: '/' },
          { label: 'Owner Dashboard', path: '/owner/dashboard' },
          { label: '+ List Space', path: '/owner/spaces/new' },
          { label: '📷 Gate Scanner', path: '/owner/scan' },
          { label: 'My Passes', path: '/my-bookings' }
        ];
      case 'host':
        return [
          { label: 'Home', path: '/' },
          { label: 'Host Studio & Estimator', path: '/host/events/new' },
          { label: 'Event Corridors', path: '/events' },
          { label: 'Find Parking', path: '/explore' }
        ];
      case 'admin':
        return [
          { label: 'Home', path: '/' },
          { label: 'Authority Dashboard', path: '/admin/authority' },
          { label: 'Event Corridors', path: '/events' },
          { label: 'Radar Explorer', path: '/explore' }
        ];
      case 'seeker':
      default:
        return [
          { label: 'Home', path: '/' },
          { label: 'Find Parking', path: '/explore' },
          { label: 'Events', path: '/events' },
          { label: 'List Space', path: '/owner/spaces/new' },
          { label: 'My Passes & HUD', path: '/my-bookings' }
        ];
    }
  };

  // Role-specific primary CTA
  const getPrimaryCTA = () => {
    switch (currentRole) {
      case 'owner':
        return { label: '+ List Space', path: '/owner/spaces/new', icon: 'add_circle' };
      case 'host':
        return { label: '+ Host Event', path: '/host/events/new', icon: 'event' };
      case 'admin':
        return { label: 'Authority Hub', path: '/admin/authority', icon: 'shield_person' };
      case 'seeker':
      default:
        return { label: 'Find Parking', path: '/explore', icon: 'radar' };
    }
  };

  const navLinks = getNavLinks();
  const primaryCTA = getPrimaryCTA();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/[0.08] backdrop-blur-2xl transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.45)]">
      <div className="h-20 w-full px-margin-mobile md:px-margin flex items-center justify-between gap-space-md">
        
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-space-sm shrink-0">
          <Link to="/" className="flex items-center gap-space-sm focus:outline-none group">
            <img
              src="/logo.svg"
              alt="Space2Park logo: autonomous mobility and event parking grid"
              className="h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Active Role Indicator Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full glass-pill text-[10px] font-label-caps uppercase font-bold tracking-wider text-primary border border-primary/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>{currentRole.toUpperCase()} VIEW</span>
          </div>
        </div>

        {/* Center: Dynamic Role-Based Navigation Links */}
        <nav className="hidden xl:flex items-center gap-space-md 2xl:gap-space-lg">
          {navLinks.map(link => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path + link.label}
                to={link.path}
                className={`font-label-md text-label-md transition-all py-1.5 px-3 rounded-lg relative ${
                  active
                    ? 'text-primary font-bold bg-primary/10 border border-primary/25 shadow-[0_0_12px_rgba(216,166,74,0.15)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Controls, Mode Switch, CTAs & Account */}
        <div className="flex items-center gap-space-sm md:gap-space-md shrink-0">
          {/* Indore GPS & Car/Bike Mode Switcher */}
          <div className="hidden md:flex items-center gap-space-xs px-space-sm py-1.5 rounded-full glass-pill text-on-surface-variant shadow-inner">
            <span className="material-symbols-outlined text-[16px] text-tertiary">near_me</span>
            <span className="font-label-caps text-label-caps tracking-wider text-on-surface font-semibold">Indore</span>
            <span className="text-outline-variant">|</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('car')}
                className={`px-2.5 py-0.5 rounded-full font-label-caps text-[10px] uppercase font-bold transition-all cursor-pointer ${
                  vehicleMode === 'car'
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Car
              </button>
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('bike')}
                className={`px-2.5 py-0.5 rounded-full font-label-caps text-[10px] uppercase font-bold transition-all cursor-pointer ${
                  vehicleMode === 'bike'
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Bike
              </button>
            </div>
          </div>

          {/* Dynamic Role-Based Primary CTA Button */}
          <Link
            to={primaryCTA.path}
            className="hidden sm:inline-flex items-center justify-center gap-1.5 px-space-md py-space-xs rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-all duration-200 shadow-[0_0_18px_rgba(216,166,74,0.25)] hover:scale-105"
          >
            <span className="material-symbols-outlined text-[16px]">{primaryCTA.icon}</span>
            <span>{primaryCTA.label}</span>
          </Link>

          {/* 1-Click Role Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="px-3 py-1.5 rounded-full glass-pill hover:border-primary/50 text-xs font-label-caps uppercase text-on-surface transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Switch user demo role"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="font-bold">{user ? user.role : 'seeker'}</span>
              <span className="material-symbols-outlined text-[15px]">expand_more</span>
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl glass-panel-elevated shadow-2xl p-2.5 z-50 animate-fadeIn">
                <div className="text-[10px] font-label-caps uppercase text-on-surface-variant px-2 py-1 font-bold border-b border-white/[0.08] mb-1">
                  Active Role Switcher
                </div>
                <button
                  type="button"
                  onClick={() => { demoLogin('seeker'); setDemoMenuOpen(false); }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    currentRole === 'seeker' ? 'bg-primary/20 text-primary font-bold' : 'text-on-surface hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="flex items-center gap-2">🏎️ Parking Seeker</span>
                  {currentRole === 'seeker' && <span className="text-tertiary">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { demoLogin('owner'); setDemoMenuOpen(false); }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    currentRole === 'owner' ? 'bg-primary/20 text-primary font-bold' : 'text-on-surface hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="flex items-center gap-2">🏡 Space Owner</span>
                  {currentRole === 'owner' && <span className="text-tertiary">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { demoLogin('host'); setDemoMenuOpen(false); }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    currentRole === 'host' ? 'bg-primary/20 text-primary font-bold' : 'text-on-surface hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="flex items-center gap-2">🎪 Event Host</span>
                  {currentRole === 'host' && <span className="text-tertiary">✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => { demoLogin('admin'); setDemoMenuOpen(false); }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    currentRole === 'admin' ? 'bg-primary/20 text-primary font-bold' : 'text-on-surface hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="flex items-center gap-2">🏛️ Municipal Admin</span>
                  {currentRole === 'admin' && <span className="text-tertiary">✓</span>}
                </button>
                {isAuthenticated && (
                  <div className="pt-1.5 mt-1 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => { logout(); setDemoMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-error hover:bg-error/10 cursor-pointer font-semibold flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Avatar with Real-Time Telemetry Socket Ping */}
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-[0_0_14px_rgba(216,166,74,0.35)]">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-surface-container-lowest ${
                connected ? 'bg-tertiary animate-pulse' : 'bg-outline'
              }`}
              title={connected ? 'Live Telemetry Connected' : 'Telemetry Offline'}
            ></span>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden w-9 h-9 rounded-full glass-pill flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Glass Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden glass-panel-elevated border-b border-white/[0.08] px-margin-mobile py-space-md flex flex-col gap-space-sm animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <span className="font-label-caps text-xs text-primary font-bold">
              LOGGED IN AS: {currentRole.toUpperCase()}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('car')}
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  vehicleMode === 'car' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                }`}
              >
                Car
              </button>
              <button
                type="button"
                onClick={() => setVehicleMode && setVehicleMode('bike')}
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  vehicleMode === 'bike' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                }`}
              >
                Bike
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={'mob-' + link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-primary/20 text-primary font-bold border border-primary/30'
                    : 'text-on-surface hover:bg-white/[0.05]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-white/[0.08]">
            <Link
              to={primaryCTA.path}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary font-bold text-center block shadow-[0_0_16px_rgba(216,166,74,0.3)]"
            >
              {primaryCTA.label}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
