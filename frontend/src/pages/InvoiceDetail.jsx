import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { api } from '../api';
import Receipt from '../components/Receipt';

export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    api.getInvoice(Number(invoiceId)).then(setInvoice).catch(console.error);
  }, [invoiceId]);

  const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  if (!invoice) {
    return <div className="app-container"><p style={{ textAlign: 'center', paddingTop: 80, color: 'var(--text-muted)' }}>Đang tải...</p></div>;
  }

  if (showReceipt) {
    return (
      <div>
        <div className="no-print app-container" style={{ paddingBottom: 20 }}>
          <button className="btn btn-outline" onClick={() => setShowReceipt(false)}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => window.print()}>
            <Printer size={16} /> In lại
          </button>
        </div>
        <Receipt data={invoice} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-header animate-in">
        <button className="btn btn-outline btn-sm" style={{ width: 'auto', marginBottom: 12 }} onClick={() => navigate('/history')}>
          <ArrowLeft size={14} /> Trở về
        </button>
        <h1>📋 Chi Tiết Hóa Đơn</h1>
        <p>{invoice.roomName} — Tháng {invoice.month}</p>
      </div>

      <div className="card animate-in">
        <div className="card-title">🏠 Thông tin phòng</div>
        <table className="summary-table">
          <tbody>
            <tr><td>Phòng</td><td>{invoice.roomName}</td></tr>
            <tr><td>Tháng</td><td>{invoice.month}</td></tr>
            <tr><td>Ngày tạo</td><td>{new Date(invoice.createdAt).toLocaleDateString('vi-VN')}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card animate-in">
        <div className="card-title">💰 Chi tiết chi phí</div>
        <table className="summary-table">
          <tbody>
            <tr><td>Tiền phòng</td><td>{formatVND(invoice.roomPrice)}</td></tr>
            <tr><td>Điện: {invoice.oldElec} → {invoice.newElec} ({invoice.elecUsage} kWh × {formatVND(invoice.elecPrice)})</td><td>{formatVND(invoice.elecCost)}</td></tr>
            <tr><td>Nước: {invoice.oldWater} → {invoice.newWater} ({invoice.waterUsage} m³ × {formatVND(invoice.waterPrice)})</td><td>{formatVND(invoice.waterCost)}</td></tr>
            <tr><td>Rác</td><td>{formatVND(invoice.trashFee)}</td></tr>
            <tr><td>Internet</td><td>{formatVND(invoice.internetFee)}</td></tr>
            {invoice.otherFee > 0 && <tr><td>{invoice.otherNote || 'Khác'}</td><td>{formatVND(invoice.otherFee)}</td></tr>}
            <tr className="total-row"><td>TỔNG CỘNG</td><td>{formatVND(invoice.total)}</td></tr>
          </tbody>
        </table>
      </div>

      <button className="btn btn-success animate-in" onClick={() => { setShowReceipt(true); setTimeout(() => window.print(), 300); }}>
        <Printer size={18} /> In hóa đơn
      </button>
    </div>
  );
}
