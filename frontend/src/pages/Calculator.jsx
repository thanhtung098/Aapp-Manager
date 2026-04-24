import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calculator as CalcIcon, Printer, ArrowLeft } from 'lucide-react';
import { api } from '../api';
import Receipt from '../components/Receipt';

export default function Calculator() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    oldElec: '', newElec: '',
    oldWater: '', newWater: '',
    otherFee: '0', otherNote: '',
    month: new Date().toISOString().slice(0, 7),
  });
  const [result, setResult] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    Promise.all([api.getRooms(), api.getSettings()])
      .then(([rooms, s]) => {
        const found = rooms.find(r => r.id === Number(roomId));
        setRoom(found);
        setSettings(s);
      })
      .catch(console.error);
  }, [roomId]);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  const calculate = () => {
    if (!settings || !room) return;
    const elecUsage = Number(form.newElec) - Number(form.oldElec);
    const waterUsage = Number(form.newWater) - Number(form.oldWater);
    const elecCost = elecUsage * settings.electricityPrice;
    const waterCost = waterUsage * settings.waterPrice;
    const other = Number(form.otherFee) || 0;

    const total = room.price + elecCost + waterCost + settings.trashFee + settings.internetFee + other;

    setResult({
      roomName: room.name,
      roomPrice: room.price,
      month: form.month,
      oldElec: Number(form.oldElec),
      newElec: Number(form.newElec),
      elecUsage, elecPrice: settings.electricityPrice, elecCost,
      oldWater: Number(form.oldWater),
      newWater: Number(form.newWater),
      waterUsage, waterPrice: settings.waterPrice, waterCost,
      trashFee: settings.trashFee,
      internetFee: settings.internetFee,
      otherFee: other,
      otherNote: form.otherNote,
      total,
      landlordName: settings.landlordName,
      landlordPhone: settings.landlordPhone,
      address: settings.address,
    });
  };

  const saveAndPrint = async () => {
    if (!result) return;
    try {
      await api.createInvoice(result);
    } catch (e) { console.error(e); }
    setShowReceipt(true);
    setTimeout(() => window.print(), 300);
  };

  if (!room || !settings) {
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

      {/* Month */}
      <div className="card animate-in">
        <div className="card-title">📅 Tháng tính tiền</div>
        <input type="month" value={form.month} onChange={e => update('month', e.target.value)} />
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
        {form.oldElec && form.newElec && (
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-light)', marginTop: 4 }}>
            Tiêu thụ: <strong>{Number(form.newElec) - Number(form.oldElec)} kWh</strong> × {formatVND(settings.electricityPrice)}
          </div>
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
        {form.oldWater && form.newWater && (
          <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: 4 }}>
            Tiêu thụ: <strong>{Number(form.newWater) - Number(form.oldWater)} m³</strong> × {formatVND(settings.waterPrice)}
          </div>
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

      {/* Result */}
      {result && (
        <div className="card animate-in" style={{ marginTop: 16 }}>
          <div className="card-title">💰 Tổng kết</div>
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
          <button className="btn btn-success" style={{ marginTop: 16 }} onClick={saveAndPrint}>
            <Printer size={18} /> Lưu & In hóa đơn
          </button>
        </div>
      )}
    </div>
  );
}
