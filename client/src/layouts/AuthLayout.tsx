import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { DemoModeBanner } from '../components/common/DemoModeBanner';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <DemoModeBanner />
      <div className="py-6 px-4 sm:px-6 lg:px-8 flex justify-center">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-900">PFIS</span>
            <span className="text-[10px] font-semibold text-slate-500 -mt-1">
              Patient Friction Index & Access Platform
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
