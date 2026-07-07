import React, { useState } from 'react';
import { db } from '../db';

export default function QuickCapture() {
  const [type, setType] = useState<'pengeluaran' | 'pemasukan'>('pengeluaran');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('pangan');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageBlob(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      alert('Masukkan nominal yang valid');
      return;
    }

    try {
      await db.transactions.add({
        type,
        category: category as any,
        amount: Number(amount),
        sourceOfFunds: sourceOfFunds || undefined,
        dateTime: new Date(),
        receiptImage: imageBlob || undefined
      });

      setAmount('');
      setSourceOfFunds('');
      setImageBlob(null);
      setImagePreview(null);
      setStatusMessage('Transaksi disimpan!');
      setTimeout(() => setStatusMessage(''), 2000);
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan.');
    }
  };

  return (
    <div style={{ maxWidth: '380px', margin: '0 auto', padding: '20px', fontFamily: '"Arial", sans-serif', color: '#000' }}>
      
      {/* 1. Logo Stacked ala KSV Fintrack */}
      <div style={{ 
        color: '#3cdbe0', 
        fontWeight: 'bold', 
        fontSize: '42px', 
        lineHeight: '0.85', 
        fontFamily: '"Georgia", serif', 
        marginBottom: '36px',
        letterSpacing: '-1px'
      }}>
        KSV<br />Fintrack
      </div>
      
      {statusMessage && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '20px', marginBottom: '12px', textAlign: 'center', fontSize: '14px' }}>
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 2. Input Nominal */}
        <div>
          <label style={{ display: 'block', textAlign: 'right', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>Nominal (Rp)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 20px', boxSizing: 'border-box', 
              borderRadius: '30px', border: '2px solid #000', fontSize: '16px', outline: 'none' 
            }}
            required
          />
        </div>

        {/* 3. Input Kategori */}
        <div>
          <label style={{ display: 'block', textAlign: 'right', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 20px', boxSizing: 'border-box', 
              borderRadius: '30px', border: '2px solid #000', fontSize: '16px', backgroundColor: '#fff', outline: 'none', appearance: 'none'
            }}
          >
            <option value="pangan">Pangan</option>
            <option value="sandang">Sandang</option>
            <option value="papan">Papan</option>
            <option value="ortu">Orang Tua</option>
            <option value="pasangan">Pasangan</option>
            <option value="sedekah">Sedekah / Lainnya</option>
            <option value="keinginan">Keinginan</option>
            <option value="lain-lain">Lain-lain</option>
          </select>
        </div>

        {/* 4. Input Sumber Dana */}
        <div>
          <label style={{ display: 'block', textAlign: 'right', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>Sumber Dana (Optional)</label>
          <input
            type="text"
            value={sourceOfFunds}
            onChange={(e) => setSourceOfFunds(e.target.value)}
            style={{ 
              width: '100%', padding: '14px 20px', boxSizing: 'border-box', 
              borderRadius: '30px', border: '2px solid #000', fontSize: '16px', outline: 'none' 
            }}
          />
        </div>

        {/* 5. Input Foto Struk */}
        <div>
          <label style={{ display: 'block', textAlign: 'right', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>Foto Struk (Optional)</label>
          <label style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '16px 20px', 
            border: '2px dashed #000', borderRadius: '20px', cursor: 'pointer', backgroundColor: '#fff', color: '#a3a3a3'
          }}>
            <span style={{ fontSize: '14px' }}>Ambil Foto/Upload</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
          </label>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" style={{ width: '100%', marginTop: '8px', borderRadius: '12px', maxHeight: '100px', objectFit: 'cover' }} />
          )}
        </div>

        {/* 6. Tombol Simpan Transaksi dengan Glow Shadow */}
        <button
          type="submit"
          style={{ 
            width: '100%', padding: '16px', borderRadius: '30px', border: 'none', 
            backgroundColor: '#46e3e7', color: '#000', fontSize: '16px', fontWeight: 'bold', 
            cursor: 'pointer', boxShadow: '0 8px 20px rgba(70, 227, 231, 0.45)', marginTop: '10px' 
          }}
        >
          Simpan Transaksi
        </button>

        {/* 7. Tombol Pilihan Tipe Besar di Bagian Bawah */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => setType('pengeluaran')}
            style={{ 
              flex: 1, padding: '24px 12px', borderRadius: '20px', 
              backgroundColor: '#cc0000', color: '#fff', fontWeight: 'bold', fontSize: '14px', 
              cursor: 'pointer', border: type === 'pengeluaran' ? '4px solid #000' : 'none', boxSizing: 'border-box'
            }}
          >
            PENGELUARAN
          </button>
          <button
            type="button"
            onClick={() => setType('pemasukan')}
            style={{ 
              flex: 1, padding: '24px 12px', borderRadius: '20px', 
              backgroundColor: '#00b853', color: '#fff', fontWeight: 'bold', fontSize: '14px', 
              cursor: 'pointer', border: type === 'pemasukan' ? '4px solid #000' : 'none', boxSizing: 'border-box'
            }}
          >
            PEMASUKAN
          </button>
        </div>

      </form>
    </div>
  );
}