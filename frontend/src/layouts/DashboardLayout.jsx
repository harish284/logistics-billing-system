import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, User, FileText, Truck, CreditCard, LogOut, DollarSign, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { title: 'Dashboard', path: '/', icon: LayoutDashboard },
  { title: 'Customers', path: '/customers', icon: Users },
  { title: 'Rate Cards', path: '/ratecards', icon: DollarSign },
  { title: 'Invoices', path: '/invoices', icon: FileText },
  { title: 'Create Invoice', path: '/invoices/create', icon: PlusCircle },
  { title: 'Shipments', path: '/shipments', icon: Truck },
  { title: 'Payments', path: '/payments', icon: CreditCard },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider">LOGIBILL</h1>
          <p className="text-slate-400 text-sm mt-1">Management Portal</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.title}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-800">Logistics Billing software</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium max-w-[150px] truncate">
                  {user?.name || 'Administrator'}
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="p-2 -mr-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
