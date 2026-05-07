export default function Receipt({ data }) {
  if (!data) return null;

  const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
  const now = data.invoiceDate ? new Date(data.invoiceDate) : new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  return (
    <div className="receipt" style={{ 
      display: 'block', 
      background: 'white', 
      color: 'black', 
      padding: '20px', 
      fontFamily: '"Courier New", Courier, monospace',
      width: '320px',
      margin: '0',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ textAlign: 'left', fontSize: '18px', fontWeight: '900', marginBottom: '8px' }}>HÓA ĐƠN TIỀN PHÒNG</h2>
      <div className="receipt-info" style={{ textAlign: 'left', fontSize: '12px', marginBottom: '12px', fontWeight: '600' }}>
        {/* <div>{data.address}</div> */}
        {/* <div>ĐT: {data.landlordPhone}</div> */}
      </div>
      <div style={{ borderTop: '2px dashed black', margin: '10px 0' }}></div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '4px 0', fontWeight: '800' }}>{data.roomName}</td>
            <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: '800' }}>Tháng {data.month}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ borderTop: '2px dashed black', margin: '10px 0' }}></div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontWeight: '600' }}>
        <tbody>
          <tr>
            <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Tiền phòng</td>
            <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatVND(data.roomPrice)}</td>
          </tr>

          <tr>
            <td style={{ padding: '4px 0' }}>
              <div style={{ fontWeight: 'bold' }}>Tiền điện</div>
              <div style={{ fontSize: '11px', fontWeight: 'normal' }}>
                {data.newElec} - {data.oldElec} = {data.elecUsage} kWh × {data.elecPrice}
              </div>
            </td>
            <td style={{ padding: '4px 0', textAlign: 'right', verticalAlign: 'top' }}>
              = {formatVND(data.elecCost)}
            </td>
          </tr>

          <tr>
            <td style={{ padding: '4px 0' }}>
              <div style={{ fontWeight: 'bold' }}>Tiền nước</div>
              <div style={{ fontSize: '11px', fontWeight: 'normal' }}>
                {data.newWater} - {data.oldWater} = {data.waterUsage} m³ × {data.waterPrice}
              </div>
            </td>
            <td style={{ padding: '4px 0', textAlign: 'right', verticalAlign: 'top' }}>
              = {formatVND(data.waterCost)}
            </td>
          </tr>

          <tr>
            <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Rác</td>
            <td style={{ padding: '4px 0', textAlign: 'right' }}>{formatVND(data.trashFee)}</td>
          </tr>
          {/* <tr><td style={{ padding: '4px 0' }}>Internet</td><td style={{ padding: '4px 0', textAlign: 'right' }}>{formatVND(data.internetFee)}</td></tr> */}
          {data.otherFee > 0 && (
            <tr><td style={{ padding: '4px 0' }}>{data.otherNote || 'Khác'}</td><td style={{ padding: '4px 0', textAlign: 'right' }}>{formatVND(data.otherFee)}</td></tr>
          )}
        </tbody>
      </table>
      <div style={{ borderTop: '2px dashed black', margin: '10px 0' }}></div>
      <div style={{ fontSize: '18px', fontWeight: '900', textAlign: 'left', margin: '12px 0' }}>TỔNG: {formatVND(data.total)}</div>
      <div style={{ textAlign: 'left', fontSize: '12px', marginTop: '16px', fontWeight: '600' }}>
        <div>Ngày in: {dateStr}</div>
        {/* <div>Chủ trọ: {data.landlordName}</div> */}
        <div style={{ marginTop: '8px' }}>Cảm ơn quý khách!</div>
      </div>
    </div>
  );
}
