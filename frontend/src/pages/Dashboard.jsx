import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Plus, X, Edit2, Trash2, Check } from 'lucide-react';
import { api } from '../api';

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.getRooms().then(setRooms).catch(console.error);
  }, []);

  const handleAdd = async () => {
    if (!newName || !newPrice) return;
    try {
      const room = await api.createRoom({ name: newName, price: Number(newPrice) });
      setRooms([...rooms, room]);
      setNewName('');
      setNewPrice('');
      setShowAdd(false);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa phòng này?')) return;
    await api.deleteRoom(id);
    setRooms(rooms.filter(r => r.id !== id));
  };

  const startEdit = (room) => {
    setEditingId(room.id);
    setEditName(room.name);
    setEditPrice(String(room.price));
  };

  const handleEdit = async (id) => {
    if (!editName || !editPrice) return;
    try {
      const updated = await api.updateRoom(id, { name: editName, price: Number(editPrice) });
      setRooms(rooms.map(r => r.id === id ? updated : r));
      setEditingId(null);
    } catch (e) { console.error(e); }
  };

  const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  return (
    <div className="app-container">
      <div className="page-header animate-in">
        <h1>🏠 Quản Lý</h1>
        <p>Chọn phòng để tính tiền & in hóa đơn</p>
      </div>

      <div className="room-grid">
        {rooms.map((room, i) => (
          <div
            key={room.id}
            className="room-item animate-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {editingId === room.id ? (
              /* ── Edit Mode ── */
              <div onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ marginBottom: 6, fontSize: '0.85rem' }}
                  placeholder="Tên phòng"
                />
                <input
                  type="number"
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value)}
                  style={{ marginBottom: 8, fontSize: '0.85rem' }}
                  placeholder="Giá thuê"
                />
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button
                    className="btn btn-success btn-sm"
                    style={{ width: 'auto', padding: '4px 10px', fontSize: '0.7rem' }}
                    onClick={() => handleEdit(room.id)}
                  >
                    <Check size={12} /> Lưu
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ width: 'auto', padding: '4px 10px', fontSize: '0.7rem' }}
                    onClick={() => setEditingId(null)}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              /* ── View Mode ── */
              <div onClick={() => navigate(`/calculator/${room.id}`)}>
                <div className="room-name">{room.name}</div>
                <div className="room-price">{formatVND(room.price)}/tháng</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ width: 'auto', padding: '4px 8px', fontSize: '0.7rem' }}
                    onClick={(e) => { e.stopPropagation(); startEdit(room); }}
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
            )}
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="empty-state animate-in">
          <Home size={48} />
          <p>Chưa có phòng nào. Hãy thêm phòng mới!</p>
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏠 Thêm phòng mới</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="form-group">
              <label>Tên phòng</label>
              <input type="text" placeholder="VD: Phòng 6" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Giá thuê (VNĐ/tháng)</label>
              <input type="number" placeholder="2000000" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleAdd}>
              <Plus size={18} /> Thêm phòng
            </button>
          </div>
        </div>
      )}

      <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>
        <Plus size={18} /> Thêm phòng mới
      </button>
    </div>
  );
}
