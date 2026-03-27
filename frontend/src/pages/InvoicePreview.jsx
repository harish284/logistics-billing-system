import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function InvoicePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming we have an endpoint or we just filter getInvoices()
    api.get('/invoices')
      .then(res => {
        const found = res.data.find(i => i.id === id);
        if (found) setInvoice(found);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Invoice...</div>;
  if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found!</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Floating Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 print:hidden sticky top-4 z-50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-slate-50">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all border border-slate-200">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* A4 Paper Simulation */}
      <div className="bg-white p-12 shadow-2xl border border-slate-300 print:shadow-none print:border-none print:p-0 mx-auto" style={{ minHeight: '297mm', maxWidth: '210mm' }}>
        
        {/* Main Bordered Box */}
        <div className="border-2 border-slate-800 p-8 h-full">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
            <div className="flex gap-4 items-center">
              {/* Logo Placeholder */}
              {/* <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 flex items-center justify-center font-bold text-blue-700 rounded-lg text-xs">
                LOGO
              </div> */}
              <div>
                <h1 className="text-2xl font-extrabold text-blue-800 tracking-tight">LOGISTICS PRO</h1>
                <div className="mt-1 text-slate-700 text-sm space-y-0.5">
                  <p>123 Thoothukudi, Transport City, TC 12345</p>
                  <p>Phone: +91 9875641230</p>
                  <p>Email: billing@logisticspro.com</p>
                  <p className="font-semibold text-slate-800">GSTIN: GST-9876543210</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-widest mb-4">TAX INVOICE</h2>
              <div className="text-slate-800 space-y-1">
                <p className="text-sm"><span className="font-semibold w-24 inline-block">Invoice No:</span> <span>{invoice.invoiceNumber}</span></p>
                <p className="text-sm"><span className="font-semibold w-24 inline-block">Date:</span> <span>{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</span></p>
                <p className="text-sm"><span className="font-semibold w-24 inline-block">Due Date:</span> <span>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span></p>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase bg-slate-100 p-2 border-y-2 border-slate-800 inline-block w-full">Bill To (Customer)</h3>
            <div className="text-slate-800 px-2 mt-3 space-y-0.5">
              <p className="font-bold text-lg text-blue-900">{invoice.customer?.name}</p>
              <p>{invoice.customer?.address || 'Address not provided'}</p>
              <p>Phone: {invoice.customer?.phone || 'N/A'}</p>
              <p>Email: {invoice.customer?.email}</p>
              <p className="font-semibold text-slate-800 mt-1">GSTIN: {invoice.customer?.gstNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6 text-left border-collapse border-2 border-slate-800">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-800">
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-800 text-center w-12">S.No</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-800 uppercase">Item Name</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-800 uppercase text-center w-24">Quantity</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 border-r border-slate-800 uppercase text-right w-32">Price (₹)</th>
                <th className="py-2 px-3 text-sm font-bold text-slate-800 uppercase text-right w-32">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoice.items && invoice.items.length > 0 ? invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-800 group hover:bg-slate-50">
                  <td className="py-2 px-3 text-sm text-slate-800 border-r border-slate-800 text-center font-medium">{idx + 1}</td>
                  <td className="py-2 px-3 text-sm text-slate-800 border-r border-slate-800 font-medium">{item.description}</td>
                  <td className="py-2 px-3 text-sm text-slate-800 border-r border-slate-800 text-center font-medium">{item.quantity}</td>
                  <td className="py-2 px-3 text-sm text-slate-800 border-r border-slate-800 text-right font-medium">₹{parseFloat(item.price).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="py-2 px-3 text-sm font-bold text-slate-900 text-right">₹{parseFloat(item.total).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-800 text-sm font-semibold border-t border-slate-800">Standard Shipment Invoice</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals Box */}
          <div className="flex justify-end mb-8">
            <table className="w-80 border-collapse border-2 border-slate-800">
              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="py-2 px-4 text-sm text-slate-800 font-bold border-r border-slate-800 bg-slate-50 uppercase">Subtotal</td>
                  <td className="py-2 px-4 text-sm font-bold text-slate-800 text-right">₹{(invoice.subtotal || invoice.totalAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                </tr>
                {invoice.taxAmount > 0 && (
                  <tr className="border-b border-slate-800">
                    <td className="py-2 px-4 text-sm text-slate-800 font-bold border-r border-slate-800 bg-slate-50 uppercase">GST (Tax)</td>
                    <td className="py-2 px-4 text-sm font-bold text-slate-800 text-right">₹{invoice.taxAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                )}
                {invoice.discountAmount > 0 && (
                  <tr className="border-b border-slate-800">
                    <td className="py-2 px-4 text-sm text-slate-800 font-bold border-r border-slate-800 bg-slate-50 uppercase">Discount</td>
                    <td className="py-2 px-4 text-sm font-bold text-slate-800 text-right">-₹{invoice.discountAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-3 px-4 text-base font-extrabold text-blue-900 border-r border-slate-800 bg-slate-200 uppercase tracking-wider">Final Total Amount</td>
                  <td className="py-3 px-4 text-lg font-extrabold text-blue-900 text-right bg-slate-200">₹{invoice.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-slate-800 pt-6 flex justify-between items-end">
            <div className="w-2/3 pr-8">
              {invoice.notes && (
                <div className="mb-4">
                  <h4 className="font-bold text-slate-800 text-sm uppercase mb-1 bg-slate-100 p-1 px-2 border border-slate-200 inline-block">Notes</h4>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap mt-1 px-1 font-medium">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div className="mb-4">
                  <h4 className="font-bold text-slate-800 text-sm uppercase mb-1 bg-slate-100 p-1 px-2 border border-slate-200 inline-block">Terms & Conditions</h4>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed mt-1 px-1 font-medium">{invoice.terms}</p>
                </div>
              )}
              <div className="mt-8 font-extrabold text-blue-800 text-lg tracking-wide uppercase italic">
                Thank you for your business!
              </div>
            </div>
            
            <div className="w-1/3 flex flex-col items-center justify-end">
              <div className="w-full border-b-2 border-slate-800 mb-2 mt-20"></div>
              <p className="text-center font-bold text-slate-800 uppercase text-sm">Authorized Signature</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
