// Admin panelinde tum siparislerin goruntulenmesi ve durum guncellenmesi
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const DURUM_ETIKETLERI = {
  ALINDI: { metin: 'Alındı', renk: 'bg-gold/20 text-gold' },
  HAZIRLANIYOR: { metin: 'Hazırlanıyor', renk: 'bg-rose/20 text-rose-dark' },
  YOLDA: { metin: 'Yolda', renk: 'bg-moss/20 text-moss' },
  TESLIM_EDILDI: { metin: 'Teslim Edildi', renk: 'bg-ink/10 text-ink' },
  IPTAL: { metin: 'İptal', renk: 'bg-red-100 text-red-700' }
};

const DURUM_SECENEKLERI = ['ALINDI', 'HAZIRLANIYOR', 'YOLDA', 'TESLIM_EDILDI', 'IPTAL'];

function AdminSiparisler() {
  const { toastGoster } = useToast();
  const [siparisler, setSiparisler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtreDurum, setFiltreDurum] = useState('');

  function verileriYukle() {
    setYukleniyor(true);
    api.get('/siparisler/tumu')
      .then((yanit) => setSiparisler(yanit.data))
      .finally(() => setYukleniyor(false));
  }

  useEffect(() => {
    verileriYukle();
  }, []);

  async function durumGuncelle(id, yeniDurum) {
    try {
      await api.put(`/siparisler/${id}/durum`, { durum: yeniDurum });
      setSiparisler(siparisler.map((s) => (s.id === id ? { ...s, durum: yeniDurum } : s)));
      toastGoster(`Sipariş #${id} durumu güncellendi.`, 'basari');
    } catch (err) {
      toastGoster('Durum güncellenemedi.', 'hata');
    }
  }

  const gosterilenSiparisler = filtreDurum
    ? siparisler.filter((s) => s.durum === filtreDurum)
    : siparisler;

  if (yukleniyor) {
    return <Spinner metin="Siparişler yükleniyor..." />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-display text-lg text-ink">
          Tüm Siparişler <span className="text-charcoal/50 text-sm">({gosterilenSiparisler.length})</span>
        </h2>

        <select
          value={filtreDurum}
          onChange={(e) => setFiltreDurum(e.target.value)}
          className="border border-ink/20 rounded-full px-4 py-2 text-sm bg-paper"
        >
          <option value="">Tüm Durumlar</option>
          {DURUM_SECENEKLERI.map((durum) => (
            <option key={durum} value={durum}>{DURUM_ETIKETLERI[durum].metin}</option>
          ))}
        </select>
      </div>

      {gosterilenSiparisler.length === 0 ? (
        <p className="text-charcoal/50 text-center py-12">Bu durumda sipariş bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {gosterilenSiparisler.map((siparis) => {
            const etiket = DURUM_ETIKETLERI[siparis.durum] || DURUM_ETIKETLERI.ALINDI;
            return (
              <div key={siparis.id} className="border border-ink/10 rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-display text-lg text-ink">
                      Sipariş #{siparis.id} — {siparis.aliciAdSoyad}
                    </span>
                    <p className="text-xs text-charcoal/50 mt-1">
                      {new Date(siparis.olusturmaTarihi).toLocaleDateString('tr-TR', {
                        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    <p className="text-xs text-charcoal/50">
                      Müşteri: {siparis.kullanici?.email} · Tel: {siparis.aliciTelefon}
                    </p>
                  </div>

                  <select
                    value={siparis.durum}
                    onChange={(e) => durumGuncelle(siparis.id, e.target.value)}
                    className={`text-xs px-3 py-2 rounded-full font-medium border-0 ${etiket.renk}`}
                  >
                    {DURUM_SECENEKLERI.map((durum) => (
                      <option key={durum} value={durum}>{DURUM_ETIKETLERI[durum].metin}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 mb-3 bg-paper-dark/30 rounded-xl p-3">
                  {siparis.kalemler.map((kalem) => (
                    <div key={kalem.id} className="flex justify-between text-sm text-charcoal/70">
                      <span>{kalem.urun?.ad || 'Silinmiş ürün'} × {kalem.adet}</span>
                      <span>{(Number(kalem.birimFiyat) * kalem.adet).toFixed(2)} TL</span>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-charcoal/70 mb-2">
                  <span className="font-medium text-ink">Teslimat Adresi:</span> {siparis.teslimatAdresi} ({siparis.teslimatBolgesi?.bolgeAdi})
                </div>

                {siparis.not && (
                  <div className="text-sm text-charcoal/60 italic mb-2">Not: {siparis.not}</div>
                )}

                <div className="flex justify-between pt-3 border-t border-ink/10 text-sm">
                  <span className="text-charcoal/60">
                    Ürün: {Number(siparis.urunToplami).toFixed(2)} TL + Teslimat: {Number(siparis.teslimatUcreti).toFixed(2)} TL
                  </span>
                  <span className="font-display text-lg text-rose">
                    {Number(siparis.genelToplam).toFixed(2)} TL
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminSiparisler;
