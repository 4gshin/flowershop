// Admin panelinde urun yonetimi - listeleme, ekleme, guncelleme, silme
import { useEffect, useState } from 'react';
import api from '../../api/axios';

function AdminUrunler() {
  const [urunler, setUrunler] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [form, setForm] = useState({ ad: '', aciklama: '', fiyat: '', stokAdedi: '', kategoriId: '' });
  const [gorselDosyasi, setGorselDosyasi] = useState(null);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [mesaj, setMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);

  // Ust kategorileri ve alt kategorileri tek bir duz listeye ceviriyoruz (secim kutusu icin)
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function formGonder(e) {
    e.preventDefault();
    setMesaj('');

    try {
      if (duzenlenenId) {
        // Guncelleme - gorsel degistirme su an desteklenmiyor, sadece metin alanlari
        await api.put(`/urunler/${duzenlenenId}`, {
          ad: form.ad,
          aciklama: form.aciklama,
          fiyat: Number(form.fiyat),
          stokAdedi: Number(form.stokAdedi),
          kategoriId: Number(form.kategoriId)
        });
        setMesaj('Ürün güncellendi.');
      } else {
        const formData = new FormData();
        Object.entries(form).forEach(([anahtar, deger]) => formData.append(anahtar, deger));
        if (gorselDosyasi) formData.append('gorsel', gorselDosyasi);

        await api.post('/urunler', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMesaj('Ürün eklendi.');
      }

      formuSifirla();
      verileriYukle();
    } catch (err) {
      setMesaj(err.response?.data?.mesaj || 'Bir hata oluştu.');
    }
  }

  async function urunSil(id) {
    if (!window.confirm('Bu ürünü kaldırmak istediğinize emin misiniz?')) return;
    await api.delete(`/urunler/${id}`);
    verileriYukle();
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Form */}
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

        {!duzenlenenId && (
          <div>
            <label className="block text-sm text-charcoal/60 mb-1">Ürün Görseli</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setGorselDosyasi(e.target.files[0])}
              className="w-full text-sm"
            />
          </div>
        )}

        {mesaj && <p className="text-sm text-moss">{mesaj}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-ink text-paper py-2 rounded-full hover:bg-ink-light transition-colors"
          >
            {duzenlenenId ? 'Güncelle' : 'Ürünü Kaydet'}
          </button>
          {duzenlenenId && (
            <button
              type="button"
              onClick={formuSifirla}
              className="px-4 py-2 rounded-full border border-ink/20 hover:bg-ink/5"
            >
              Vazgeç
            </button>
          )}
        </div>
      </form>

      {/* Urun listesi */}
      <div>
        <h2 className="font-display text-lg text-ink mb-3">Mevcut Ürünler</h2>
        {yukleniyor ? (
          <p className="text-charcoal/50 text-sm">Yükleniyor...</p>
        ) : (
          <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
            {urunler.map((urun) => (
              <div
                key={urun.id}
                className="flex items-center justify-between bg-paper-dark/30 p-3 rounded-xl border border-ink/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-rose/10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {urun.gorselUrl ? (
                      <img src={urun.gorselUrl} alt={urun.ad} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs opacity-40">—</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{urun.ad}</p>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUrunler;
