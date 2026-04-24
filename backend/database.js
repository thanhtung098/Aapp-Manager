const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

function getDefaultData() {
  return {
    rooms: [
      { id: 1, name: 'Phòng 1', price: 2000000 },
      { id: 2, name: 'Phòng 2', price: 2200000 },
      { id: 3, name: 'Phòng 3', price: 2500000 },
      { id: 4, name: 'Phòng 4', price: 1800000 },
      { id: 5, name: 'Phòng 5', price: 3000000 },
    ],
    invoices: [],
    settings: {
      electricityPrice: 3500, // VND per kWh
      waterPrice: 15000,      // VND per m3
      trashFee: 20000,        // VND per month
      internetFee: 100000,    // VND per month
      landlordName: 'Chủ Trọ',
      landlordPhone: '0901234567',
      address: '123 Đường ABC, Phường XYZ, TP.HCM',
    },
  };
}

function loadData() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading data, resetting to default:', e.message);
  }
  const data = getDefaultData();
  saveData(data);
  return data;
}

function saveData(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { loadData, saveData };
