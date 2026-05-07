import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calculator as CalcIcon, Printer, ArrowLeft, Bluetooth, Share2, Trash2, X } from 'lucide-react';
import { api } from '../api';
import Receipt from '../components/Receipt';
import { connectBluetoothPrinter, printInvoiceBluetooth } from '../utils/bluetoothPrinter';
import { shareInvoiceAsImage } from '../utils/share';

export default function Calculator() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    oldElec: '', newElec: '',
    oldWater: '', newWater: '',
    otherFee: '0', otherNote: '',
    month: new Date().toISOString().slice(0, 7),
    invoiceDate: '',
  });
  const [result, setResult] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    Promise.all([api.getRooms(), api.getSettings()])
      .then(([rooms, s]) => {
        const found = rooms.find(r => r.id === Number(roomId));
        setRoom(found);
        setSettings(s);
        setIsLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  }, [roomId]);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  const calculate = async () => {
    if (!settings || !room) return;
    
    if (form.oldElec === '' || form.newElec === '' || form.oldWater === '' || form.newWater === '') {
      alert('Vui lòng nhập đầy đủ chỉ số Điện và Nước (nếu không dùng thì nhập 0)!');
      return;
    }

    const oldE = Number(form.oldElec);
    const newE = Number(form.newElec);
    const oldW = Number(form.oldWater);
    const newW = Number(form.newWater);

    if (newE < oldE) {
      alert('Lỗi: Số điện mới phải lớn hơn hoặc bằng số điện cũ!');
      return;
    }
    
    if (newW < oldW) {
      alert('Lỗi: Số nước mới phải lớn hơn hoặc bằng số nước cũ!');
      return;
    }

    const elecUsage = newE - oldE;
    const waterUsage = newW - oldW;
    
    const activeElecPrice = room.electricityPrice ?? settings.electricityPrice;
    const activeWaterPrice = room.waterPrice ?? settings.waterPrice;
    const activeTrashFee = room.trashFee ?? settings.trashFee;
    const activeInternetFee = room.internetFee ?? settings.internetFee;

    const elecCost = elecUsage * activeElecPrice;
    const waterCost = waterUsage * activeWaterPrice;
    const other = Number(form.otherFee) || 0;

    const total = room.price + elecCost + waterCost + activeTrashFee + activeInternetFee + other;

    const payload = {
      roomName: room.name,
      roomPrice: room.price,
      month: form.month,
      invoiceDate: form.invoiceDate || new Date().toISOString().slice(0, 10),
      oldElec: Number(form.oldElec),
      newElec: Number(form.newElec),
      elecUsage, elecPrice: activeElecPrice, elecCost,
      oldWater: Number(form.oldWater),
      newWater: Number(form.newWater),
      waterUsage, waterPrice: activeWaterPrice, waterCost,
      trashFee: activeTrashFee,
      internetFee: activeInternetFee,
      otherFee: other,
      otherNote: form.otherNote,
      total,
      landlordName: settings.landlordName,
      landlordPhone: settings.landlordPhone,
      address: settings.address,
    };

    try {
      const saved = await api.createInvoice(payload);
      setResult(saved);
      alert('Đã tính và tự động lưu hóa đơn!');
    } catch (e) {
      console.error(e);
      alert('Lỗi khi tự động lưu hóa đơn');
    }
  };

  const handlePrintBT = async () => {
    if (!result) return;
    try {
      await printInvoiceBluetooth(result);
      alert('Đã in thành công!');
      navigate('/history');
    } catch (e) {
      if (e.message.includes('Chưa kết nối')) {
        if (confirm('Chưa kết nối máy in Bluetooth. Kết nối ngay?')) {
          await connectBluetoothPrinter();
          await printInvoiceBluetooth(result);
          alert('Đã in thành công!');
          navigate('/history');
        }
      } else {
        alert(e.message);
      }
    }
  };

  const handlePrintSystem = async () => {
    if (!result) return;
    setShowReceipt(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => navigate('/history'), 1000);
    }, 300);
  };

  const handleShare = async () => {
    if (!result) return;
    
    const captureEl = document.getElementById('receipt-capture');
    if (!captureEl) return;
    
    const isNativeShared = await shareInvoiceAsImage(result, captureEl);
    if (!isNativeShared) {
      if (confirm('Đã tải ảnh hóa đơn xuống máy! Bạn có muốn mở Zalo để gửi không?')) {
        window.open('https://zalo.me', '_blank');
      }
    }
    navigate('/history');
  };

  if (isLoading || !room || !settings) {
    return (
      <div className="app-container loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">ĐANG TẢI...</div>
      </div>
    );
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
        <Receipt data={result} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-header animate-in">
        <button className="btn btn-outline btn-sm" style={{ width: 'auto', marginBottom: 12 }} onClick={() => navigate('/')}>
          <ArrowLeft size={14} /> Trở về
        </button>
        <h1>⚡ Tính Tiền {room.name}</h1>
        <p>Tháng {form.month}</p>
      </div>

      {/* Time */}
      <div className="card animate-in">
        <div className="card-title">📅 Thời gian</div>
        <div className="form-row">
          <div className="form-group">
            <label>Tháng hóa đơn</label>
            <input type="month" value={form.month} onChange={e => update('month', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Ngày in/lập HĐ</label>
            <input type="date" value={form.invoiceDate} onChange={e => update('invoiceDate', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Electricity */}
      <div className="card animate-in">
        <div className="card-title">⚡ Chỉ số điện</div>
        <div className="form-row">
          <div className="form-group">
            <label>Số cũ (kWh)</label>
            <input type="number" placeholder="0" value={form.oldElec} onChange={e => update('oldElec', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Số mới (kWh)</label>
            <input type="number" placeholder="0" value={form.newElec} onChange={e => update('newElec', e.target.value)} />
          </div>
        </div>
        {form.oldElec !== '' && form.newElec !== '' && (
          Number(form.newElec) < Number(form.oldElec) ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--danger)', marginTop: 4 }}>
              Số mới không được nhỏ hơn số cũ!
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-light)', marginTop: 4 }}>
              Tiêu thụ: <strong>{Number(form.newElec) - Number(form.oldElec)} kWh</strong> × {formatVND(room.electricityPrice ?? settings.electricityPrice)}
            </div>
          )
        )}
      </div>

      {/* Water */}
      <div className="card animate-in">
        <div className="card-title">💧 Chỉ số nước</div>
        <div className="form-row">
          <div className="form-group">
            <label>Số cũ (m³)</label>
            <input type="number" placeholder="0" value={form.oldWater} onChange={e => update('oldWater', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Số mới (m³)</label>
            <input type="number" placeholder="0" value={form.newWater} onChange={e => update('newWater', e.target.value)} />
          </div>
        </div>
        {form.oldWater !== '' && form.newWater !== '' && (
          Number(form.newWater) < Number(form.oldWater) ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--danger)', marginTop: 4 }}>
              Số mới không được nhỏ hơn số cũ!
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: 4 }}>
              Tiêu thụ: <strong>{Number(form.newWater) - Number(form.oldWater)} m³</strong> × {formatVND(room.waterPrice ?? settings.waterPrice)}
            </div>
          )
        )}
      </div>

      {/* Other fees */}
      <div className="card animate-in">
        <div className="card-title">📋 Chi phí khác</div>
        <div className="form-group">
          <label>Số tiền (VNĐ)</label>
          <input type="number" placeholder="0" value={form.otherFee} onChange={e => update('otherFee', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Ghi chú</label>
          <input type="text" placeholder="VD: Sửa vòi nước..." value={form.otherNote} onChange={e => update('otherNote', e.target.value)} />
        </div>
      </div>

      {/* Calculate */}
      <button className="btn btn-primary animate-in" onClick={calculate}>
        <CalcIcon size={18} /> Tính tiền
      </button>

      {/* Result Modal */}
      {result && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>💰 Tổng kết hóa đơn</h2>
              <button className="modal-close" onClick={() => {
                // They close the modal without deleting -> it's already saved, so let's go to history
                navigate('/history');
              }}>
                <X size={20} />
              </button>
            </div>
            
            <table className="summary-table">
              <tbody>
                <tr><td>Tiền phòng</td><td>{formatVND(result.roomPrice)}</td></tr>
                <tr><td>Tiền điện ({result.elecUsage} kWh)</td><td>{formatVND(result.elecCost)}</td></tr>
                <tr><td>Tiền nước ({result.waterUsage} m³)</td><td>{formatVND(result.waterCost)}</td></tr>
                <tr><td>Rác</td><td>{formatVND(result.trashFee)}</td></tr>
                <tr><td>Internet</td><td>{formatVND(result.internetFee)}</td></tr>
                {result.otherFee > 0 && <tr><td>{result.otherNote || 'Khác'}</td><td>{formatVND(result.otherFee)}</td></tr>}
                <tr className="total-row"><td>TỔNG CỘNG</td><td>{formatVND(result.total)}</td></tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
              <button className="btn btn-primary" onClick={handleShare} style={{ background: '#0068FF', color: 'white', borderColor: '#0068FF' }}>
                <Share2 size={18} /> Gửi Ảnh qua Zalo
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePrintBT}>
                  <Bluetooth size={18} /> In Bluetooth
                </button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={handlePrintSystem}>
                  <Printer size={18} /> In hệ thống
                </button>
              </div>
              
              <button 
                className="btn btn-danger" 
                style={{ marginTop: 8 }}
                onClick={async () => {
                  if (confirm('Bạn chắc chắn muốn xóa hóa đơn vừa tạo?')) {
                    await api.deleteInvoice(result.id);
                    setResult(null);
                    alert('Đã xóa hóa đơn!');
                  }
                }}
              >
                <Trash2 size={18} /> Xóa hóa đơn (Làm lại)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offscreen receipt for html2canvas capture */}
      {result && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <div id="receipt-capture" style={{ width: '400px', background: 'white' }}>
            <Receipt data={result} />
          </div>
        </div>
      )}
    </div>
  );
}
