// Admin panelinde urun yonetimi - listeleme, ekleme, guncelleme (gorsel dahil), silme
import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

function AdminUrunler() {
  const { toastGoster } = useToast();
  const [urunler, setUrunler] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [form, setForm] = useState({ ad: '', aciklama: '', fiyat: '', stokAdedi: '', kategoriId: '' });
  const [gorselDosyasi, setGorselDosyasi] = useState(null);
  const [mevcutGorselUrl, setMevcutGorselUrl] = useState(null);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);

  const tumKategoriler = kategoriler.flatMap((k) => [k, ...(k.altKategoriler || [])]);

  function verileriYukle() {
    setYukleniyor(true);
    Promise.all([api.get('/urunler'), api.get('/kategoriler')])
      .then(([urunYanit, kategoriYanit]) => {
        setUrunler(urunYanit.data);
        setKategoriler(kategoriYanit.data);
      })
      .finally(() => setYukleniyor(false));
  }

  useEffect(() => {
    verileriYukle();
  }, []);

  function alanDegisti(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function formuSifirla() {
    setForm({ ad: '', aciklama: '', fiyat: '', stokAdedi: '', kategoriId: '' });
    setGorselDosyasi(null);
    setMevcutGorselUrl(null);
    setDuzenlenenId(null);
  }

  function duzenlemeyeBasla(urun) {
    setDuzenlenenId(urun.id);
    setForm({
      ad: urun.ad,
      aciklama: urun.aciklama || '',
      fiyat: urun.fiyat,
      stokAdedi: urun.stokAdedi,
      kategoriId: urun.kategoriId
    });
    setGorselDosyasi(null);
    setMevcutGorselUrl(urun.gorselUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function formGonder(e) {
    e.preventDefault();
    setGonderiliyor(true);

    try {
      const formData = new FormData();
      formData.append('ad', form.ad);
      formData.append('aciklama', form.aciklama);
      formData.append('fiyat', form.fiyat);
      formData.append('stokAdedi', form.stokAdedi);
      formData.append('kategoriId', form.kategoriId);
      if (gorselDosyasi) formData.append('gorsel', gorselDosyasi);

      if (duzenlenenId) {
        await api.put(`/urunler/${duzenlenenId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toastGoster('Ürün güncellendi.', 'basari');
      } else {
        await api.post('/urunler', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toastGoster('Ürün eklendi.', 'basari');
      }

      formuSifirla();
      verileriYukle();
    } catch (err) {
      toastGoster(err.response?.data?.mesaj || 'Bir hata oluştu.', 'hata');
    } finally {
      setGonderiliyor(false);
    }
  }

  async function urunSil(id) {
    if (!window.confirm('Bu ürünü kaldırmak istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/urunler/${id}`);
      toastGoster('Ürün kaldırıldı.', 'basari');
      verileriYukle();
    } catch (err) {
      toastGoster('Ürün silinemedi.', 'hata');
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <form onSubmit={formGonder} className="space-y-3 bg-paper-dark/40 p-6 rounded-2xl border border-ink/5 h-fit">
        <h2 className="font-display text-lg text-ink mb-2">
          {duzenlenenId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
        </h2>

        <input
          name="ad"
          placeholder="Ürün Adı"
          value={form.ad}
          onChange={alanDegisti}
          required
          className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
        />
        <textarea
          name="aciklama"
          placeholder="Açıklama"
          value={form.aciklama}
          onChange={alanDegisti}
          rows="2"
          className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
        />
        <input
          name="fiyat"
          type="number"
          step="0.01"
          placeholder="Fiyat (TL)"
          value={form.fiyat}
          onChange={alanDegisti}
          required
          className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
        />
        <input
          name="stokAdedi"
          type="number"
          placeholder="Stok Adedi"
          value={form.stokAdedi}
          onChange={alanDegisti}
          className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
        />
        <select
          name="kategoriId"
          value={form.kategoriId}
          onChange={alanDegisti}
          required
          className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
        >
          <option value="">Kategori Seçin</option>
          {tumKategoriler.map((k) => (
            <option key={k.id} value={k.id}>{k.parentId ? `— ${k.ad}` : k.ad}</option>
          ))}
        </select>

        <div>
          <label className="block text-sm text-charcoal/60 mb-1">
            {duzenlenenId ? 'Yeni Görsel Yükle (opsiyonel)' : 'Ürün Görseli'}
          </label>

          {duzenlenenId && mevcutGorselUrl && !gorselDosyasi && (
            <div className="w-20 h-20 rounded-lg overflow-hidden mb-2 border border-ink/10">
              <img src={mevcutGorselUrl} alt="Mevcut görsel" className="w-full h-full object-cover" />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setGorselDosyasi(e.target.files[0])}
            className="w-full text-sm"
          />
          {duzenlenenId && (
            <p className="text-xs text-charcoal/50 mt-1">
              Boş bırakırsanız mevcut görsel korunur.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={gonderiliyor}
            className="flex-1 bg-ink text-paper py-2 rounded-full hover:bg-ink-light transition-all duration-200 active:scale-95 disabled:opacity-60"
          >
            {gonderiliyor ? 'Kaydediliyor...' : duzenlenenId ? 'Güncelle' : 'Ürünü Kaydet'}
          </button>
          {duzenlenenId && (
            <button
              type="button"
              onClick={formuSifirla}
              className="px-4 py-2 rounded-full border border-ink/20 hover:bg-ink/5 transition-all duration-200 active:scale-95"
            >
              Vazgeç
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Mevcut Ürünler</h2>
        {yukleniyor ? (
          <Spinner boyut="sm" />
        ) : (
          <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
            {urunler.map((urun) => {
              const stoktaYok = urun.stokAdedi <= 0;
              return (
                <div
                  key={urun.id}
                  className="flex items-center justify-between bg-paper-dark/30 p-3 rounded-xl border border-ink/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 bg-rose/10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${stoktaYok ? 'grayscale opacity-60' : ''}`}>
                      {urun.gorselUrl ? (
                        <img src={urun.gorselUrl} alt={urun.ad} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs opacity-40">—</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-ink truncate">{urun.ad}</p>
                        {stoktaYok && (
                          <span className="text-[10px] bg-ink text-paper px-2 py-0.5 rounded-full shrink-0">
                            Tükendi
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-charcoal/50">
                        {Number(urun.fiyat).toFixed(2)} TL · Stok: {urun.stokAdedi}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => duzenlemeyeBasla(urun)}
                      className="text-xs text-moss hover:underline"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => urunSil(urun.id)}
                      className="text-xs text-rose-dark hover:underline"
                    >
                      Kaldır
                    </button>
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

export default AdminUrunler;
