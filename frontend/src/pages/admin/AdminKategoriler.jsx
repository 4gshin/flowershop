// Admin panelinde kategori yonetimi - ust ve alt kategori ekleme, silme
import { useEffect, useState } from 'react';
import api from '../../api/axios';

function AdminKategoriler() {
  const [kategoriler, setKategoriler] = useState([]);
  const [form, setForm] = useState({ ad: '', aciklama: '', parentId: '' });
  const [mesaj, setMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);

  function verileriYukle() {
    setYukleniyor(true);
    api.get('/kategoriler')
      .then((yanit) => setKategoriler(yanit.data))
      .finally(() => setYukleniyor(false));
  }

  useEffect(() => {
    verileriYukle();
  }, []);

  function alanDegisti(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function formGonder(e) {
    e.preventDefault();
    setMesaj('');
    try {
      await api.post('/kategoriler', {
        ad: form.ad,
        aciklama: form.aciklama,
        parentId: form.parentId || null
      });
      setForm({ ad: '', aciklama: '', parentId: '' });
      setMesaj('Kategori eklendi.');
      verileriYukle();
    } catch (err) {
      setMesaj(err.response?.data?.mesaj || 'Bir hata oluştu.');
    }
  }

  async function kategoriSil(id) {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz? İçinde ürün varsa silinemeyebilir.')) return;
    try {
      await api.delete(`/kategoriler/${id}`);
      verileriYukle();
    } catch (err) {
      alert(err.response?.data?.mesaj || 'Kategori silinemedi.');
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Form */}
      <form onSubmit={formGonder} className="space-y-3 bg-paper-dark/40 p-6 rounded-2xl border border-ink/5 h-fit">
        <h2 className="font-display text-lg text-ink mb-2">Yeni Kategori Ekle</h2>

        <input
          name="ad"
          placeholder="Kategori Adı"
          value={form.ad}
          onChange={alanDegisti}
          required
          className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
        />
        <textarea
          name="aciklama"
          placeholder="Açıklama (opsiyonel)"
          value={form.aciklama}
          onChange={alanDegisti}
          rows="2"
          className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
        />
        <div>
          <label className="block text-sm text-charcoal/60 mb-1">Üst Kategori (opsiyonel)</label>
          <select
            name="parentId"
            value={form.parentId}
            onChange={alanDegisti}
            className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
          >
            <option value="">— Ana Kategori Olarak Ekle —</option>
            {kategoriler.filter((k) => !k.parentId).map((k) => (
              <option key={k.id} value={k.id}>{k.ad}</option>
            ))}
          </select>
          <p className="text-xs text-charcoal/50 mt-1">
            Boş bırakırsanız yeni bir ana kategori oluşturulur; bir kategori seçerseniz onun alt kategorisi olur.
          </p>
        </div>

        {mesaj && <p className="text-sm text-moss">{mesaj}</p>}

        <button
          type="submit"
          className="w-full bg-ink text-paper py-2 rounded-full hover:bg-ink-light transition-colors"
        >
          Kategoriyi Kaydet
        </button>
      </form>

      {/* Liste */}
      <div>
        <h2 className="font-display text-lg text-ink mb-3">Mevcut Kategoriler</h2>
        {yukleniyor ? (
          <p className="text-charcoal/50 text-sm">Yükleniyor...</p>
        ) : (
          <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
            {kategoriler.map((kategori) => (
              <div key={kategori.id} className="bg-paper-dark/30 rounded-xl border border-ink/5 overflow-hidden">
                <div className="flex items-center justify-between p-3">
                  <span className="font-medium text-ink">{kategori.ad}</span>
                  <button
                    onClick={() => kategoriSil(kategori.id)}
                    className="text-xs text-rose-dark hover:underline"
                  >
                    Kaldır
                  </button>
                </div>
                {kategori.altKategoriler?.length > 0 && (
                  <div className="border-t border-ink/5 px-3 py-2 space-y-1">
                    {kategori.altKategoriler.map((alt) => (
                      <div key={alt.id} className="flex items-center justify-between pl-3">
                        <span className="text-sm text-charcoal/70">— {alt.ad}</span>
                        <button
                          onClick={() => kategoriSil(alt.id)}
                          className="text-xs text-rose-dark hover:underline"
                        >
                          Kaldır
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminKategoriler;
