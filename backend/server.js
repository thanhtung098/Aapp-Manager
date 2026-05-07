const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression'); // gzip compression
const helmet = require('helmet'); // security headers
const rateLimit = require('express-rate-limit'); // basic rate limiting
const { loadData, saveData } = require('./database');
// Load data once at startup and keep it in memory for fast access
let dataStore = loadData();
function persist() {
  saveData(dataStore);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security & performance middleware
app.use(helmet());
app.use(compression());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(cors());
app.use(express.json());

// GET all rooms
app.get('/api/rooms', (req, res) => {
  res.json(dataStore.rooms);
});

// ADD a room
app.post('/api/rooms', (req, res) => {
  const { name, price, electricityPrice, waterPrice, trashFee, internetFee } = req.body;
  const newId = dataStore.rooms.length > 0 ? Math.max(...dataStore.rooms.map(r => r.id)) + 1 : 1;
  const room = {
    id: newId,
    name,
    price: Number(price),
    electricityPrice: electricityPrice !== undefined ? Number(electricityPrice) : null,
    waterPrice: waterPrice !== undefined ? Number(waterPrice) : null,
    trashFee: trashFee !== undefined ? Number(trashFee) : null,
    internetFee: internetFee !== undefined ? Number(internetFee) : null
  };
  dataStore.rooms.push(room);
  persist();
  res.status(201).json(room);
});

// UPDATE a room
app.put('/api/rooms/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = dataStore.rooms.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Phòng không tồn tại' });
  dataStore.rooms[idx] = { ...dataStore.rooms[idx], ...req.body, id };
  persist();
  res.json(dataStore.rooms[idx]);
});

// DELETE a room
app.delete('/api/rooms/:id', (req, res) => {
  const id = Number(req.params.id);
  dataStore.rooms = dataStore.rooms.filter(r => r.id !== id);
  persist();
  res.json({ success: true });
});

// GET settings
app.get('/api/settings', (req, res) => {
  res.json(dataStore.settings);
});

// UPDATE settings
app.put('/api/settings', (req, res) => {
  dataStore.settings = { ...dataStore.settings, ...req.body };
  persist();
  res.json(dataStore.settings);
});

// GET all invoices
app.get('/api/invoices', (req, res) => {
  res.json(dataStore.invoices);
});

// CREATE invoice
app.post('/api/invoices', (req, res) => {
  const newId = dataStore.invoices.length > 0 ? Math.max(...dataStore.invoices.map(i => i.id)) + 1 : 1;
  const invoice = {
    id: newId,
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  dataStore.invoices.push(invoice);
  persist();
  res.status(201).json(invoice);
});

// GET single invoice
app.get('/api/invoices/:id', (req, res) => {
  const id = Number(req.params.id);
  const invoice = dataStore.invoices.find(i => i.id === id);
  if (!invoice) return res.status(404).json({ error: 'Hóa đơn không tồn tại' });
  res.json(invoice);
});

// DELETE invoice
app.delete('/api/invoices/:id', (req, res) => {
  const id = Number(req.params.id);
  dataStore.invoices = dataStore.invoices.filter(r => r.id !== id);
  persist();
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
