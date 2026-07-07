import { useState } from 'react';
import QuickCapture from './components/QuickCapture';
import Visualization from './components/Visualization';
import { PlusCircle, BarChart3 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'capture' | 'visual'>('capture');

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Render komponen berdasarkan tab aktif */}
      {activeTab === 'capture' ? <QuickCapture /> : <Visualization />}

      {/* Navigation Bar di Bagian Bawah (Mobile Friendly) */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px',
        backgroundColor: '#fff', borderTop: '2px solid #000', display: 'flex',
        justifyContent: 'space-around', alignItems: 'center', zIndex: 100
      }}>
        <button
          onClick={() => setActiveTab('capture')}
          style={{
            background: 'none', border: 'none', display: 'flex', flexDirection: 'column',
            alignItems: 'center', color: activeTab === 'capture' ? '#46e3e7' : '#64748b',
            cursor: 'pointer', fontWeight: activeTab === 'capture' ? 'bold' : 'normal'
          }}
        >
          <PlusCircle size={24} color={activeTab === 'capture' ? '#46e3e7' : '#64748b'} />
          <span style={{ fontSize: '12px', marginTop: '4px' }}>Catat</span>
        </button>

        <button
          onClick={() => setActiveTab('visual')}
          style={{
            background: 'none', border: 'none', display: 'flex', flexDirection: 'column',
            alignItems: 'center', color: activeTab === 'visual' ? '#46e3e7' : '#64748b',
            cursor: 'pointer', fontWeight: activeTab === 'visual' ? 'bold' : 'normal'
          }}
        >
          <BarChart3 size={24} color={activeTab === 'visual' ? '#46e3e7' : '#64748b'} />
          <span style={{ fontSize: '12px', marginTop: '4px' }}>Grafik</span>
        </button>
      </div>
    </div>
  );
}

export default App;