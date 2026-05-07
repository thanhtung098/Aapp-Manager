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
            <td style={{ padding: '4px 0', fontWeight: '800', textAlign: 'left' }}>{data.roomName}</td>
            <td style={{ padding: '4px 0', textAlign: 'left', fontWeight: '800' }}> - Tháng {data.month}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ borderTop: '2px dashed black', margin: '10px 0' }}></div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontWeight: '600' }}>
        <tbody>
          <tr>
            <td colSpan="2" style={{ padding: '6px 0', borderBottom: '1px dashed #ccc' }}>
              <span style={{ fontWeight: 'bold' }}>Tiền phòng: </span>
              <span style={{ float: 'right' }}>{formatVND(data.roomPrice)}</span>
            </td>
          </tr>

          <tr>
            <td colSpan="2" style={{ padding: '6px 0', borderBottom: '1px dashed #ccc' }}>
              <div style={{ fontWeight: 'bold' }}>Tiền điện: <span style={{ float: 'right' }}>{formatVND(data.elecCost)}</span></div>
              <div style={{ fontSize: '11px', fontWeight: 'normal', color: '#000', marginTop: '2px' }}>
                ({data.newElec} - {data.oldElec} = {data.elecUsage} kWh × {formatVND(data.elecPrice)})
              </div>
            </td>
          </tr>

          <tr>
            <td colSpan="2" style={{ padding: '6px 0', borderBottom: '1px dashed #ccc' }}>
              <div style={{ fontWeight: 'bold' }}>Tiền nước: <span style={{ float: 'right' }}>{formatVND(data.waterCost)}</span></div>
              <div style={{ fontSize: '11px', fontWeight: 'normal', color: '#00000', marginTop: '2px' }}>
                ({data.newWater} - {data.oldWater} = {data.waterUsage} m³ × {formatVND(data.waterPrice)})
              </div>
            </td>
          </tr>

          <tr>
            <td colSpan="2" style={{ padding: '6px 0', borderBottom: '1px dashed #ccc' }}>
              <span style={{ fontWeight: 'bold' }}>Rác: </span>
              <span style={{ float: 'right' }}>{formatVND(data.trashFee)}</span>
            </td>
          </tr>

          {data.otherFee > 0 && (
            <tr>
              <td colSpan="2" style={{ padding: '6px 0', borderBottom: '1px dashed #ccc' }}>
                <span style={{ fontWeight: 'bold' }}>{data.otherNote || 'Khác'}: </span>
                <span style={{ float: 'right' }}>{formatVND(data.otherFee)}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ borderTop: '2px dashed black', margin: '10px 0' }}></div>
      <div style={{ fontSize: '18px', fontWeight: '900', textAlign: 'left', margin: '12px 0' }}>TỔNG CỘNG: {formatVND(data.total)}</div>
      <div style={{ textAlign: 'left', fontSize: '12px', marginTop: '16px', fontWeight: '600' }}>
        <div>Ngày in: {dateStr}</div>
        <div style={{ marginTop: '8px' }}>Cảm ơn quý khách!</div>
      </div>
    </div>
  );
}
