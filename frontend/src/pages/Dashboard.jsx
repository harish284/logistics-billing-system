import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Activity, Users } from 'lucide-react';
import { getDashboardSummary } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    recentInvoices: [],
    monthlyRevenue: [],
    activeClients: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(res => setSummary(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  }

  const cards = [
    { title: 'Total Revenue', value: `₹${summary.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Invoices', value: summary.totalInvoices, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Clients', value: summary.activeClients, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { 
      title: 'Growth Rate', 
      value: `${summary.growthRate > 0 ? '+' : ''}${summary.growthRate.toFixed(1)}%`, 
      icon: Activity, 
      color: summary.growthRate >= 0 ? 'text-emerald-600' : 'text-red-600', 
      bg: summary.growthRate >= 0 ? 'bg-emerald-50' : 'bg-red-50' 
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-slate-500 text-sm mt-1">Track your revenue and recent invoicing activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{card.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" /> Monthly Revenue
          </h3>
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
              <BarChart data={summary.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(value) => `₹${value >= 1000 ? (value/1000) + 'k' : value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" /> Recent Invoices
          </h3>
          <div className="space-y-4">
            {summary.recentInvoices.length > 0 ? summary.recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{inv.customer.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{inv.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700">₹{inv.totalAmount.toLocaleString('en-IN')}</p>
                  <span className={`text-[10px] items-center px-2 py-0.5 rounded-full font-medium ${
                    inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                    inv.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' :
                    inv.status === 'OVERDUE' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-sm italic text-center py-8">No recent invoices.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
