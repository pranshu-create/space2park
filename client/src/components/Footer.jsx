import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-primary-container/30 pt-space-xl pb-space-lg">
      <div className="w-full px-margin-mobile md:px-margin max-w-7xl mx-auto">
        
        {/* Synthetic Demo Data Alert Pill for SIH Evaluation */}
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
              <img src="/logo.svg" alt="Space2Park Logo" className="h-9 w-auto object-contain" />
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Park Smart. Arrive Easy. The premier intelligent mobility &amp; charging network for autonomous and luxury vehicular transit.
            </p>
            <div className="mt-space-xs inline-flex items-center gap-space-xs px-space-sm py-space-xs rounded-full border border-tertiary-container/30 bg-tertiary-container/10 w-fit">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-tertiary uppercase font-bold">
                Indore Pilot City Active • 14,200+ Spaces Mapped
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
                Events
              </Link>
              <Link to="/owner/spaces/new" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                List Your Space
              </Link>
              <Link to="/my-bookings" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                My Passes &amp; HUD
              </Link>
            </nav>
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest font-semibold">
              Company
            </span>
            <nav className="flex flex-col gap-space-xs">
              <Link to="/about" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                About
              </Link>
              <Link to="/contact" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Contact
              </Link>
              <Link to="/admin/authority" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Municipal Authority
              </Link>
            </nav>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-space-sm">
            <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest font-semibold">
              Legal &amp; Trust
            </span>
            <nav className="flex flex-col gap-space-xs">
              <Link to="/privacy" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Terms of Service
              </Link>
              <span className="font-body-sm text-body-sm text-tertiary">
                ISO 27001 Certified
              </span>
            </nav>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-space-lg border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-space-md text-on-surface-variant font-body-sm text-body-sm">
          <span>© 2026 Space2Park Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-space-md">
            <span className="font-data-mono text-data-mono text-primary-container text-xs font-bold">
              SYS.VER 4.2.0-STABLE • SIH 2026
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
