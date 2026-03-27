import React, { useState, useEffect } from 'react';
import { getShipments, addShipment } from '../services/api';
import { Plus, Truck, MapPin, Package, User } from 'lucide-react';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    trackingNumber: `TRK-${Date.now().toString().slice(-6)}`, 
    origin: '', 
    destination: '', 
    weight: '',
    status: 'PENDING',
    customerId: ''
  });

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await getShipments();
      setShipments(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch shipments from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...formData,
        weight: Number(formData.weight)
      };
      await addShipment(payload);
      setSuccess('Shipment created successfully.');
      setFormData({ 
        trackingNumber: `TRK-${Date.now().toString().slice(-6)}`, 
        origin: '', 
        destination: '', 
        weight: '',
        status: 'PENDING',
        customerId: ''
      });
      fetchShipments();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to dispatch shipment. Verify Customer ID exists.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    PENDING: 'bg-slate-100 text-slate-700',
    IN_TRANSIT: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Active Shipments</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor logistical operations and transitions.</p>
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
                    <th className="px-6 py-4 font-semibold">Tracking #</th>
                    <th className="px-6 py-4 font-semibold">Customer ID</th>
                    <th className="px-6 py-4 font-semibold">Route</th>
                    <th className="px-6 py-4 font-semibold">Weight</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-12"><Spinner /></td></tr>
                  ) : shipments.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">No active shipments available.</td></tr>
                  ) : (
                    shipments.map((s, i) => (
                      <tr key={s.id || i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-800 font-medium">{s.trackingNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-slate-600 text-sm font-mono">{s.customerId?.slice(-6)}...</td>
                        <td className="px-6 py-5 text-slate-600">
                          <div className="flex items-center gap-2 text-sm">
                            <span>{s.origin}</span>
                            <span className="text-slate-300">&rarr;</span>
                            <span>{s.destination}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-slate-600 text-sm">{s.weight} kg</td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${statusColors[s.status] || 'bg-slate-100 text-slate-600'}`}>
                            {s.status}
                          </span>
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
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Dispatch Shipment</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2"><Truck className="w-4 h-4 text-slate-400" /> Tracking Number</label>
              <input required type="text" value={formData.trackingNumber} onChange={e => setFormData({...formData, trackingNumber: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> Customer ID</label>
              <input required type="text" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="UUID of customer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> Origin</label>
                <input required type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="NY" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> Destination</label>
                <input required type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="CA" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Weight (kg)</label>
                <input required type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all font-medium text-slate-800" placeholder="10.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all font-medium text-slate-800">
                  <option value="PENDING">Pending</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>
            </div>
            <button disabled={submitting} type="submit" className="w-full mt-2 bg-amber-500 text-white font-medium py-3 rounded-xl hover:bg-amber-600 focus:ring-4 focus:ring-amber-500/20 active:bg-amber-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm">
              {submitting ? <Spinner className="w-5 h-5 text-white" /> : <><Plus className="w-5 h-5" /> Dispatch Shipment</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
