import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Bluetooth, Share2 } from 'lucide-react';
import { api } from '../api';
import Receipt from '../components/Receipt';
import { connectBluetoothPrinter, printInvoiceBluetooth } from '../utils/bluetoothPrinter';
import { shareInvoice } from '../utils/share';

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
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={async () => {
              try {
                await printInvoiceBluetooth(invoice);
              } catch (e) {
                if (e.message.includes('Chưa kết nối')) {
                  if (confirm('Chưa kết nối máy in Bluetooth. Kết nối ngay?')) {
                    await connectBluetoothPrinter();
                    await printInvoiceBluetooth(invoice);
                  }
                } else {
                  alert(e.message);
                }
              }
            }}>
              <Bluetooth size={16} /> In Bluetooth
            </button>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => window.print()}>
              <Printer size={16} /> In thường
            </button>
          </div>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary animate-in" style={{ background: '#0068FF', color: 'white', borderColor: '#0068FF' }} onClick={async () => {
          const isNativeShared = await shareInvoice(invoice);
          if (!isNativeShared) {
            if (confirm('Đã copy nội dung hóa đơn! Bạn có muốn mở Zalo để dán không?')) {
              window.open('https://zalo.me', '_blank');
            }
          }
        }}>
          <Share2 size={18} /> Gửi qua Zalo/Tin nhắn
        </button>

        <button className="btn btn-primary animate-in" onClick={async () => {
          try {
            await printInvoiceBluetooth(invoice);
          } catch (e) {
            if (e.message.includes('Chưa kết nối')) {
              if (confirm('Chưa kết nối máy in Bluetooth. Kết nối ngay?')) {
                await connectBluetoothPrinter();
                await printInvoiceBluetooth(invoice);
              }
            } else {
              alert(e.message);
            }
          }
        }}>
          <Bluetooth size={18} /> In qua Bluetooth
        </button>
        
        <button className="btn btn-outline animate-in" onClick={() => { setShowReceipt(true); setTimeout(() => window.print(), 300); }}>
          <Printer size={18} /> In qua hệ thống (iOS / PC)
        </button>
      </div>
    </div>
  );
}
