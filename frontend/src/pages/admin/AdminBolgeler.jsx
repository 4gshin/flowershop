// Admin panelinde teslimat bolgesi yonetimi - ekleme, ucret guncelleme, silme
import { useEffect, useState } from 'react';
import api from '../../api/axios';

function AdminBolgeler() {
  const [bolgeler, setBolgeler] = useState([]);
  const [form, setForm] = useState({ bolgeAdi: '', teslimatUcreti: '' });
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [duzenlenenUcret, setDuzenlenenUcret] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);

  function verileriYukle() {
    setYukleniyor(true);
    api.get('/teslimat-bolgeleri')
      .then((yanit) => setBolgeler(yanit.data))
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
      await api.post('/teslimat-bolgeleri', {
        bolgeAdi: form.bolgeAdi,
        teslimatUcreti: Number(form.teslimatUcreti)
      });
      setForm({ bolgeAdi: '', teslimatUcreti: '' });
      setMesaj('Bölge eklendi.');
      verileriYukle();
    } catch (err) {
      setMesaj(err.response?.data?.mesaj || 'Bir hata oluştu.');
    }
  }

  function duzenlemeyeBasla(bolge) {
    setDuzenlenenId(bolge.id);
    setDuzenlenenUcret(bolge.teslimatUcreti);
  }

  async function ucretiKaydet(id) {
    await api.put(`/teslimat-bolgeleri/${id}`, { teslimatUcreti: Number(duzenlenenUcret) });
    setDuzenlenenId(null);
    verileriYukle();
  }

  async function bolgeSil(id) {
    if (!window.confirm('Bu bölgeyi silmek istediğinize emin misiniz?')) return;
    await api.delete(`/teslimat-bolgeleri/${id}`);
    verileriYukle();
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Form */}
      <form onSubmit={formGonder} className="space-y-3 bg-paper-dark/40 p-6 rounded-2xl border border-ink/5 h-fit">
        <h2 className="font-display text-lg text-ink mb-2">Yeni Teslimat Bölgesi Ekle</h2>

        <input
          name="bolgeAdi"
          placeholder="Bölge / İlçe Adı"
          value={form.bolgeAdi}
          onChange={alanDegisti}
          required
          className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
        />
        <input
          name="teslimatUcreti"
          type="number"
          step="0.01"
          placeholder="Teslimat Ücreti (TL)"
          value={form.teslimatUcreti}
          onChange={alanDegisti}
          required
          className="w-full border border-ink/20 rounded-xl px-4 py-2 bg-paper focus:outline-none focus:ring-2 focus:ring-rose"
        />

        {mesaj && <p className="text-sm text-moss">{mesaj}</p>}

        <button
          type="submit"
          className="w-full bg-ink text-paper py-2 rounded-full hover:bg-ink-light transition-colors"
        >
          Bölgeyi Kaydet
        </button>
      </form>

      {/* Liste */}
      <div>
        <h2 className="font-display text-lg text-ink mb-3">Mevcut Bölgeler</h2>
        {yukleniyor ? (
          <p className="text-charcoal/50 text-sm">Yükleniyor...</p>
        ) : (
          <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-1">
            {bolgeler.map((bolge) => (
              <div
                key={bolge.id}
                className="flex items-center justify-between bg-paper-dark/30 p-3 rounded-xl border border-ink/5"
              >
                <span className="text-ink">{bolge.bolgeAdi}</span>

                {duzenlenenId === bolge.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={duzenlenenUcret}
                      onChange={(e) => setDuzenlenenUcret(e.target.value)}
                      className="w-20 border border-ink/20 rounded-lg px-2 py-1 text-sm bg-paper"
                    />
                    <button
                      onClick={() => ucretiKaydet(bolge.id)}
                      className="text-xs text-moss hover:underline"
                    >
                      Kaydet
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-charcoal/60">{Number(bolge.teslimatUcreti).toFixed(2)} TL</span>
                    <button
                      onClick={() => duzenlemeyeBasla(bolge)}
                      className="text-xs text-moss hover:underline"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => bolgeSil(bolge.id)}
                      className="text-xs text-rose-dark hover:underline"
                    >
                      Kaldır
                    </button>
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

export default AdminBolgeler;
