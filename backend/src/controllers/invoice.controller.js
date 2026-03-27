const billingService = require('../services/billing.service');
const prisma = require('../db');
const puppeteer = require('puppeteer');

const generateInvoice = async (req, res) => {
  try {
    const { customerId, shipmentIds } = req.body;
    
    if (!customerId || !Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      return res.status(400).json({ error: 'Valid customerId and array of shipmentIds are required' });
    }

    const result = await billingService.generateInvoice(customerId, shipmentIds);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('No valid, unbilled shipments') || error.message.includes('No applicable rate card')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const calculateShipmentPrice = async (req, res) => {
  try {
    const shipment = await billingService.calculatePricing(req.params.shipmentId);
    res.status(200).json(shipment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { 
        customer: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const invoice = await billingService.updateInvoiceStatus(req.params.id, status);
    res.status(200).json(invoice);
  } catch (error) {
    if (error.message === 'Invalid invoice status') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const createManualInvoice = async (req, res) => {
  try {
    const { customerId, issueDate, dueDate, items, subtotal, taxAmount, discountAmount, totalAmount, notes, terms } = req.body;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomStr}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        subtotal: parseFloat(subtotal) || 0,
        taxAmount: parseFloat(taxAmount) || 0,
        discountAmount: parseFloat(discountAmount) || 0,
        totalAmount: parseFloat(totalAmount) || 0,
        notes,
        terms,
        status: 'ISSUED',
        items: {
          create: items && items.length > 0 ? items.map(item => ({
            description: item.description,
            quantity: parseFloat(item.quantity) || 1,
            price: parseFloat(item.price) || 0,
            total: parseFloat(item.total) || 0
          })) : []
        }
      },
      include: {
        items: true,
        customer: true
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating manual invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

const generatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true, customer: true }
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    let company = await prisma.companyProfile.findFirst();
    if (!company) {
      company = {
        name: 'Logistics Pro',
        address: '123 Freight Way, Transport City, TC 12345',
        phone: '+1 (555) 123-4567',
        email: 'billing@logisticspro.com',
        gstNumber: 'GST-9876543210'
      };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #1e293b; font-size: 14px; }
          .invoice-box { border: 2px solid #1e293b; padding: 30px; margin: auto; max-width: 800px; }
          
          .header-row { display: table; width: 100%; border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 20px; }
          .header-col { display: table-cell; vertical-align: top; }
          .logo-box { display: inline-block; width: 60px; height: 60px; background: #eff6ff; border: 2px solid #bfdbfe; color: #1d4ed8; text-align: center; line-height: 60px; font-weight: bold; border-radius: 8px; margin-right: 15px; float: left; }
          .company-info { float: left; }
          h1 { margin: 0 0 5px 0; color: #1e40af; font-size: 24px; font-weight: 800; }
          h2 { margin: 0 0 10px 0; color: #1e293b; font-size: 28px; font-weight: 800; letter-spacing: 2px; }
          p { margin: 0 0 4px 0; }
          
          .bill-to-section { margin-bottom: 25px; }
          .bill-to-title { font-weight: bold; font-size: 14px; text-transform: uppercase; background: #f1f5f9; padding: 6px; border-top: 2px solid #1e293b; border-bottom: 2px solid #1e293b; display: inline-block; width: 100%; box-sizing: border-box; }
          .bill-to-details { padding: 10px 8px; }
          .customer-name { font-size: 18px; font-weight: bold; color: #1e3a8a; margin-bottom: 5px; }
          
          table.items-table { width: 100%; border-collapse: collapse; border: 2px solid #1e293b; margin-bottom: 25px; }
          table.items-table th { background: #f1f5f9; border-bottom: 2px solid #1e293b; border-right: 1px solid #1e293b; padding: 8px 12px; text-transform: uppercase; font-size: 13px; }
          table.items-table td { border-bottom: 1px solid #1e293b; border-right: 1px solid #1e293b; padding: 8px 12px; }
          table.items-table th:last-child, table.items-table td:last-child { border-right: none; }
          
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          
          .totals-wrapper { text-align: right; margin-bottom: 30px; }
          table.totals-table { width: 320px; border-collapse: collapse; border: 2px solid #1e293b; display: inline-table; }
          table.totals-table td { padding: 8px 12px; }
          table.totals-table tr.border-bottom td { border-bottom: 1px solid #1e293b; }
          table.totals-table td.label-col { background: #f8fafc; font-weight: bold; border-right: 1px solid #1e293b; text-transform: uppercase; font-size: 13px; }
          table.totals-table tr.final-row td { background: #e2e8f0; font-size: 16px; font-weight: 800; color: #1e3a8a; }
          
          .footer-section { border-top: 2px solid #1e293b; padding-top: 20px; display: table; width: 100%; }
          .footer-left { display: table-cell; width: 65%; vertical-align: top; padding-right: 30px; }
          .footer-right { display: table-cell; width: 35%; vertical-align: bottom; text-align: center; }
          
          .note-box { margin-bottom: 15px; }
          .note-title { font-weight: bold; text-transform: uppercase; font-size: 13px; background: #f1f5f9; padding: 4px 8px; border: 1px solid #e2e8f0; display: inline-block; margin-bottom: 5px; }
          .note-content { font-size: 13px; white-space: pre-wrap; line-height: 1.5; padding: 0 4px; }
          
          .sig-line { border-bottom: 2px solid #1e293b; margin-bottom: 5px; margin-top: 60px; }
          .sig-text { font-weight: bold; text-transform: uppercase; font-size: 13px; }
          
          .thank-you { margin-top: 30px; font-size: 18px; font-weight: 800; color: #1e40af; text-transform: uppercase; font-style: italic; letter-spacing: 1px; }
          .clearfix:after { content: ""; display: table; clear: both; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          
          <div class="header-row">
            <div class="header-col" style="width: 60%;">
              <div class="logo-box">LOGO</div>
              <div class="company-info">
                <h1>${company.name}</h1>
                <p>${company.address || ''}</p>
                <p>Phone: ${company.phone || ''}</p>
                <p>Email: ${company.email || ''}</p>
                <p class="font-bold">GSTIN: ${company.gstNumber || 'N/A'}</p>
              </div>
            </div>
            <div class="header-col text-right" style="width: 40%;">
              <h2>TAX INVOICE</h2>
              <table style="width: 100%; text-align: right;">
                <tr><td style="font-weight: bold; width: 100px;">Invoice No:</td><td>${invoice.invoiceNumber}</td></tr>
                <tr><td style="font-weight: bold;">Date:</td><td>${new Date(invoice.issueDate).toLocaleDateString('en-IN')}</td></tr>
                <tr><td style="font-weight: bold;">Due Date:</td><td>${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</td></tr>
              </table>
            </div>
          </div>
          
          <div class="bill-to-section">
            <div class="bill-to-title">Bill To (Customer)</div>
            <div class="bill-to-details">
              <div class="customer-name">${invoice.customer.name}</div>
              <p>${invoice.customer.address || 'Address not provided'}</p>
              <p>Phone: ${invoice.customer.phone || 'N/A'}</p>
              <p>Email: ${invoice.customer.email}</p>
              <p class="font-bold" style="margin-top: 4px;">GSTIN: ${invoice.customer.gstNumber || 'N/A'}</p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 40px;">S.No</th>
                <th style="text-align: left;">Item Name</th>
                <th class="text-center" style="width: 80px;">Quantity</th>
                <th class="text-right" style="width: 120px;">Price (&#8377;)</th>
                <th class="text-right" style="width: 120px;">Total (&#8377;)</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.length > 0 ? invoice.items.map((i, idx) => `
                <tr>
                  <td class="text-center font-bold">${idx + 1}</td>
                  <td>${i.description}</td>
                  <td class="text-center">${i.quantity}</td>
                  <td class="text-right">&#8377;${parseFloat(i.price).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td class="text-right font-bold">&#8377;${parseFloat(i.total).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" class="text-center" style="padding: 20px; font-style: italic; color: #64748b;">Standard Shipment Invoice</td>
                </tr>
              `}
            </tbody>
          </table>
          
          <div class="totals-wrapper">
            <table class="totals-table">
              <tr class="border-bottom">
                <td class="label-col">Subtotal</td>
                <td class="text-right font-bold">&#8377;${(parseFloat(invoice.subtotal) || parseFloat(invoice.totalAmount)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
              </tr>
              ${invoice.taxAmount > 0 ? `
              <tr class="border-bottom">
                <td class="label-col">GST (Tax)</td>
                <td class="text-right font-bold">&#8377;${parseFloat(invoice.taxAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
              </tr>
              ` : ''}
              ${invoice.discountAmount > 0 ? `
              <tr class="border-bottom">
                <td class="label-col">Discount</td>
                <td class="text-right font-bold">-&#8377;${parseFloat(invoice.discountAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
              </tr>
              ` : ''}
              <tr class="final-row">
                <td class="label-col" style="border-right: 1px solid #1e293b;">Final Total</td>
                <td class="text-right">&#8377;${parseFloat(invoice.totalAmount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
              </tr>
            </table>
          </div>
          
          <div class="footer-section">
            <div class="footer-left">
              ${invoice.notes ? `
                <div class="note-box">
                  <div class="note-title">Notes</div>
                  <div class="note-content">${invoice.notes}</div>
                </div>
              ` : ''}
              ${invoice.terms ? `
                <div class="note-box">
                  <div class="note-title">Terms & Conditions</div>
                  <div class="note-content">${invoice.terms}</div>
                </div>
              ` : ''}
              <div class="thank-you">Thank you for your business!</div>
            </div>
            <div class="footer-right">
              <div class="sig-line"></div>
              <div class="sig-text">Authorized Signature</div>
            </div>
          </div>
          
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if invoice exists
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Update status to CANCELLED
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
    
    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    res.status(500).json({ error: 'Failed to cancel invoice' });
  }
};

module.exports = {
  generateInvoice,
  calculateShipmentPrice,
  getInvoices,
  updateInvoiceStatus,
  createManualInvoice,
  generatePdf,
  cancelInvoice
};
