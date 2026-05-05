import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Trash2, CheckSquare, Square, Printer, Bluetooth, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import Receipt from '../components/Receipt';
import { connectBluetoothPrinter, printMultipleInvoicesBluetooth } from '../utils/bluetoothPrinter';

export default function History() {
  const [invoices, setInvoices] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [printingInvoices, setPrintingInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    api.getInvoices()
      .then(list => {
        setInvoices(list.reverse());
        setIsLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  }, []);

  const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Xóa hóa đơn này?')) return;
    try {
      await api.deleteInvoice(id);
      setInvoices(invoices.filter(inv => inv.id !== id));
      if (selectedIds.has(id)) {
        const nextIds = new Set(selectedIds);
        nextIds.delete(id);
        setSelectedIds(nextIds);
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi khi xóa hóa đơn');
    }
  };

  const toggleSelection = (id) => {
    const nextIds = new Set(selectedIds);
    if (nextIds.has(id)) {
      nextIds.delete(id);
    } else {
      nextIds.add(id);
    }
    setSelectedIds(nextIds);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === invoices.length) {
      setSelectedIds(new Set()); // deselect all
    } else {
      setSelectedIds(new Set(invoices.map(i => i.id))); // select all
    }
  };

  const handleSystemBatchPrint = () => {
    const toPrint = invoices.filter(inv => selectedIds.has(inv.id));
    if (toPrint.length === 0) return;
    
    setPrintingInvoices(toPrint);
    setTimeout(() => {
      window.print();
      // Clear after print dialog closes
      setTimeout(() => setPrintingInvoices([]), 1000);
    }, 300);
  };

  const handleBTBatchPrint = async () => {
    const toPrint = invoices.filter(inv => selectedIds.has(inv.id));
    if (toPrint.length === 0) return;

    try {
      await printMultipleInvoicesBluetooth(toPrint);
      alert('Đã in thành công!');
      setIsSelectMode(false);
      setSelectedIds(new Set());
    } catch (e) {
      if (e.message.includes('Chưa kết nối')) {
        if (confirm('Chưa kết nối máy in Bluetooth. Kết nối ngay?')) {
          try {
            await connectBluetoothPrinter();
            await printMultipleInvoicesBluetooth(toPrint);
            alert('Đã in thành công!');
            setIsSelectMode(false);
            setSelectedIds(new Set());
          } catch (connErr) {
            alert(connErr.message);
          }
        }
      } else {
        alert(e.message);
      }
    }
  };

  // Render Print View
  if (printingInvoices.length > 0) {
    return (
      <div>
        <div className="no-print app-container" style={{ paddingBottom: 20 }}>
          <button className="btn btn-outline" onClick={() => setPrintingInvoices([])}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => window.print()}>
            <Printer size={16} /> In lại
          </button>
        </div>
        <div className="print-only">
          {printingInvoices.map(inv => (
            <Receipt key={inv.id} data={inv} />
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="app-container loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">ĐANG TẢI...</div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ paddingBottom: selectedIds.size > 0 ? 160 : 90 }}>
      <div className="page-header animate-in">
        <h1>📄 Lịch Sử Hóa Đơn</h1>
        <p>{isSelectMode ? 'Chọn các hóa đơn cần in' : 'Nhấn vào hóa đơn để xem chi tiết & in lại'}</p>
        
        {invoices.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
            <button 
              className={`btn btn-sm ${isSelectMode ? 'btn-primary' : 'btn-outline'}`} 
              style={{ width: 'auto' }}
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                if (isSelectMode) setSelectedIds(new Set());
              }}
            >
              <CheckSquare size={16} /> {isSelectMode ? 'Hủy chọn' : 'Chọn nhiều'}
            </button>
            
            {isSelectMode && (
              <button className="btn btn-outline btn-sm" style={{ width: 'auto' }} onClick={handleSelectAll}>
                {selectedIds.size === invoices.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            )}
          </div>
        )}
      </div>

      {invoices.length === 0 && (
        <div className="empty-state animate-in">
          <FileText size={48} />
          <p>Chưa có hóa đơn nào</p>
        </div>
      )}

      {invoices.map((inv, i) => {
        const isSelected = selectedIds.has(inv.id);
        
        return (
          <div
            key={inv.id}
            className={`invoice-item animate-in ${isSelected ? 'selected' : ''}`}
            style={{ 
              animationDelay: `${i * 60}ms`,
              border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: isSelected ? 'var(--accent-glow)' : 'var(--bg-glass)'
            }}
            onClick={() => {
              if (isSelectMode) {
                toggleSelection(inv.id);
              } else {
                navigate(`/invoice/${inv.id}`);
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isSelectMode && (
                <div style={{ color: isSelected ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                  {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
              )}
              <div>
                <div className="invoice-room">{inv.roomName}</div>
                <div className="invoice-date">Tháng {inv.month} • {new Date(inv.createdAt).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="invoice-total">{formatVND(inv.total)}</div>
              {!isSelectMode && (
                <>
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
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Floating Action Bar for Batch Printing */}
      {isSelectMode && selectedIds.size > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 70, // above bottom nav
          left: 0,
          right: 0,
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 90,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: 4, fontWeight: '600' }}>
            Đã chọn: {selectedIds.size} hóa đơn
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBTBatchPrint}>
              <Bluetooth size={18} /> In BT ({selectedIds.size})
            </button>
            <button className="btn btn-outline" style={{ flex: 1, background: 'var(--bg-glass)' }} onClick={handleSystemBatchPrint}>
              <Printer size={18} /> In hệ thống ({selectedIds.size})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
