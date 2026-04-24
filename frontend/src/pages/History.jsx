import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import { api } from '../api';

export default function History() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getInvoices().then(list => setInvoices(list.reverse())).catch(console.error);
  }, []);

  const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  return (
    <div className="app-container">
      <div className="page-header animate-in">
        <h1>📄 Lịch Sử Hóa Đơn</h1>
        <p>Nhấn vào hóa đơn để xem chi tiết & in lại</p>
      </div>

      {invoices.length === 0 && (
        <div className="empty-state animate-in">
          <FileText size={48} />
          <p>Chưa có hóa đơn nào</p>
        </div>
      )}

      {invoices.map((inv, i) => (
        <div
          key={inv.id}
          className="invoice-item animate-in"
          style={{ animationDelay: `${i * 60}ms` }}
          onClick={() => navigate(`/invoice/${inv.id}`)}
        >
          <div>
            <div className="invoice-room">{inv.roomName}</div>
            <div className="invoice-date">Tháng {inv.month} • {new Date(inv.createdAt).toLocaleDateString('vi-VN')}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="invoice-total">{formatVND(inv.total)}</div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
