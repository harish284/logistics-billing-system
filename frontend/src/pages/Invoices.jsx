import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices, cancelInvoice } from '../services/api';
import { Plus, FileText, Calendar, DollarSign, User, Eye, Edit2, XCircle, AlertTriangle } from 'lucide-react';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelDialog, setCancelDialog] = useState({ show: false, invoiceId: null });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getInvoices();
      setInvoices(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch invoices from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCancelClick = (id) => {
    setCancelDialog({ show: true, invoiceId: id });
  };

  const confirmCancel = async () => {
    try {
      setLoading(true);
      await cancelInvoice(cancelDialog.invoiceId);
      setSuccess('Invoice cancelled successfully.');
      setError('');
      setCancelDialog({ show: false, invoiceId: null });
      fetchInvoices();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to cancel invoice.');
      setLoading(false);
    }
  };

  const statusColors = {
    DRAFT: 'bg-slate-100 text-slate-700',
    ISSUED: 'bg-blue-100 text-blue-700',
    PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-emerald-100 text-emerald-700',
    OVERDUE: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-500 line-through'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Invoices</h2>
          <p className="text-slate-500 text-sm mt-1">Generate and monitor client billing cycles.</p>
        </div>
        <Link to="/invoices/create" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md cursor-pointer">
          <Plus className="w-5 h-5" /> New Advanced Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div>
          <Alert type="error" message={error ? error : null} />
          <Alert type="success" message={success ? success : null} />
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Invoice #</th>
                    <th className="px-6 py-4 font-semibold">Customer ID</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Due Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-12"><Spinner /></td></tr>
                  ) : invoices.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">No invoices generated yet.</td></tr>
                  ) : (
                    invoices.map((inv, i) => (
                      <tr key={inv.id || i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-5">
                          <span className="text-slate-800 font-medium">{inv.invoiceNumber}</span>
                        </td>
                        <td className="px-6 py-5 text-slate-600 text-sm font-mono">{inv.customerId.slice(-6)}...</td>
                        <td className="px-6 py-5 text-slate-800 font-medium">₹{inv.totalAmount?.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                        <td className="px-6 py-5 text-slate-500 text-sm">{new Date(inv.dueDate).toLocaleDateString()}</td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${statusColors[inv.status] || 'bg-slate-100 text-slate-600'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 flex items-center justify-end gap-3 text-slate-400">
                          <Link to={`/invoices/${inv.id}/preview`} state={{ invoice: inv }} className="p-1 hover:text-blue-600 transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {inv.status !== 'CANCELLED' && (
                            <button onClick={() => handleCancelClick(inv.id)} className="p-1 hover:text-red-600 transition-colors" title="Cancel Invoice">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelDialog.show && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Cancel Invoice?</h3>
            <p className="text-slate-600 text-sm mb-6">Are you sure you want to cancel this invoice? This action will mark it as cancelled but keep it in your history.</p>
            <div className="flex gap-3 justify-end">
              <button disabled={loading} onClick={() => setCancelDialog({ show: false, invoiceId: null })} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50">
                Keep
              </button>
              <button disabled={loading} onClick={confirmCancel} className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-xl transition-colors shadow-sm focus:ring-4 focus:ring-red-500/20 text-sm flex items-center gap-2">
                {loading && <Spinner className="w-4 h-4 text-white" />} Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
