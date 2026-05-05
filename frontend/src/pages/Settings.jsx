import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Bluetooth } from 'lucide-react';
import { api } from '../api';
import { connectBluetoothPrinter, printTestReceipt } from '../utils/bluetoothPrinter';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);
  const [btStatus, setBtStatus] = useState('Chưa kết nối');

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const update = (key, val) => setSettings({ ...settings, [key]: val });

  const handleSave = async () => {
    await api.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleConnectBT = async () => {
    try {
      setBtStatus('Đang kết nối...');
      await connectBluetoothPrinter();
      setBtStatus('Đã kết nối!');
      alert('Kết nối máy in thành công!');
    } catch (e) {
      setBtStatus('Lỗi kết nối');
      alert(e.message);
    }
  };

  const handleTestPrint = async () => {
    try {
      await printTestReceipt();
    } catch (e) {
      alert('Chưa kết nối máy in hoặc máy in lỗi: ' + e.message);
    }
  };

  if (!settings) {
    return (
      <div className="app-container loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">ĐANG TẢI...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-header animate-in">
        <h1>⚙️ Cài Đặt</h1>
        <p>Đơn giá điện, nước & thông tin chủ trọ</p>
      </div>

      <div className="card animate-in">
        <div className="card-title">💡 Đơn giá</div>
        <div className="settings-item">
          <label>Giá điện (VNĐ/kWh)</label>
          <input type="number" value={settings.electricityPrice} onChange={e => update('electricityPrice', Number(e.target.value))} />
        </div>
        <div className="settings-item">
          <label>Giá nước (VNĐ/m³)</label>
          <input type="number" value={settings.waterPrice} onChange={e => update('waterPrice', Number(e.target.value))} />
        </div>
        <div className="settings-item">
          <label>Phí rác (VNĐ/tháng)</label>
          <input type="number" value={settings.trashFee} onChange={e => update('trashFee', Number(e.target.value))} />
        </div>
        <div className="settings-item">
          <label>Internet (VNĐ/tháng)</label>
          <input type="number" value={settings.internetFee} onChange={e => update('internetFee', Number(e.target.value))} />
        </div>
      </div>

      <div className="card animate-in">
        <div className="card-title">👤 Thông tin chủ trọ</div>
        <div className="form-group">
          <label>Tên chủ trọ</label>
          <input type="text" value={settings.landlordName} onChange={e => update('landlordName', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input type="text" value={settings.landlordPhone} onChange={e => update('landlordPhone', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Địa chỉ</label>
          <input type="text" value={settings.address} onChange={e => update('address', e.target.value)} />
        </div>
      </div>

      <div className="card animate-in">
        <div className="card-title">🖨️ Máy in Bluetooth</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 12 }}>
          Trạng thái: <strong style={{ color: btStatus === 'Đã kết nối!' ? 'var(--success)' : 'inherit' }}>{btStatus}</strong>
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleConnectBT}>
            <Bluetooth size={18} /> Kết nối
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleTestPrint} disabled={btStatus !== 'Đã kết nối!'}>
            In thử
          </button>
        </div>
      </div>

      <button className="btn btn-primary animate-in" onClick={handleSave}>
        <Save size={18} /> {saved ? '✅ Đã lưu!' : 'Lưu cài đặt'}
      </button>
    </div>
  );
}
