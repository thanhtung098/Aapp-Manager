import html2canvas from 'html2canvas';

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

export async function shareInvoiceAsImage(invoice, domElement) {
  try {
    // Save original styles if we need to temporarily modify them for capture
    const originalDisplay = domElement.style.display;
    domElement.style.display = 'block'; // Ensure it's visible to html2canvas

    const canvas = await html2canvas(domElement, {
      scale: 4, // Extremely high quality
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false
    });

    // Restore original display
    domElement.style.display = originalDisplay;

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error("Không thể tạo ảnh");

    const file = new File([blob], `HoaDon_${invoice.roomName}_${invoice.month}.png`, { type: 'image/png' });

    // Check if system supports sharing files
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Hóa đơn phòng ${invoice.roomName}`,
      });
      return true;
    } else {
      // Fallback: Download the image directly
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HoaDon_${invoice.roomName}_${invoice.month}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Đã tải ảnh hóa đơn xuống. Bạn có thể mở Zalo và gửi ảnh này!');
      return false;
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Lỗi khi chia sẻ ảnh:', error);
      alert('Không thể tạo hoặc chia sẻ ảnh: ' + error.message);
    }
    return false;
  }
}
