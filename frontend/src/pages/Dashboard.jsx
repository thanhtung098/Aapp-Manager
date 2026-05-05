import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Plus, X, Edit2, Trash2, Check, Settings as SettingsIcon } from 'lucide-react';
import { api } from '../api';

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState({
    name: '', price: '', electricityPrice: '', waterPrice: '', trashFee: '', internetFee: ''
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getRooms(), api.getSettings()])
      .then(([r, s]) => {
        setRooms(r);
        setSettings(s);
        setIsLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setIsLoading(false);
      });
  }, []);

  const openAddModal = () => {
    setForm({
      name: '', 
      price: '', 
      electricityPrice: settings?.electricityPrice || '', 
      waterPrice: settings?.waterPrice || '', 
      trashFee: settings?.trashFee || '', 
      internetFee: settings?.internetFee || ''
    });
    setEditingRoom(null);
    setModalOpen(true);
  };

  const openEditModal = (room) => {
    setForm({
      name: room.name, 
      price: String(room.price), 
      electricityPrice: String(room.electricityPrice ?? settings?.electricityPrice ?? ''), 
      waterPrice: String(room.waterPrice ?? settings?.waterPrice ?? ''), 
      trashFee: String(room.trashFee ?? settings?.trashFee ?? ''), 
      internetFee: String(room.internetFee ?? settings?.internetFee ?? '')
    });
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    
    const payload = { 
      name: form.name, 
      price: Number(form.price),
      electricityPrice: Number(form.electricityPrice),
      waterPrice: Number(form.waterPrice),
      trashFee: Number(form.trashFee),
      internetFee: Number(form.internetFee)
    };

    try {
      if (editingRoom) {
        const updated = await api.updateRoom(editingRoom.id, payload);
        setRooms(rooms.map(r => r.id === editingRoom.id ? updated : r));
      } else {
        const room = await api.createRoom(payload);
        setRooms([...rooms, room]);
      }
      setModalOpen(false);
    } catch (e) { 
      console.error(e); 
      alert('Lỗi khi lưu phòng');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa phòng này?')) return;
    await api.deleteRoom(id);
    setRooms(rooms.filter(r => r.id !== id));
  };

  const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  if (isLoading) {
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
        <h1>🏠 Quản Lý Phòng</h1>
        <p>Chọn phòng để tính tiền & in hóa đơn</p>
      </div>

      <div className="room-grid">
        {rooms.map((room, i) => (
          <div
            key={room.id}
            className="room-item animate-in"
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => navigate(`/calculator/${room.id}`)}
          >
            <div className="room-name">{room.name}</div>
            <div className="room-price">{formatVND(room.price)}/tháng</div>
            
            {/* Show badge if room has custom prices */}
            {room.electricityPrice !== null && room.electricityPrice !== undefined && (
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <SettingsIcon size={10} style={{ display: 'inline', marginRight: 2 }} /> Giá riêng
              </div>
            )}

            <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center' }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ width: 'auto', padding: '4px 8px', fontSize: '0.7rem' }}
                onClick={(e) => { e.stopPropagation(); openEditModal(room); }}
              >
                <Edit2 size={12} />
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ width: 'auto', padding: '4px 8px', fontSize: '0.7rem' }}
                onClick={(e) => { e.stopPropagation(); handleDelete(room.id); }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="empty-state animate-in">
          <Home size={48} />
          <p>Chưa có phòng nào. Hãy thêm phòng mới!</p>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>{editingRoom ? 'Sửa thông tin phòng' : '🏠 Thêm phòng mới'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="form-group">
              <label>Tên phòng</label>
              <input type="text" placeholder="VD: Phòng 6" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Giá thuê phòng (VNĐ/tháng)</label>
              <input type="number" placeholder="2000000" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giá điện (VNĐ/kWh)</label>
                <input type="number" value={form.electricityPrice} onChange={e => setForm({...form, electricityPrice: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Giá nước (VNĐ/m³)</label>
                <input type="number" value={form.waterPrice} onChange={e => setForm({...form, waterPrice: e.target.value})} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tiền rác (VNĐ)</label>
                <input type="number" value={form.trashFee} onChange={e => setForm({...form, trashFee: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Internet (VNĐ)</label>
                <input type="number" value={form.internetFee} onChange={e => setForm({...form, internetFee: e.target.value})} />
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 8 }}>
              {editingRoom ? <Check size={18} /> : <Plus size={18} />} {editingRoom ? 'Lưu thay đổi' : 'Thêm phòng'}
            </button>
          </div>
        </div>
      )}

      <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={openAddModal}>
        <Plus size={18} /> Thêm phòng mới
      </button>
    </div>
  );
}
