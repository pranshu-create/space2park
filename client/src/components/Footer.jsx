import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-primary-container/30 pt-space-xl pb-space-lg">
      <div className="w-full px-margin-mobile md:px-margin max-w-7xl mx-auto">
        
        {/* Synthetic Demo Data Alert Pill */}
        <div className="mb-space-lg p-space-sm rounded-xl bg-surface-container-low border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping shrink-0"></span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary font-bold">
              SYNTHETIC DEMO DATA (INDORE PILOT)
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant italic">
            "Impact is measured through platform KPIs; final city-level reductions require pilot data."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl mb-space-xl">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <img src="/logo.svg" alt="SPACE2PARK" className="h-9 w-auto object-contain" />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Park Smart. Live Events Better. The premier intelligent mobility & event-aware parking network turning unused spaces into guaranteed reservations across Indore.
            </p>
            <div className="mt-space-xs inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full border border-tertiary-container/30 bg-tertiary-container/10 w-fit">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-tertiary uppercase">
                Indore Pilot Grid Active • 315+ Live Bays
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest font-semibold">
              Platform
            </span>
            <nav className="flex flex-col gap-space-xs">
              <Link to="/explore" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Find Parking
              </Link>
              <Link to="/events" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Events Corridor
              </Link>
              <Link to="/owner/spaces/new" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                List Your Space
              </Link>
              <Link to="/my-bookings" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                My Passes & QR
              </Link>
            </nav>
          </div>

          {/* Portals */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest font-semibold">
              Stakeholder Portals
            </span>
            <nav className="flex flex-col gap-space-xs">
              <Link to="/owner/dashboard" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Space Owner Portal
              </Link>
              <Link to="/owner/scan" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                QR Scanner Station
              </Link>
              <Link to="/host/events/new" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Event Host Studio
              </Link>
              <Link to="/admin/authority" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                City Authority Dashboard
              </Link>
            </nav>
          </div>

          {/* Team & Research */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest font-semibold">
              Hackathon Context
            </span>
            <div className="flex flex-col gap-1 text-xs text-on-surface-variant">
              <span><strong>Team:</strong> Syntax Error (191988)</span>
              <span><strong>Problem Statement:</strong> SIH26205</span>
              <span><strong>Theme:</strong> Transportation & Logistics</span>
              <span><strong>Category:</strong> Software</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-space-lg border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant font-body-sm text-body-sm">
          <span>© 2026 Space2Park Technologies • Smart India Hackathon 2026.</span>
          <div className="flex items-center gap-space-md">
            <span className="font-data-mono text-data-mono text-primary-container text-xs">
              SYS.VER 4.4.0-DISCOVERY-SUITE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
