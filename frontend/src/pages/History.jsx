import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Trash2 } from 'lucide-react';
import { api } from '../api';

export default function History() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getInvoices().then(list => setInvoices(list.reverse())).catch(console.error);
  }, []);

  const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Xóa hóa đơn này?')) return;
    try {
      await api.deleteInvoice(id);
      setInvoices(invoices.filter(inv => inv.id !== id));
    } catch (e) {
      console.error(e);
      alert('Lỗi khi xóa hóa đơn');
    }
  };

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
            <button
              onClick={(e) => handleDelete(inv.id, e)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--danger)';
                e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'none';
              }}
              title="Xóa hóa đơn"
            >
              <Trash2 size={16} />
            </button>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
