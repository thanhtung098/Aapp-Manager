export default function Receipt({ data }) {
  if (!data) return null;

  const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  return (
    <div className="receipt print-only" style={{ display: 'block' }}>
      <h2>HÓA ĐƠN TIỀN PHÒNG</h2>
      <div className="receipt-info">
        <div>{data.address}</div>
        <div>ĐT: {data.landlordPhone}</div>
      </div>
      <div className="divider"></div>
      <table>
        <tbody>
          <tr><td><strong>{data.roomName}</strong></td><td style={{ textAlign: 'right' }}>Tháng {data.month}</td></tr>
        </tbody>
      </table>
      <div className="divider"></div>
      <table>
        <tbody>
          <tr><td>Tiền phòng</td><td style={{ textAlign: 'right' }}>{formatVND(data.roomPrice)}</td></tr>
          <tr><td colSpan="2" style={{ fontSize: '10px', color: '#666' }}>
            Điện: {data.oldElec} → {data.newElec} = {data.elecUsage} kWh × {formatVND(data.elecPrice)}
          </td></tr>
          <tr><td>Tiền điện</td><td style={{ textAlign: 'right' }}>{formatVND(data.elecCost)}</td></tr>
          <tr><td colSpan="2" style={{ fontSize: '10px', color: '#666' }}>
            Nước: {data.oldWater} → {data.newWater} = {data.waterUsage} m³ × {formatVND(data.waterPrice)}
          </td></tr>
          <tr><td>Tiền nước</td><td style={{ textAlign: 'right' }}>{formatVND(data.waterCost)}</td></tr>
          <tr><td>Rác</td><td style={{ textAlign: 'right' }}>{formatVND(data.trashFee)}</td></tr>
          <tr><td>Internet</td><td style={{ textAlign: 'right' }}>{formatVND(data.internetFee)}</td></tr>
          {data.otherFee > 0 && (
            <tr><td>{data.otherNote || 'Khác'}</td><td style={{ textAlign: 'right' }}>{formatVND(data.otherFee)}</td></tr>
          )}
        </tbody>
      </table>
      <div className="divider"></div>
      <div className="total">TỔNG: {formatVND(data.total)}</div>
      <div className="footer">
        <div>Ngày in: {dateStr}</div>
        <div>Chủ trọ: {data.landlordName}</div>
        <div>Cảm ơn quý khách!</div>
      </div>
    </div>
  );
}
