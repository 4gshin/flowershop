// Admin panelinde kupon yonetimi - yaratma, aktif/pasif, silme
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

function AdminKuponlar() {
  const { toastGoster } = useToast();
  const [kuponlar, setKuponlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  const [form, setForm] = useState({
    kod: '',
    aciklama: '',
    endirimTuru: 'YUZDE',
    endirimDeger: '',
    minSiparisTutari: '',
    kullanimLimiti: '',
    gecerlilikTarihi: ''
  });

  function verileriYukle() {
    setYukleniyor(true);
    api.get('/kuponlar')
      .then((yanit) => setKuponlar(yanit.data))
      .catch(() => setKuponlar([]))
      .finally(() => setYukleniyor(false));
  }

  useEffect(() => {
    verileriYukle();
  }, []);

  function alanDegisti(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function formuSifirla() {
    setForm({
      kod: '',
      aciklama: '',
      endirimTuru: 'YUZDE',
      endirimDeger: '',
      minSiparisTutari: '',
      kullanimLimiti: '',
      gecerlilikTarihi: ''
    });
  }

  async function formGonder(e) {
    e.preventDefault();
    setGonderiliyor(true);

    try {
      await api.post('/kuponlar', {
        kod: form.kod,
        aciklama: form.aciklama || null,
        endirimTuru: form.endirimTuru,
        endirimDeger: Number(form.endirimDeger),
        minSiparisTutari: form.minSiparisTutari ? Number(form.minSiparisTutari) : null,
        kullanimLimiti: form.kullanimLimiti ? Number(form.kullanimLimiti) : null,
        gecerlilikTarihi: form.gecerlilikTarihi || null
      });

      toastGoster('Kupon oluşturuldu.', 'basari');
      formuSifirla();
      verileriYukle();
    } catch (err) {
      toastGoster(err.response?.data?.mesaj || 'Kupon eklenirken bir hata oluştu.', 'hata');
    } finally {
      setGonderiliyor(false);
    }
  }

  async function durumDegistir(kupon) {
    try {
      await api.patch(`/kuponlar/${kupon.id}/durum`);
      toastGoster(
        kupon.aktif ? `${kupon.kod} pasif edildi.` : `${kupon.kod} aktifleştirildi.`,
        'basari'
      );
      verileriYukle();
    } catch {
      toastGoster('Durum değiştirilemedi.', 'hata');
    }
  }

  async function kuponSil(kupon) {
    if (!window.confirm(`"${kupon.kod}" kuponunu silmek istediğinize emin misiniz?`)) return;
    try {
      await api.delete(`/kuponlar/${kupon.id}`);
      toastGoster('Kupon silindi.', 'basari');
      verileriYukle();
    } catch (err) {
      toastGoster(err.response?.data?.mesaj || 'Kupon silinemedi.', 'hata');
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Yeni kupon formu */}
      <form onSubmit={formGonder} className="space-y-3 bg-paper-dark/40 p-6 rounded-2xl border border-ink/5 h-fit">
        <h2 className="font-display text-lg text-ink mb-2">Yeni Kupon Ekle</h2>

        <div>
          <label className="block text-xs text-charcoal/70 mb-1">Kupon Kodu *</label>
          <input
            name="kod"
            placeholder="Ör: HOSGELDIN10"
            value={form.kod}
            onChange={(e) => setForm({ ...form, kod: e.target.value.toUpperCase() })}
            required
            className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose uppercase"
          />
        </div>

        <div>
          <label className="block text-xs text-charcoal/70 mb-1">Açıklama</label>
          <input
            name="aciklama"
            placeholder="Ör: İlk siparişe özel %10 indirim"
            value={form.aciklama}
            onChange={alanDegisti}
            className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-charcoal/70 mb-1">İndirim Türü *</label>
            <select
              name="endirimTuru"
              value={form.endirimTuru}
              onChange={alanDegisti}
              className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper"
            >
              <option value="YUZDE">Yüzde (%)</option>
              <option value="SABIT">Sabit (TL)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-charcoal/70 mb-1">
              Değer * {form.endirimTuru === 'YUZDE' ? '(%)' : '(TL)'}
            </label>
            <input
              name="endirimDeger"
              type="number"
              step="0.01"
              min="1"
              max={form.endirimTuru === 'YUZDE' ? 100 : undefined}
              placeholder={form.endirimTuru === 'YUZDE' ? '10' : '50'}
              value={form.endirimDeger}
              onChange={alanDegisti}
              required
              className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-charcoal/70 mb-1">Minimum Sepet Tutarı (TL)</label>
          <input
            name="minSiparisTutari"
            type="number"
            step="0.01"
            placeholder="200 (opsiyonel)"
            value={form.minSiparisTutari}
            onChange={alanDegisti}
            className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
          />
        </div>

        <div>
          <label className="block text-xs text-charcoal/70 mb-1">Toplam Kullanım Limiti</label>
          <input
            name="kullanimLimiti"
            type="number"
            placeholder="100 (opsiyonel, boş = sınırsız)"
            value={form.kullanimLimiti}
            onChange={alanDegisti}
            className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
          />
        </div>

        <div>
          <label className="block text-xs text-charcoal/70 mb-1">Geçerlilik Tarihi</label>
          <input
            name="gecerlilikTarihi"
            type="date"
            value={form.gecerlilikTarihi}
            onChange={alanDegisti}
            className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
          />
          <p className="text-xs text-charcoal/50 mt-1">Boş bırakılırsa süresizdir.</p>
        </div>

        <button
          type="submit"
          disabled={gonderiliyor}
          className="w-full bg-ink text-paper py-2 rounded-full hover:bg-ink-light transition-all duration-200 active:scale-95 disabled:opacity-60"
        >
          {gonderiliyor ? 'Kaydediliyor...' : 'Kupon Oluştur'}
        </button>
      </form>

      {/* Kupon listesi */}
      <div>
        <h2 className="font-display text-lg text-ink mb-3">
          Mevcut Kuponlar <span className="text-charcoal/50 text-sm">({kuponlar.length})</span>
        </h2>

        {yukleniyor ? (
          <Spinner boyut="sm" />
        ) : kuponlar.length === 0 ? (
          <div className="text-center py-12 bg-paper-dark/20 rounded-2xl">
            <p className="text-charcoal/60 text-sm">Henüz kupon oluşturulmamış.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[36rem] overflow-y-auto pr-1">
            {kuponlar.map((kupon) => {
              const suresiBitti = kupon.gecerlilikTarihi && new Date(kupon.gecerlilikTarihi) < new Date();
              const limitDoldu = kupon.kullanimLimiti && kupon.kullanimSayisi >= kupon.kullanimLimiti;
              const kullanilabilir = kupon.aktif && !suresiBitti && !limitDoldu;

              return (
                <div
                  key={kupon.id}
                  className={`p-4 rounded-xl border ${
                    kullanilabilir
                      ? 'bg-paper-dark/30 border-ink/10'
                      : 'bg-paper-dark/10 border-ink/5 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-display text-lg text-ink font-medium">{kupon.kod}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          kullanilabilir ? 'bg-moss/20 text-moss' : 'bg-ink/10 text-charcoal/60'
                        }`}>
                          {!kupon.aktif ? 'Pasif' : suresiBitti ? 'Süresi Bitti' : limitDoldu ? 'Limit Doldu' : 'Aktif'}
                        </span>
                      </div>

                      {kupon.aciklama && (
                        <p className="text-xs text-charcoal/60 mb-1">{kupon.aciklama}</p>
                      )}

                      <p className="text-sm text-ink">
                        <span className="text-rose font-medium">
                          {kupon.endirimTuru === 'YUZDE'
                            ? `%${Number(kupon.endirimDeger)}`
                            : `${Number(kupon.endirimDeger).toFixed(2)} TL`
                          } indirim
                        </span>
                      </p>

                      <div className="text-xs text-charcoal/50 mt-2 space-y-0.5">
                        {kupon.minSiparisTutari && (
                          <p>Min. sepet: {Number(kupon.minSiparisTutari).toFixed(2)} TL</p>
                        )}
                        <p>
                          Kullanım: {kupon.kullanimSayisi}
                          {kupon.kullanimLimiti ? ` / ${kupon.kullanimLimiti}` : ' (sınırsız)'}
                        </p>
                        {kupon.gecerlilikTarihi && (
                          <p>
                            Geçerlilik: {new Date(kupon.gecerlilikTarihi).toLocaleDateString('tr-TR')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => durumDegistir(kupon)}
                        className="text-xs text-moss hover:underline whitespace-nowrap"
                      >
                        {kupon.aktif ? 'Pasif Et' : 'Aktif Et'}
                      </button>
                      {kupon.kullanimSayisi === 0 && (
                        <button
                          onClick={() => kuponSil(kupon)}
                          className="text-xs text-rose-dark hover:underline"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminKuponlar;
