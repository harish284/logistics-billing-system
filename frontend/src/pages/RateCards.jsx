import React, { useState, useEffect } from 'react';
import { getRateCards, createRateCard, deleteRateCard, getCustomers } from '../services/api';
import { Plus, Search, Trash2, Edit, DollarSign, Globe, CheckCircle2, X } from 'lucide-react';

export default function RateCards() {
  const [rateCards, setRateCards] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    destination: '',
    baseRate: '',
    perKgRate: '',
    currency: 'USD',
    customerId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rateCardsRes, customersRes] = await Promise.all([
        getRateCards(),
        getCustomers()
      ]);
      setRateCards(rateCardsRes.data);
      // The getCustomers API returns { data: [...], total, page, limit }
      setCustomers(customersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRateCard({
        ...formData,
        customerId: formData.customerId === '' ? null : formData.customerId
      });
      setShowModal(false);
      setFormData({
        name: '', origin: '', destination: '', baseRate: '', perKgRate: '', currency: 'USD', customerId: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating rate card:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rate card?')) {
      try {
        await deleteRateCard(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting rate card:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rate Cards</h2>
          <p className="text-slate-500 text-sm mt-1">Manage pricing rules and customer-specific rates</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          New Rate Card
        </button>
      </div>

      {/* Stats/Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Rate Cards</p>
            <h3 className="text-3xl font-bold text-slate-800">{rateCards.length}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Global Rates</p>
            <h3 className="text-3xl font-bold text-slate-800">{rateCards.filter(r => !r.customerId).length}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <Globe className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Custom Rates</p>
            <h3 className="text-3xl font-bold text-slate-800">{rateCards.filter(r => r.customerId).length}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse cursor-default">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Name & Route</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Base Rate</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Per Kg</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rateCards.map((rate) => (
                <tr key={rate.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{rate.name}</div>
                    <div className="text-sm text-slate-500 mt-0.5">{rate.origin} → {rate.destination}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-700">{rate.currency} {rate.baseRate.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-700">{rate.currency} {rate.perKgRate.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {rate.customer ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        {rate.customer.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Global Target
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(rate.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Rate Card"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {rateCards.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <DollarSign className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-700">No rate cards found</p>
                      <p className="text-sm mt-1">Create your first rate card to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Create Rate Card</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Standard Overnight, Premium Express"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origin City/Zone</label>
                  <input
                    type="text"
                    name="origin"
                    required
                    value={formData.origin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. New York, Zone A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Destination City/Zone</label>
                  <input
                    type="text"
                    name="destination"
                    required
                    value={formData.destination}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Los Angeles, Zone B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Base Rate</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      name="baseRate"
                      required
                      value={formData.baseRate}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="50.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Per Kg Rate</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      name="perKgRate"
                      required
                      value={formData.perKgRate}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="2.50"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Specific Customer (Optional)</label>
                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="">-- Global Rate (Applies to everyone) --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1.5">If a customer is selected, this rate will override the global rate for their shipments on this route.</p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-md transition-all"
                >
                  Create Rate Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
