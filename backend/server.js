const express = require('express');
const cors = require('cors');
const path = require('path');
const { loadData, saveData } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── GET all rooms ──────────────────────────────────────────────
app.get('/api/rooms', (req, res) => {
  const data = loadData();
  res.json(data.rooms);
});

// ─── ADD a room ─────────────────────────────────────────────────
app.post('/api/rooms', (req, res) => {
  const data = loadData();
  const { name, price } = req.body;
  const newId = data.rooms.length > 0 ? Math.max(...data.rooms.map(r => r.id)) + 1 : 1;
  const room = { id: newId, name, price: Number(price) };
  data.rooms.push(room);
  saveData(data);
  res.status(201).json(room);
});

// ─── UPDATE a room ──────────────────────────────────────────────
app.put('/api/rooms/:id', (req, res) => {
  const data = loadData();
  const id = Number(req.params.id);
  const idx = data.rooms.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Phòng không tồn tại' });
  data.rooms[idx] = { ...data.rooms[idx], ...req.body, id };
  saveData(data);
  res.json(data.rooms[idx]);
});

// ─── DELETE a room ──────────────────────────────────────────────
app.delete('/api/rooms/:id', (req, res) => {
  const data = loadData();
  const id = Number(req.params.id);
  data.rooms = data.rooms.filter(r => r.id !== id);
  saveData(data);
  res.json({ success: true });
});

// ─── GET settings ───────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  const data = loadData();
  res.json(data.settings);
});

// ─── UPDATE settings ────────────────────────────────────────────
app.put('/api/settings', (req, res) => {
  const data = loadData();
  data.settings = { ...data.settings, ...req.body };
  saveData(data);
  res.json(data.settings);
});

// ─── GET all invoices ───────────────────────────────────────────
app.get('/api/invoices', (req, res) => {
  const data = loadData();
  res.json(data.invoices);
});

// ─── CREATE invoice ─────────────────────────────────────────────
app.post('/api/invoices', (req, res) => {
  const data = loadData();
  const newId = data.invoices.length > 0 ? Math.max(...data.invoices.map(i => i.id)) + 1 : 1;
  const invoice = {
    id: newId,
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  data.invoices.push(invoice);
  saveData(data);
  res.status(201).json(invoice);
});

// ─── GET single invoice ────────────────────────────────────────
app.get('/api/invoices/:id', (req, res) => {
  const data = loadData();
  const id = Number(req.params.id);
  const invoice = data.invoices.find(i => i.id === id);
  if (!invoice) return res.status(404).json({ error: 'Hóa đơn không tồn tại' });
  res.json(invoice);
});

// ─── DELETE invoice ─────────────────────────────────────
app.delete('/api/invoices/:id', (req, res) => {
  const data = loadData();
  const id = Number(req.params.id);
  data.invoices = data.invoices.filter(r => r.id !== id);
  saveData(data);
  res.json({ success: true });
});

// ─── Production: Serve static files ─────────────────────────────
// Point to the built frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA routing: anything not handled by API routes gets redirected to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ─── Start server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running at port ${PORT}`);
});
