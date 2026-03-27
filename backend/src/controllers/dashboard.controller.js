const prisma = require('../db');

exports.getDashboardSummary = async (req, res) => {
  try {
    // Basic stats
    const totalInvoices = await prisma.invoice.count({
      where: {
        status: { not: 'CANCELLED' }
      }
    });
    
    // Total Revenue (sum of all non-cancelled invoices)
    const revenueAggregation = await prisma.invoice.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        status: { not: 'CANCELLED' }
      }
    });
    const totalRevenue = revenueAggregation._sum.totalAmount || 0;

    // Recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true } },
      }
    });

    // Monthly revenue (last 6 months) for Recharts
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of the month 6 months ago
    
    const invoicesForChart = await prisma.invoice.findMany({
      where: {
        issueDate: { gte: sixMonthsAgo },
        status: { not: 'CANCELLED' }
      },
      select: {
        totalAmount: true,
        issueDate: true
      }
    });

    // Aggregate by month
    const monthlyDataMap = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months cleanly
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyDataMap[label] = 0;
    }

    invoicesForChart.forEach(inv => {
      const d = new Date(inv.issueDate);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      if (monthlyDataMap[label] !== undefined) {
        monthlyDataMap[label] += inv.totalAmount;
      }
    });

    const monthlyRevenue = Object.keys(monthlyDataMap).map(key => ({
      name: key,
      revenue: monthlyDataMap[key]
    }));

    // Active Clients (Unique customers with at least one non-cancelled invoice)
    const activeClientsAggregation = await prisma.invoice.groupBy({
      by: ['customerId'],
      where: {
        status: { not: 'CANCELLED' }
      }
    });
    const activeClients = activeClientsAggregation.length;

    // Growth Rate Calculation (Current Month vs Previous Month)
    const currentMonthLabel = `${monthNames[new Date().getMonth()]} ${new Date().getFullYear().toString().substring(2)}`;
    
    let previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    const previousMonthLabel = `${monthNames[previousMonthDate.getMonth()]} ${previousMonthDate.getFullYear().toString().substring(2)}`;

    const currentMonthRev = monthlyDataMap[currentMonthLabel] || 0;
    const previousMonthRev = monthlyDataMap[previousMonthLabel] || 0;
    
    let growthRate = 0;
    if (previousMonthRev === 0) {
      growthRate = currentMonthRev > 0 ? 100 : 0;
    } else {
      growthRate = ((currentMonthRev - previousMonthRev) / previousMonthRev) * 100;
    }

    res.status(200).json({
      totalInvoices,
      totalRevenue,
      recentInvoices,
      monthlyRevenue,
      activeClients,
      growthRate
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};
