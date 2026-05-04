export const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

export function generateInvoiceText(invoice) {
  let text = `🏠 HÓA ĐƠN TIỀN PHÒNG\n`;
  text += `Phòng: ${invoice.roomName}\n`;
  text += `Tháng: ${invoice.month}\n`;
  text += `--------------------------------\n`;
  text += `Tiền phòng: ${formatVND(invoice.roomPrice)}\n`;
  text += `Điện (${invoice.elecUsage} kWh): ${formatVND(invoice.elecCost)}\n`;
  text += `Nước (${invoice.waterUsage} m³): ${formatVND(invoice.waterCost)}\n`;
  text += `Rác: ${formatVND(invoice.trashFee)}\n`;
  text += `Internet: ${formatVND(invoice.internetFee)}\n`;
  
  if (invoice.otherFee > 0) {
    const note = invoice.otherNote || 'Khác';
    text += `${note}: ${formatVND(invoice.otherFee)}\n`;
  }
  
  text += `--------------------------------\n`;
  text += `💰 TỔNG CỘNG: ${formatVND(invoice.total)}\n`;
  text += `\nVui lòng thanh toán hóa đơn đúng hạn. Cảm ơn!\n`;
  
  return text;
}

export async function shareInvoice(invoice) {
  const text = generateInvoiceText(invoice);
  
  // Try Web Share API (Mobile native share sheet - supports Zalo, Messenger, SMS, etc)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Hóa đơn phòng ${invoice.roomName}`,
        text: text
      });
      return true; // Shared successfully
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Lỗi khi chia sẻ:', e);
      }
    }
  }
  
  // Fallback: Copy to clipboard and open Zalo via URL scheme
  try {
    await navigator.clipboard.writeText(text);
    return false; // Indicates it was copied, not natively shared
  } catch (e) {
    console.error('Lỗi khi copy:', e);
    // If even clipboard fails, just alert the text so user can copy manually
    alert("Không thể tự động copy. Vui lòng copy nội dung dưới đây:\n\n" + text);
    return false;
  }
}
