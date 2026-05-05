/**
 * Utility for connecting and sending ESC/POS commands to a Bluetooth Thermal Printer via Web Bluetooth API.
 * Default formatting is set for 58mm printers (32 characters per line).
 */

let printerDevice = null;
let printerServer = null;
let printCharacteristic = null;

// Common UUIDs for Bluetooth thermal printers
const PRINTER_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455'
];

export async function connectBluetoothPrinter() {
  if (!navigator.bluetooth) {
    throw new Error('Trình duyệt hoặc thiết bị này không hỗ trợ Web Bluetooth API (Chỉ hỗ trợ Chrome/Edge/Android).');
  }

  try {
    printerDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICE_UUIDS
    });

    printerServer = await printerDevice.gatt.connect();

    // Try to find the correct service and characteristic
    let service = null;
    for (const uuid of PRINTER_SERVICE_UUIDS) {
      try {
        service = await printerServer.getPrimaryService(uuid);
        if (service) break;
      } catch (e) {
        // Ignore and try next
      }
    }

    if (!service) {
      // If we couldn't find a known service, just grab the first available primary service
      const services = await printerServer.getPrimaryServices();
      if (services.length > 0) {
        service = services[0];
      } else {
        throw new Error('Không tìm thấy dịch vụ in trên thiết bị này.');
      }
    }

    const characteristics = await service.getCharacteristics();
    // Usually the characteristic for writing has 'write' or 'writeWithoutResponse' property
    printCharacteristic = characteristics.find(c => c.properties.write || c.properties.writeWithoutResponse);

    if (!printCharacteristic) {
      throw new Error('Không tìm thấy cổng ghi dữ liệu trên máy in.');
    }

    return true;
  } catch (error) {
    console.error('Bluetooth error:', error);
    throw error;
  }
}

// Convert string to Uint8Array. 
// Most cheap thermal printers don't support Vietnamese UTF-8, so we remove accents.
function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

function textToBuffer(text) {
  const cleanText = removeVietnameseTones(text);
  const encoder = new TextEncoder(); // encodes to utf-8 (which matches ASCII for non-accented)
  return encoder.encode(cleanText);
}

// ESC/POS Commands
const ESC = 0x1B;
const GS = 0x1D;

export async function sendCommand(buffer) {
  if (!printCharacteristic) throw new Error('Chưa kết nối máy in');
  
  // Need to send data in chunks if it's too large (BLE limitation usually 20-512 bytes)
  const chunkSize = 100;
  for (let i = 0; i < buffer.length; i += chunkSize) {
    const chunk = buffer.slice(i, i + chunkSize);
    await printCharacteristic.writeValue(chunk);
  }
}

export async function printTestReceipt() {
  const cmds = [
    ESC, 0x40, // Init
    ESC, 0x61, 0x01, // Center align
    ...textToBuffer('KET NOI THANH CONG!\n\n'),
    ESC, 0x61, 0x00, // Left align
    ...textToBuffer('May in da san sang.\n\n\n\n')
  ];
  await sendCommand(new Uint8Array(cmds));
}

// Helper to format a line with left text and right text for 32 chars width (58mm printer)
function formatLineLR(left, right, width = 32) {
  const leftClean = removeVietnameseTones(left);
  const rightClean = removeVietnameseTones(right);
  const spaces = width - leftClean.length - rightClean.length;
  if (spaces > 0) {
    return leftClean + ' '.repeat(spaces) + rightClean;
  }
  return leftClean + ' ' + rightClean;
}

function buildInvoiceCommands(invoice) {
  const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'd';
  
  const cmds = [
    ESC, 0x40, // Init
    
    // Header
    ESC, 0x61, 0x01, // Center align
    ESC, 0x45, 0x01, // Bold ON
    ...textToBuffer('HOA DON TIEN PHONG\n'),
    ESC, 0x45, 0x00, // Bold OFF
    ...textToBuffer(`Thang: ${invoice.month}\n`),
    ...textToBuffer(`Ngay lap: ${new Date(invoice.createdAt).toLocaleDateString('vi-VN')}\n`),
    ...textToBuffer('--------------------------------\n'),
    
    // Room info
    ESC, 0x61, 0x00, // Left align
    ESC, 0x45, 0x01, // Bold ON
    ...textToBuffer(`Phong: ${removeVietnameseTones(invoice.roomName)}\n`),
    ESC, 0x45, 0x00, // Bold OFF
    ...textToBuffer('--------------------------------\n'),

    // Fees
    ...textToBuffer(formatLineLR('Tien phong:', formatVND(invoice.roomPrice)) + '\n'),
    ...textToBuffer(`Dien (${invoice.oldElec}-${invoice.newElec}):\n`),
    ...textToBuffer(formatLineLR(` ${invoice.elecUsage}kwh x ${formatVND(invoice.elecPrice)}`, formatVND(invoice.elecCost)) + '\n'),
    ...textToBuffer(`Nuoc (${invoice.oldWater}-${invoice.newWater}):\n`),
    ...textToBuffer(formatLineLR(` ${invoice.waterUsage}m3 x ${formatVND(invoice.waterPrice)}`, formatVND(invoice.waterCost)) + '\n'),
    ...textToBuffer(formatLineLR('Rac:', formatVND(invoice.trashFee)) + '\n'),
    ...textToBuffer(formatLineLR('Internet:', formatVND(invoice.internetFee)) + '\n'),
  ];

  if (invoice.otherFee > 0) {
    const note = invoice.otherNote || 'Khac';
    cmds.push(...textToBuffer(formatLineLR(note + ':', formatVND(invoice.otherFee)) + '\n'));
  }

  // Total
  cmds.push(
    ...textToBuffer('--------------------------------\n'),
    ESC, 0x61, 0x02, // Right align
    ESC, 0x45, 0x01, // Bold ON
    ...textToBuffer(`TONG CONG: ${formatVND(invoice.total)}\n`),
    ESC, 0x45, 0x00, // Bold OFF
    ...textToBuffer('\n\n')
  );

  // Footer (contains 5 newlines for tear-off)
  cmds.push(
    ESC, 0x61, 0x01, // Center align
    ...textToBuffer('Cam on quy khach!\n'),
    ...textToBuffer('--------------------------------\n'),
    ...textToBuffer('Phan mem quan ly nha tro\n\n\n\n\n')
  );

  return cmds;
}

export async function printInvoiceBluetooth(invoice) {
  const cmds = buildInvoiceCommands(invoice);
  await sendCommand(new Uint8Array(cmds));
}

export async function printMultipleInvoicesBluetooth(invoices) {
  const allCmds = [];
  for (const inv of invoices) {
    allCmds.push(...buildInvoiceCommands(inv));
  }
  await sendCommand(new Uint8Array(allCmds));
}
