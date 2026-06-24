import { useEffect, useState } from 'react';

const BASE = 'https://provinces.open-api.vn/api';

const selStyle = (disabled) => ({
  width: '100%', height: 44, padding: '0 12px', borderRadius: 10,
  border: '1px solid #EDE5D8', fontSize: 14, color: disabled ? '#9b9289' : '#2C2C2C',
  background: disabled ? '#f9f5f0' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
  appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239b9289' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
  paddingRight: 32,
});

export default function AddressPicker({ value = {}, onChange }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({ p: false, d: false, w: false });

  // Load provinces once
  useEffect(() => {
    setLoading(l => ({ ...l, p: true }));
    fetch(`${BASE}/p/`)
      .then(r => r.json())
      .then(data => setProvinces(data || []))
      .finally(() => setLoading(l => ({ ...l, p: false })));
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!value.provinceCode) { setDistricts([]); setWards([]); return; }
    setLoading(l => ({ ...l, d: true }));
    fetch(`${BASE}/p/${value.provinceCode}?depth=2`)
      .then(r => r.json())
      .then(data => setDistricts(data.districts || []))
      .finally(() => setLoading(l => ({ ...l, d: false })));
  }, [value.provinceCode]);

  // Load wards when district changes
  useEffect(() => {
    if (!value.districtCode) { setWards([]); return; }
    setLoading(l => ({ ...l, w: true }));
    fetch(`${BASE}/d/${value.districtCode}?depth=2`)
      .then(r => r.json())
      .then(data => setWards(data.wards || []))
      .finally(() => setLoading(l => ({ ...l, w: false })));
  }, [value.districtCode]);

  const pickProvince = (e) => {
    const code = e.target.value;
    const name = provinces.find(p => String(p.code) === code)?.name || '';
    onChange({ province: name, provinceCode: code, district: '', districtCode: '', ward: '', wardCode: '' });
  };

  const pickDistrict = (e) => {
    const code = e.target.value;
    const name = districts.find(d => String(d.code) === code)?.name || '';
    onChange({ ...value, district: name, districtCode: code, ward: '', wardCode: '' });
  };

  const pickWard = (e) => {
    const code = e.target.value;
    const name = wards.find(w => String(w.code) === code)?.name || '';
    onChange({ ...value, ward: name, wardCode: code });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
      {/* Province */}
      <div style={{ position: 'relative' }}>
        <select value={value.provinceCode || ''} onChange={pickProvince} disabled={loading.p} style={selStyle(loading.p)}>
          <option value="">{loading.p ? 'Đang tải…' : 'Tỉnh/Thành phố'}</option>
          {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
        </select>
      </div>

      {/* District */}
      <div style={{ position: 'relative' }}>
        <select value={value.districtCode || ''} onChange={pickDistrict} disabled={!value.provinceCode || loading.d} style={selStyle(!value.provinceCode || loading.d)}>
          <option value="">{loading.d ? 'Đang tải…' : 'Quận/Huyện'}</option>
          {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
        </select>
      </div>

      {/* Ward */}
      <div style={{ position: 'relative' }}>
        <select value={value.wardCode || ''} onChange={pickWard} disabled={!value.districtCode || loading.w} style={selStyle(!value.districtCode || loading.w)}>
          <option value="">{loading.w ? 'Đang tải…' : 'Phường/Xã'}</option>
          {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
        </select>
      </div>
    </div>
  );
}
