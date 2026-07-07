import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toJpeg } from 'html-to-image';
import { Download } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3', '#19FF5A', '#8E8E8E'];

export default function Visualization() {
  // 1. State untuk Filter Tanggal (Default: Dari tanggal 1 bulan ini sampai hari ini)
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Membaca semua data dari database lokal
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  // 2. Proses Penyaringan Data Berdasarkan Rentang Tanggal Pilihan
  const filteredTransactions = transactions.filter((curr) => {
    const transactionTime = new Date(curr.dateTime).getTime();
    const startConstraint = new Date(`${startDate}T00:00:00`).getTime();
    const endConstraint = new Date(`${endDate}T23:59:59`).getTime();
    
    return transactionTime >= startConstraint && transactionTime <= endConstraint;
  });

  // 3. Agregat Kategori dari Data yang Sudah Disaring
  const categoryData = filteredTransactions.reduce((acc: any, curr) => {
    if (curr.type === 'pengeluaran') {
      const existing = acc.find((item: any) => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
    }
    return acc;
  }, []);

  // 4. Agregat Sumber Dana dari Data yang Sudah Disaring
  const sourceData = filteredTransactions.reduce((acc: any, curr) => {
    const sourceName = curr.sourceOfFunds || 'Tanpa Keterangan';
    const existing = acc.find((item: any) => item.name === sourceName);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: sourceName, value: curr.amount });
    }
    return acc;
  }, []);

  const exportToJpeg = () => {
    const node = document.getElementById('report-container');
    if (!node) return;

    toJpeg(node, { backgroundColor: '#f8fafc', quality: 0.95 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `KSV-Report-${startDate}-to-${endDate}.jpg`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('Gagal mengunduh gambar:', error);
      });
  };

  const formatRupiah = (val: any) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
      .format(Number(val) || 0);

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '12px', fontFamily: '"Arial", sans-serif' }}>
      
      {/* Tombol Unduh */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          onClick={exportToJpeg}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
            backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '20px',
            fontWeight: 'bold', cursor: 'pointer', fontSize: '14px'
          }}
        >
          <Download size={16} /> Unduh Laporan (.JPG)
        </button>
      </div>

      {/* Container utama laporan */}
      <div id="report-container" style={{ padding: '16px', borderRadius: '24px', backgroundColor: '#f8fafc' }}>
        <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Dashboard Analisis</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b' }}>Data Transaksi Lokal</p>

        {/* 5. UI Komponen Filter Tanggal (Kapsul Abu-Abu Gelap) */}
        <div style={{ 
          display: 'flex', gap: '10px', marginBottom: '24px', backgroundColor: '#fff', 
          padding: '14px', borderRadius: '20px', border: '2px solid #000' 
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', textAlign: 'right' }}>DARI</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '20px', border: '2px solid #000',
                backgroundColor: '#333333', color: '#fff', fontSize: '13px', outline: 'none', colorScheme: 'dark'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', textAlign: 'right' }}>SAMPAI</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '20px', border: '2px solid #000',
                backgroundColor: '#333333', color: '#fff', fontSize: '13px', outline: 'none', colorScheme: 'dark'
              }}
            />
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', backgroundColor: '#fff', borderRadius: '20px', border: '2px solid #000' }}>
            Tidak ada transaksi pada rentang tanggal ini.
          </p>
        ) : (
          <>
            {/* Grafik 1: Kategori */}
            <div style={{ marginBottom: '24px', backgroundColor: '#fff', padding: '16px', borderRadius: '20px', border: '2px solid #000' }}>
              <h4 style={{ margin: '0 0 12px 0', textAlign: 'center' }}>Alokasi Dana Keluar</h4>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatRupiah(value)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafik 2: Sumber Dana */}
            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '20px', border: '2px solid #000' }}>
              <h4 style={{ margin: '0 0 12px 0', textAlign: 'center' }}>Arus per Sumber Dana</h4>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sourceData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatRupiah(value)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}