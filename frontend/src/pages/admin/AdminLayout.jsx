// Admin panelinin ortak yerlesimi - sol menu (tab gecisleri) ve icerik alani
import { useState } from 'react';
import BotanicalDivider from '../../components/BotanicalDivider';
import AdminDashboard from './AdminDashboard';
import AdminUrunler from './AdminUrunler';
import AdminKategoriler from './AdminKategoriler';
import AdminBolgeler from './AdminBolgeler';
import AdminSiparisler from './AdminSiparisler';
import AdminKuponlar from './AdminKuponlar';
import AdminAuditLog from './AdminAuditLog';

const SEKMELER = [
  { id: 'dashboard', ad: 'Panel' },
  { id: 'urunler', ad: 'Ürünler' },
  { id: 'kategoriler', ad: 'Kategoriler' },
  { id: 'bolgeler', ad: 'Teslimat Bölgeleri' },
  { id: 'siparisler', ad: 'Siparişler' },
  { id: 'kuponlar', ad: 'Kuponlar' },
  { id: 'audit', ad: 'İşlem Geçmişi' }
];

function AdminLayout() {
  const [aktifSekme, setAktifSekme] = useState('dashboard');

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <span className="text-moss text-sm tracking-widest uppercase">Yönetim</span>
        <h1 className="font-display text-3xl text-ink mt-2">Yönetim Paneli</h1>
        <BotanicalDivider className="w-20 mx-auto mt-4" />
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10 border-b border-ink/10 pb-4">
        {SEKMELER.map((sekme) => (
          <button
            key={sekme.id}
            onClick={() => setAktifSekme(sekme.id)}
            className={`px-5 py-2 rounded-full text-sm transition-all duration-200 active:scale-95 ${
              aktifSekme === sekme.id
                ? 'bg-ink text-paper'
                : 'text-charcoal hover:bg-ink/5'
            }`}
          >
            {sekme.ad}
          </button>
        ))}
      </div>

      <div>
        {aktifSekme === 'dashboard' && <AdminDashboard />}
        {aktifSekme === 'urunler' && <AdminUrunler />}
        {aktifSekme === 'kategoriler' && <AdminKategoriler />}
        {aktifSekme === 'bolgeler' && <AdminBolgeler />}
        {aktifSekme === 'siparisler' && <AdminSiparisler />}
        {aktifSekme === 'kuponlar' && <AdminKuponlar />}
        {aktifSekme === 'audit' && <AdminAuditLog />}
      </div>
    </div>
  );
}

export default AdminLayout;
