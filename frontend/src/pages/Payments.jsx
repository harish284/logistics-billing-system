import React, { useState, useEffect } from 'react';
import { getPayments, addPayment } from '../services/api';
import { Plus, CreditCard, Calendar, DollarSign, FileText, Hash } from 'lucide-react';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    invoiceId: '', 
    amount: '', 
    paymentDate: new Date().toISOString().split('T')[0], 
    paymentMethod: 'CREDIT_CARD',
    reference: ''
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getPayments();
      setPayments(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch payments from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        paymentDate: new Date(formData.paymentDate).toISOString()
      };
      await addPayment(payload);
      setSuccess('Payment recorded successfully.');
      setFormData({ 
        invoiceId: '', 
        amount: '', 
        paymentDate: new Date().toISOString().split('T')[0], 
        paymentMethod: 'CREDIT_CARD',
        reference: ''
      });
      fetchPayments();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to add payment. Ensure Invoice ID exists.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Transactions & Payments</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor incoming cashflows and reconcile invoices.</p>
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
                    <th className="px-6 py-4 font-semibold">Txn Ref</th>
                    <th className="px-6 py-4 font-semibold">Invoice ID</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-12"><Spinner /></td></tr>
                  ) : payments.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">No transactions recorded.</td></tr>
                  ) : (
                    payments.map((p, i) => (
                      <tr key={p.id || i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-5 text-slate-600 text-sm font-mono">{p.reference || p.id?.slice(-8)}</td>
                        <td className="px-6 py-5 text-slate-600 text-sm font-mono">{p.invoiceId.slice(-6)}...</td>
                        <td className="px-6 py-5 text-slate-600 text-sm">{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td className="px-6 py-5">
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md">
                            +${p.amount?.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-slate-600 text-sm">{p.paymentMethod.replace('_', ' ')}</td>
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
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Post Payment</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" /> Invoice ID</label>
              <input required type="text" value={formData.invoiceId} onChange={e => setFormData({...formData, invoiceId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="UUID of target invoice" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-400" /> Amount ($)</label>
                <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="500.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> Date</label>
                <input required type="date" value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium text-slate-800" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Method</label>
                <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-medium text-slate-800">
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2"><Hash className="w-4 h-4 text-slate-400" /> Ref <span className="text-slate-400 font-normal">(Opt)</span></label>
                <input type="text" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800" placeholder="Txn ID" />
              </div>
            </div>
            <button disabled={submitting} type="submit" className="w-full mt-2 bg-purple-600 text-white font-medium py-3 rounded-xl hover:bg-purple-700 focus:ring-4 focus:ring-purple-500/20 active:bg-purple-800 transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm">
              {submitting ? <Spinner className="w-5 h-5 text-white" /> : <><Plus className="w-5 h-5" /> Post Payment</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
