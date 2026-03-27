import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Building2, UserCircle2 } from 'lucide-react';
import { getCustomers } from '../services/api';
import api from '../services/api';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [invoiceData, setInvoiceData] = useState({
    customerId: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: 'Thank you for your business.',
    terms: 'Please pay within 15 days.',
    discountAmount: 0,
    taxPercent: 18
  });

  const [items, setItems] = useState([
    { id: 1, description: '', quantity: 1, price: 0, total: 0 }
  ]);

  useEffect(() => {
    getCustomers()
      .then(res => setCustomers(res.data.data || res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Auto-calculate total
        if (field === 'quantity' || field === 'price') {
          const qty = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
          const price = parseFloat(field === 'price' ? value : item.price) || 0;
          updatedItem.total = qty * price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = parseFloat(invoiceData.discountAmount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * (invoiceData.taxPercent / 100);
  const totalAmount = taxableAmount + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceData.customerId) {
      alert('Please select a customer.');
      return;
    }
    
    // Clean up empty items
    const validItems = items.filter(i => i.description.trim() !== '' && i.total > 0);
    if (validItems.length === 0) {
      alert('Please add at least one valid item with a description and price.');
      return;
    }

    try {
      const payload = {
        ...invoiceData,
        taxAmount,
        subtotal,
        totalAmount,
        items: validItems
      };
      
      const res = await api.post('/invoices/manual', payload);
      alert('Invoice created successfully!');
      navigate(`/invoices/${res.data.id}/preview`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice.');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading components...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Create New Invoice</h2>
            <p className="text-slate-500 text-sm mt-1">Generate a professional, detailed invoice instantly.</p>
          </div>
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md">
          <Save className="w-5 h-5" /> Save Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Company Settings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 pointer-events-none">
            <Building2 className="w-40 h-40 -mt-10 -mr-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Building2 className="w-5 h-5 text-blue-600" /> From (Your Company)
          </h3>
          <div className="space-y-4 relative z-10">
            <p className="text-sm text-slate-500 italic bg-blue-50 p-3 rounded-lg border border-blue-100">These details are loaded from your global Company Profile configuration and will appear on the final PDF.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Issue Date</label>
                <input 
                  type="date"
                  required
                  value={invoiceData.issueDate}
                  onChange={e => setInvoiceData({...invoiceData, issueDate: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
                <input 
                  type="date"
                  required
                  value={invoiceData.dueDate}
                  onChange={e => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 pointer-events-none">
            <UserCircle2 className="w-40 h-40 -mt-10 -mr-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
            <UserCircle2 className="w-5 h-5 text-emerald-600" /> Bill To (Customer)
          </h3>
          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Customer</label>
              <select 
                required
                value={invoiceData.customerId}
                onChange={e => setInvoiceData({...invoiceData, customerId: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="">-- Select a Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Invoice Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold w-24">Quantity</th>
                <th className="pb-3 font-semibold w-32">Price</th>
                <th className="pb-3 font-semibold w-32">Amount</th>
                <th className="pb-3 font-semibold w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <tr key={item.id} className="group">
                  <td className="py-3 pr-4">
                    <input 
                      type="text" 
                      placeholder="e.g. Standard Shipping 10kg"
                      value={item.description}
                      onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-transparent focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none hover:border-slate-200 transition-all bg-slate-50 focus:bg-white"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input 
                      type="number" 
                      min="1" step="0.5"
                      value={item.quantity}
                      onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-transparent focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none hover:border-slate-200 transition-all bg-slate-50 focus:bg-white"
                    />
                  </td>
                  <td className="py-3 pr-4 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium font-sans">₹</span>
                    <input 
                      type="number" 
                      min="0" step="0.01"
                      value={item.price}
                      onChange={e => handleItemChange(item.id, 'price', e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-transparent focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none hover:border-slate-200 transition-all bg-slate-50 focus:bg-white"
                    />
                  </td>
                  <td className="py-3 pr-4 font-medium text-slate-700">
                    ₹{item.total.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </td>
                  <td className="py-3 text-center">
                    <button 
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button 
          type="button" 
          onClick={addItem}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 py-2 px-4 rounded-xl transition-colors hover:bg-blue-100"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Footer & Calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Customer Notes</h3>
            <textarea 
              value={invoiceData.notes}
              onChange={e => setInvoiceData({...invoiceData, notes: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Terms & Conditions</h3>
            <textarea 
              value={invoiceData.terms}
              onChange={e => setInvoiceData({...invoiceData, terms: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex justify-between items-center text-slate-600 py-2">
            <span>Subtotal</span>
            <span className="font-medium text-slate-800">₹{subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          
          <div className="flex justify-between items-center text-slate-600 py-2 border-t border-slate-100">
            <span className="flex items-center gap-2">
              Discount
            </span>
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium font-sans">₹</span>
              <input 
                type="number" 
                min="0" step="0.01"
                value={invoiceData.discountAmount}
                onChange={e => setInvoiceData({...invoiceData, discountAmount: e.target.value})}
                className="w-full pl-7 pr-3 py-1.5 text-right rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center text-slate-600 py-2 border-t border-slate-100">
            <span className="flex items-center gap-2">
              GST %
            </span>
            <div className="relative w-24">
              <input 
                type="number" 
                min="0" max="100" step="1"
                value={invoiceData.taxPercent}
                onChange={e => setInvoiceData({...invoiceData, taxPercent: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-right"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
            </div>
            <span className="font-medium text-slate-800">₹{taxAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
          
          <div className="flex justify-between items-center py-4 border-t-2 border-slate-200 mt-2">
            <span className="text-lg font-bold text-slate-800">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>
    </form>
  );
}
