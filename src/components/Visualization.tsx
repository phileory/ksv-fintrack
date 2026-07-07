import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toJpeg } from 'html-to-image';
import { Download } from 'lucide-react';

// Palet warna cerah untuk 8 kategori utama
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3', '#19FF5A', '#8E8E8E'];

export default function Visualization() {
  // Membaca data transaksi secara realtime dari IndexedDB
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  // 1. Pemrosesan Data: Agregat Berdasarkan Kategori Penggunaan
  const categoryData = transactions.reduce((acc: any, curr) => {
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

  // 2. Pemrosesan Data: Agregat Berdasarkan Sumber Dana
  const sourceData = transactions.reduce((acc: any, curr) => {
    const sourceName = curr.sourceOfFunds || 'Tanpa Keterangan';
    const existing = acc.find((item: any) => item.name === sourceName);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: sourceName, value: curr.amount });
    }
    return acc;
  }, []);

  // 3. Fungsi Ekspor Dashboard ke JPG (Offline Client-Side)
  const exportToJpeg = () => {
    const node = document.getElementById('report-container');
    if (!node) return;

    toJpeg(node, { backgroundColor: '#f8fafc', quality: 0.95 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `KSV-FinTrack-Report-${new Date().toISOString().slice(0, 7)}.jpg`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('Gagal mengunduh gambar:', error);
      });
  };

  // Format angka ke Rupiah tanpa library eksternal
  const formatRupiah = (val: any) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(Number(val) || 0);

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '12px', fontFamily: '"Arial", sans-serif' }}>
      
      {/* Tombol Aksi Ekspor */}
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

      {/* Container utama yang akan di-capture menjadi gambar */}
      <div id="report-container" style={{ padding: '16px', borderRadius: '24px', backgroundColor: '#f8fafc' }}>
        <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Dashboard Analisis</h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b' }}>Bulan berjalan (Lokal)</p>

        {transactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>Belum ada data transaksi.</p>
        ) : (
          <>
            {/* Grafik 1: Kategori Penggunaan */}
            <div style={{ marginBottom: '32px', backgroundColor: '#fff', padding: '16px', borderRadius: '20px', border: '2px solid #000' }}>
              <h4 style={{ margin: '0 0 12px 0', textAlign: 'center' }}>Alokasi Dana Keluar</h4>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60} // Membuat efek Donut Chart
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