// Siparis tamamlama sayfasi - teslimat bolgesi, kupon uygulama ve PDF makbuz
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BotanicalDivider from '../components/BotanicalDivider';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function Checkout() {
  const [sepet, setSepet] = useState([]);
  const [bolgeler, setBolgeler] = useState([]);
  const [secilenBolgeId, setSecilenBolgeId] = useState('');
  const [form, setForm] = useState({ teslimatAdresi: '', aliciAdSoyad: '', aliciTelefon: '', not: '' });
  const [siparisTamamlandi, setSiparisTamamlandi] = useState(false);
  const [siparisNo, setSiparisNo] = useState(null);
  const [tamamlananSiparis, setTamamlananSiparis] = useState(null);
  const [hata, setHata] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [pdfYukleniyor, setPdfYukleniyor] = useState(false);

  // Kupon icin state'ler
  const [kuponKodu, setKuponKodu] = useState('');
  const [uygulananKupon, setUygulananKupon] = useState(null);
  const [kuponHata, setKuponHata] = useState('');
  const [kuponDogrulaniyor, setKuponDogrulaniyor] = useState(false);

  const { kullanici, yukleniyor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setSepet(JSON.parse(localStorage.getItem('flowershop_sepet') || '[]'));
    api.get('/teslimat-bolgeleri').then((yanit) => setBolgeler(yanit.data));
  }, []);

  const urunToplami = sepet.reduce((acc, k) => acc + Number(k.fiyat) * k.adet, 0);
  const secilenBolge = bolgeler.find((b) => b.id === Number(secilenBolgeId));
  const teslimatUcreti = secilenBolge ? Number(secilenBolge.teslimatUcreti) : 0;
  const endirimTutari = uygulananKupon ? uygulananKupon.endirimTutari : 0;
  const genelToplam = Math.max(0, urunToplami - endirimTutari + teslimatUcreti);

  function alanDegisti(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Kupon dogrulama - backend'e istek atar, endirim tutarini gosterir
  async function kuponuUygula(e) {
    e.preventDefault();
    setKuponHata('');

    if (!kuponKodu.trim()) {
      setKuponHata('Lütfen bir kupon kodu girin.');
      return;
    }

    setKuponDogrulaniyor(true);
    try {
      const yanit = await api.post('/kuponlar/dogrula', {
        kod: kuponKodu.trim(),
        siparisTutari: urunToplami
      });

      setUygulananKupon(yanit.data);
      setKuponKodu('');
    } catch (err) {
      setKuponHata(err.response?.data?.mesaj || 'Kupon dogrulanamadi.');
      setUygulananKupon(null);
    } finally {
      setKuponDogrulaniyor(false);
    }
  }

  function kuponuKaldir() {
    setUygulananKupon(null);
    setKuponHata('');
  }

  const handleDownloadPDF = async () => {
    const makbuzAlani = document.getElementById('receipt-print-area');
    if (!makbuzAlani) {
      alert('Makbuz alanı bulunamadı.');
      return;
    }

    setPdfYukleniyor(true);
    try {
      const canvas = await html2canvas(makbuzAlani, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('receipt-print-area');
          if (el) {
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#2B2B26';
            el.style.borderColor = '#EAE7D8';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfGenislik = pdf.internal.pageSize.getWidth();
      const pdfYukseklik = (canvas.height * pdfGenislik) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfGenislik, pdfYukseklik);
      pdf.save(`FlowerShop-Siparis-${siparisNo || 'Makbuzu'}.pdf`);
    } catch (err) {
      console.error('PDF olusturma hatasi:', err);
      alert('PDF indirilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setPdfYukleniyor(false);
    }
  };

  async function siparisiTamamla(e) {
    e.preventDefault();
    setHata('');

    if (!secilenBolgeId) {
      setHata('Lütfen bir teslimat bölgesi seçin.');
      return;
    }

    setGonderiliyor(true);
    try {
      const yanit = await api.post('/siparisler', {
        urunler: sepet.map((k) => ({ urunId: k.urunId, adet: k.adet })),
        teslimatBolgesiId: Number(secilenBolgeId),
        kuponKodu: uygulananKupon ? uygulananKupon.kod : null,
        ...form
      });

      setSiparisNo(yanit.data.siparis?.id || yanit.data.id || null);

      setTamamlananSiparis({
        form: { ...form },
        bolgeAdi: secilenBolge?.bolgeAdi || '',
        sepet: [...sepet],
        urunToplami,
        endirimTutari,
        kuponKodu: uygulananKupon?.kod || null,
        teslimatUcreti,
        genelToplam,
        tarih: new Date().toLocaleDateString('tr-TR')
      });

      localStorage.removeItem('flowershop_sepet');
      setSiparisTamamlandi(true);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Sipariş oluşturulurken bir hata oluştu.');
      // Kupon hatasi durumunda uygulanan kuponu temizle
      if (err.response?.data?.mesaj?.toLowerCase().includes('kupon')) {
        setUygulananKupon(null);
      }
    } finally {
      setGonderiliyor(false);
    }
  }

  if (yukleniyor) {
    return <p className="text-center py-24 text-charcoal/50">Yükleniyor...</p>;
  }

  if (sepet.length === 0 && !siparisTamamlandi) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="text-charcoal/60 mb-4">Sepetiniz boş.</p>
        <Link to="/urunler" className="text-rose hover:underline">
          Ürünlere göz atın &rarr;
        </Link>
      </div>
    );
  }

  // Siparis tamamlandi ekrani - makbuz ve PDF
  if (siparisTamamlandi && tamamlananSiparis) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-moss/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-moss" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <BotanicalDivider className="w-24 mx-auto mb-6" />

        <h1 className="font-display text-3xl text-center text-ink">Siparişiniz Alındı</h1>

        {siparisNo && (
          <div className="mt-6 flex justify-center">
            <div className="bg-paper-dark/50 border border-ink/10 rounded-2xl px-8 py-4 text-center">
              <p className="text-xs text-charcoal/60 uppercase tracking-widest">Sipariş Numaranız</p>
              <p className="font-display text-2xl text-rose mt-1">#{siparisNo}</p>
            </div>
          </div>
        )}

        <p className="text-charcoal/70 mt-6 text-center max-w-md mx-auto leading-relaxed">
          En kısa sürede sizinle iletişime geçilecektir. Aşağıdaki makbuzu PDF olarak indirebilirsiniz.
        </p>

        <div
          id="receipt-print-area"
          className="mt-8 p-8 rounded-2xl space-y-6"
          style={{ backgroundColor: '#ffffff', border: '1px solid #EAE7D8', color: '#2B2B26' }}
        >
          <div className="text-center pb-4" style={{ borderBottom: '1px solid #EAE7D8' }}>
            <h2 className="font-display text-2xl font-bold" style={{ color: '#21301F' }}>FlowerShop</h2>
            <p className="text-xs mt-1" style={{ color: '#6B7F5B' }}>Sipariş Makbuzu</p>
            {siparisNo && (
              <p className="text-sm mt-2 font-medium" style={{ color: '#B8737A' }}>
                Sipariş No: #{siparisNo}
              </p>
            )}
            <div
              className="mt-3 inline-block px-3 py-1 text-xs font-semibold rounded-full"
              style={{ backgroundColor: '#F3F1E7', color: '#6B7F5B', border: '1px solid #EAE7D8' }}
            >
              ✓ Sipariş Onaylandı
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between pb-1.5" style={{ borderBottom: '1px solid #F3F1E7' }}>
              <span style={{ color: '#666666' }}>Tarih:</span>
              <span className="font-medium" style={{ color: '#2B2B26' }}>{tamamlananSiparis.tarih}</span>
            </div>
            <div className="flex justify-between pb-1.5" style={{ borderBottom: '1px solid #F3F1E7' }}>
              <span style={{ color: '#666666' }}>Alıcı Ad Soyad:</span>
              <span className="font-medium" style={{ color: '#2B2B26' }}>{tamamlananSiparis.form.aliciAdSoyad}</span>
            </div>
            <div className="flex justify-between pb-1.5" style={{ borderBottom: '1px solid #F3F1E7' }}>
              <span style={{ color: '#666666' }}>Telefon:</span>
              <span className="font-medium" style={{ color: '#2B2B26' }}>{tamamlananSiparis.form.aliciTelefon}</span>
            </div>
            <div className="flex justify-between pb-1.5" style={{ borderBottom: '1px solid #F3F1E7' }}>
              <span style={{ color: '#666666' }}>Teslimat Bölgesi:</span>
              <span className="font-medium" style={{ color: '#2B2B26' }}>{tamamlananSiparis.bolgeAdi}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span style={{ color: '#666666' }}>Adres:</span>
              <span className="font-medium text-right max-w-[220px]" style={{ color: '#2B2B26' }}>
                {tamamlananSiparis.form.teslimatAdresi}
              </span>
            </div>
          </div>

          <div className="pt-4" style={{ borderTop: '1px solid #EAE7D8' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#6B7F5B' }}>
              Sipariş Özetiniz
            </h4>
            <div className="space-y-2">
              {tamamlananSiparis.sepet.map((item, index) => (
                <div key={index} className="flex justify-between text-sm" style={{ color: '#2B2B26' }}>
                  <span>{item.ad} × {item.adet}</span>
                  <span className="font-medium">{(Number(item.fiyat) * item.adet).toFixed(2)} TL</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 space-y-1 text-sm" style={{ borderTop: '1px solid #F3F1E7' }}>
              <div className="flex justify-between" style={{ color: '#666666' }}>
                <span>Ürün Toplamı</span>
                <span>{tamamlananSiparis.urunToplami.toFixed(2)} TL</span>
              </div>
              {tamamlananSiparis.endirimTutari > 0 && (
                <div className="flex justify-between" style={{ color: '#6B7F5B' }}>
                  <span>İndirim {tamamlananSiparis.kuponKodu ? `(${tamamlananSiparis.kuponKodu})` : ''}</span>
                  <span>-{tamamlananSiparis.endirimTutari.toFixed(2)} TL</span>
                </div>
              )}
              <div className="flex justify-between" style={{ color: '#666666' }}>
                <span>Teslimat Ücreti</span>
                <span>{tamamlananSiparis.teslimatUcreti.toFixed(2)} TL</span>
              </div>
              <div
                className="flex justify-between font-display text-lg pt-2 font-bold"
                style={{ borderTop: '1px solid #EAE7D8', color: '#21301F' }}
              >
                <span>Genel Toplam</span>
                <span style={{ color: '#B8737A' }}>{tamamlananSiparis.genelToplam.toFixed(2)} TL</span>
              </div>
            </div>
          </div>

          <div
            className="pt-4 text-center text-[11px]"
            style={{ borderTop: '1px solid #F3F1E7', color: '#6B7F5B' }}
          >
            Bizi tercih ettiğiniz için teşekkür ederiz.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfYukleniyor}
            className="flex-1 bg-rose text-paper py-3 px-6 rounded-full font-medium hover:bg-rose-dark transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {pdfYukleniyor ? (
              'PDF Hazırlanıyor...'
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Makbuzu PDF İndir
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/hesabim')}
            className="flex-1 bg-ink text-paper py-3 px-6 rounded-full font-medium hover:bg-ink-light transition-all duration-200 active:scale-95"
          >
            Siparişlerimi Gör
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-charcoal/60 hover:text-rose transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <span className="text-moss text-sm tracking-widest uppercase">Son Adım</span>
        <h1 className="font-display text-3xl text-ink mt-2">Sipariş Tamamla</h1>
      </div>

      <form onSubmit={siparisiTamamla} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-charcoal/70 mb-1">Alıcı Ad Soyad</label>
            <input
              name="aliciAdSoyad"
              onChange={alanDegisti}
              required
              className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
            />
          </div>
          <div>
            <label className="block text-sm text-charcoal/70 mb-1">Alıcı Telefon</label>
            <input
              name="aliciTelefon"
              type="tel"
              inputMode="numeric"
              value={form.aliciTelefon}
              onChange={(e) => setForm({ ...form, aliciTelefon: e.target.value.replace(/\D/g, '') })}
              required
              maxLength={11}
              placeholder="05XXXXXXXXX"
              className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-charcoal/70 mb-1">Teslimat Bölgesi (İlçe)</label>
          <select
            value={secilenBolgeId}
            onChange={(e) => setSecilenBolgeId(e.target.value)}
            required
            className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
          >
            <option value="">Bölge Seçin</option>
            {bolgeler.map((bolge) => (
              <option key={bolge.id} value={bolge.id}>
                {bolge.bolgeAdi} — {Number(bolge.teslimatUcreti).toFixed(2)} TL
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-charcoal/70 mb-1">Açık Teslimat Adresi</label>
          <textarea
            name="teslimatAdresi"
            onChange={alanDegisti}
            required
            rows="3"
            className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
          />
        </div>

        <div>
          <label className="block text-sm text-charcoal/70 mb-1">Not (opsiyonel)</label>
          <textarea
            name="not"
            onChange={alanDegisti}
            rows="2"
            className="w-full border border-ink/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose bg-paper"
          />
        </div>

        {/* ============ KUPON BOLUMU ============ */}
        <div className="bg-paper-dark/30 rounded-2xl p-5 border border-ink/5">
          {!uygulananKupon ? (
            <>
              <label className="block text-sm text-charcoal/70 mb-2 font-medium">
                İndirim Kuponunuz Var mı?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={kuponKodu}
                  onChange={(e) => {
                    setKuponKodu(e.target.value.toUpperCase());
                    setKuponHata('');
                  }}
                  placeholder="Kupon kodunuzu girin"
                  className="flex-1 border border-ink/20 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose bg-paper uppercase text-sm"
                />
                <button
                  type="button"
                  onClick={kuponuUygula}
                  disabled={kuponDogrulaniyor || !kuponKodu.trim()}
                  className="bg-moss text-paper px-5 py-2.5 rounded-xl text-sm hover:bg-moss/90 transition-all duration-200 active:scale-95 disabled:opacity-60 whitespace-nowrap"
                >
                  {kuponDogrulaniyor ? 'Kontrol...' : 'Uygula'}
                </button>
              </div>
              {kuponHata && <p className="text-xs text-rose-dark mt-2">{kuponHata}</p>}
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-moss" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-display text-lg text-ink">{uygulananKupon.kod}</span>
                </div>
                <p className="text-xs text-moss mt-1">
                  {uygulananKupon.endirimTuru === 'YUZDE'
                    ? `%${uygulananKupon.endirimDeger} indirim uygulandı`
                    : `${Number(uygulananKupon.endirimDeger).toFixed(2)} TL indirim uygulandı`
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={kuponuKaldir}
                className="text-xs text-rose-dark hover:underline"
              >
                Kaldır
              </button>
            </div>
          )}
        </div>
        {/* ============ KUPON BOLUMU SONU ============ */}

        <div className="bg-paper-dark/50 rounded-2xl p-5 space-y-2 text-charcoal">
          <div className="flex justify-between text-sm">
            <span>Ürün Toplamı</span>
            <span>{urunToplami.toFixed(2)} TL</span>
          </div>
          {endirimTutari > 0 && (
            <div className="flex justify-between text-sm text-moss">
              <span>İndirim</span>
              <span>-{endirimTutari.toFixed(2)} TL</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Teslimat Ücreti</span>
            <span>{teslimatUcreti.toFixed(2)} TL</span>
          </div>
          <div className="flex justify-between font-display text-lg text-ink pt-2 border-t border-ink/10">
            <span>Genel Toplam</span>
            <span className="text-rose">{genelToplam.toFixed(2)} TL</span>
          </div>
        </div>

        {hata && <p className="text-sm text-rose-dark">{hata}</p>}

        <button
          type="submit"
          disabled={gonderiliyor}
          className="w-full bg-ink text-paper py-3 rounded-full hover:bg-ink-light transition-all duration-200 active:scale-95 disabled:opacity-60"
        >
          {gonderiliyor ? 'Sipariş oluşturuluyor...' : 'Siparişi Onayla'}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
 