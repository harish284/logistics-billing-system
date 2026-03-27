import React, { useState, useEffect } from 'react';
import { getCustomers, addCustomer } from '../services/api';
import { Plus, User, Mail, Phone } from 'lucide-react';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await getCustomers();
      setCustomers(res.data.data || res.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch customers from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await addCustomer(formData);
      setSuccess('Customer successfully boarded.');
      setFormData({ name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Unable to register customer. Check input fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Customers Directory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage all registered entities and logistical partners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Alert type="error" message={error && !submitting ? error : null} />
          <Alert type="success" message={success && !submitting ? success : null} />
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-1/3">Entity Name</th>
                    <th className="px-6 py-4 font-semibold w-1/3">Contact Information</th>
                    <th className="px-6 py-4 font-semibold w-1/3">Billing Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="3" className="px-6 py-12"><Spinner /></td></tr>
                  ) : customers.length === 0 ? (
                    <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">No customers registered yet.</td></tr>
                  ) : (
                    customers.map((c, i) => (
                      <tr key={c.id || i} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-slate-800 font-medium group-hover:text-blue-700 transition-colors">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1.5 text-sm">
                            <span className="flex items-center gap-2 text-slate-600"><Mail className="w-3.5 h-3.5 opacity-70" /> {c.email}</span>
                            {c.phone && <span className="flex items-center gap-2 text-slate-500"><Phone className="w-3.5 h-3.5 opacity-70" /> {c.phone}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-slate-600 text-sm leading-relaxed max-w-xs truncate">
                          {c.address || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit sticky top-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 tracking-tight">New Customer</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="billing@logisticspro.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="+91 9870000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Billing Address <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800 resize-none" placeholder="123 Thoothukudi, Transport City, TC 12345" />
            </div>
            <button disabled={submitting} type="submit" className="w-full mt-2 bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 active:bg-blue-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm">
              {submitting ? <Spinner className="w-5 h-5 text-white" /> : <><Plus className="w-5 h-5" /> Add Customer</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
