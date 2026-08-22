import React, { useState, useEffect } from 'react';
import { Download, BarChart3, FileSpreadsheet, Calendar } from 'lucide-react';
import API from '../../api/axios';

const AdminReportsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics')
      .then((res) => {
        if (res.success) setAnalytics(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const exportCSV = (filename, rows) => {
    const processRow = (row) =>
      row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',');
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(processRow).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSalesReport = () => {
    if (!analytics?.recentOrders) return;
    const headers = ['Order Number', 'Customer Name', 'Amount (PKR)', 'Payment Method', 'Status', 'Date'];
    const rows = analytics.recentOrders.map((o) => [
      o.orderNumber,
      o.customerInfo?.fullName,
      o.totalAmount,
      o.paymentMethod,
      o.orderStatus,
      new Date(o.createdAt).toLocaleDateString(),
    ]);
    exportCSV('Gentora_Sales_Report.csv', [headers, ...rows]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">Reports & Analytics Export</h1>
        <p className="text-xs text-slate-500">Generate and export business performance and inventory audit reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
          <div className="p-3 bg-emerald-50 text-gentora-emerald rounded-xl w-fit">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Sales & Orders Report</h3>
            <p className="text-xs text-slate-500 mt-1">Export recent sales transactions, customer payment status, and order totals.</p>
          </div>
          <button
            onClick={handleExportSalesReport}
            className="w-full py-2.5 bg-gentora-emerald text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Sales CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
