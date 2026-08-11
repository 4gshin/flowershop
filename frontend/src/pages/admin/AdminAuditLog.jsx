// Admin panelinde sistem islemlerinin gecmisini gosterir
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const ISLEM_ETIKETLERI = {
  GIRIS_YAPILDI: { metin: 'Giriş Yapıldı', renk: 'bg-moss/20 text-moss' },
  KAYIT_OLUSTURULDU: { metin: 'Kayıt Oluşturuldu', renk: 'bg-gold/20 text-gold' },
  URUN_OLUSTURULDU: { metin: 'Ürün Oluşturuldu', renk: 'bg-rose/20 text-rose-dark' },
  URUN_GUNCELLENDI: { metin: 'Ürün Güncellendi', renk: 'bg-rose/10 text-rose-dark' },
  URUN_SILINDI: { metin: 'Ürün Silindi', renk: 'bg-red-100 text-red-700' },
  KATEGORI_OLUSTURULDU: { metin: 'Kategori Oluşturuldu', renk: 'bg-moss/20 text-moss' },
  KATEGORI_SILINDI: { metin: 'Kategori Silindi', renk: 'bg-red-100 text-red-700' },
  SIPARIS_OLUSTURULDU: { metin: 'Sipariş Oluşturuldu', renk: 'bg-gold/20 text-gold' },
  SIPARIS_DURUMU_GUNCELLENDI: { metin: 'Sipariş Durumu Değişti', renk: 'bg-ink/10 text-ink' }
};

function AdminAuditLog() {
  const [loglar, setLoglar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [filtreIslem, setFiltreIslem] = useState('');

  useEffect(() => {
    verileriYukle();
  }, []);

  function verileriYukle() {
    setYukleniyor(true);
    api.get('/audit-loglari?limit=200')
      .then((yanit) => setLoglar(yanit.data))
      .catch(() => setLoglar([]))
      .finally(() => setYukleniyor(false));
  }

  const gosterilenLoglar = filtreIslem
    ? loglar.filter((l) => l.islem === filtreIslem)
    : loglar;

  const benzersizIslemler = [...new Set(loglar.map((l) => l.islem))];

  if (yukleniyor) {
    return <Spinner metin="İşlem geçmişi yükleniyor..." />;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-lg text-ink">İşlem Geçmişi</h2>
          <p className="text-xs text-charcoal/50 mt-1">Son {loglar.length} işlem gösteriliyor</p>
        </div>

        <select
          value={filtreIslem}
          onChange={(e) => setFiltreIslem(e.target.value)}
          className="border border-ink/20 rounded-full px-4 py-2 text-sm bg-paper"
        >
          <option value="">Tüm İşlemler ({loglar.length})</option>
          {benzersizIslemler.map((islem) => {
            const etiket = ISLEM_ETIKETLERI[islem] || { metin: islem };
            const sayi = loglar.filter((l) => l.islem === islem).length;
            return (
              <option key={islem} value={islem}>{etiket.metin} ({sayi})</option>
            );
          })}
        </select>
      </div>

      {gosterilenLoglar.length === 0 ? (
        <p className="text-charcoal/50 text-center py-12">Kayıt bulunmuyor.</p>
      ) : (
        <div className="space-y-2">
          {gosterilenLoglar.map((log) => {
            const etiket = ISLEM_ETIKETLERI[log.islem] || { metin: log.islem, renk: 'bg-ink/10 text-ink' };
            let detayObj = null;
            try {
              detayObj = log.detay ? JSON.parse(log.detay) : null;
            } catch { /* ignore */ }

            return (
              <div key={log.id} className="bg-paper-dark/30 p-4 rounded-xl border border-ink/5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${etiket.renk}`}>
                      {etiket.metin}
                    </span>
                    {log.hedefTur && log.hedefId && (
                      <span className="text-xs text-charcoal/60">
                        {log.hedefTur} #{log.hedefId}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-charcoal/50">
                    {new Date(log.olusturmaTarihi).toLocaleDateString('tr-TR', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <p className="text-charcoal/70">
                    {log.kullaniciEmail ? (
                      <>
                        <span className="text-ink font-medium">{log.kullaniciEmail}</span>
                        <span className="text-charcoal/50"> (ID: {log.kullaniciId})</span>
                      </>
                    ) : (
                      <span className="text-charcoal/50">Sistem işlemi</span>
                    )}
                  </p>
                </div>

                {detayObj && (
                  <div className="mt-2 text-xs text-charcoal/60 bg-paper rounded-lg p-2 font-mono">
                    {Object.entries(detayObj).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-charcoal/50">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminAuditLog;
