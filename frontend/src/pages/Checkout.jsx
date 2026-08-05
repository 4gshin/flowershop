// Sipariş tamamlama sayfası - teslimat bölgesi seçimine göre ücret otomatik hesaplanır
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
  const [hata, setHata] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [pdfYukleniyor, setPdfYukleniyor] = useState(false);

  const [tamamlananSiparis, setTamamlananSiparis] = useState(null);

  const { kullanici, yukleniyor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setSepet(JSON.parse(localStorage.getItem('flowershop_sepet') || '[]'));
    api.get('/teslimat-bolgeleri').then((yanit) => setBolgeler(yanit.data));
  }, []);

  const urunToplami = sepet.reduce((acc, k) => acc + Number(k.fiyat) * k.adet, 0);
  const secilenBolge = bolgeler.find((b) => b.id === Number(secilenBolgeId));
  const teslimatUcreti = secilenBolge ? Number(secilenBolge.teslimatUcreti) : 0;
  const genelToplam = urunToplami + teslimatUcreti;

  function alanDegisti(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Güvenli ve oklch Hatası Vermeyen PDF İndirme Fonksiyonu
  const handleDownloadPDF = async () => {
    const makbuzAlani = document.getElementById('receipt-print-area');
    if (!makbuzAlani) {
      alert('Makbuz alanı bulunamadı.');
      return;
    }

    setPdfYukleniyor(true);
    try {
      // oklch hatasını önlemek için html2canvas'a saf HEX kodlu arka plan zorlanıyor
      const canvas = await html2canvas(makbuzAlani, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Klonlanan DOM üzerinde olası tüm oklch renk sorunlarını HEX ile eziyoruz
          const el = clonedDoc.getElementById('receipt-print-area');
          if (el) {
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#1f2937';
            el.style.borderColor = '#e5e7eb';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfGenislik = pdf.internal.pageSize.getWidth();
      const pdfYukseklik = (canvas.height * pdfGenislik) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfGenislik, pdfYukseklik);
      pdf.save('FlowerShop-Siparis-Makbuzu.pdf');
    } catch (err) {
      console.error('PDF oluşturma hatası:', err);
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
      await api.post('/siparisler', {
        urunler: sepet.map((k) => ({ urunId: k.urunId, adet: k.adet })),
        teslimatBolgesiId: Number(secilenBolgeId),
        ...form
      });

      setTamamlananSiparis({
        form: { ...form },
        bolgeAdi: secilenBolge?.bolgeAdi || '',
        sepet: [...sepet],
        urunToplami,
        teslimatUcreti,
        genelToplam,
        tarih: new Date().toLocaleDateString('tr-TR')
      });

      localStorage.removeItem('flowershop_sepet');
      setSiparisTamamlandi(true);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Sipariş oluşturulurken bir hata oluştu.');
    } finally {
      setGonderiliyor(false);
    }
  }

  if (yukleniyor) {
    return <p className="text-center py-24" style={{ color: '#6b7280' }}>Yükleniyor...</p>;
  }

  if (!kullanici) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl mb-4" style={{ color: '#1f2937' }}>Giriş Yapmanız Gerekiyor</h1>
        <p className="mb-6" style={{ color: '#4b5563' }}>Sipariş verebilmek için önce giriş yapmalısınız.</p>
        <Link
          to="/giris"
          className="inline-block px-8 py-3 rounded-full transition-colors"
          style={{ backgroundColor: '#111827', color: '#ffffff' }}
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  if (sepet.length === 0 && !siparisTamamlandi) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <p className="mb-4" style={{ color: '#6b7280' }}>Sepetiniz boş.</p>
        <Link to="/urunler" className="hover:underline" style={{ color: '#e11d48' }}>Ürünlere göz atın &rarr;</Link>
      </div>
    );
  }

  // SİPARİŞ BAŞARIYLA ALINDIĞINDA GÖRÜNECEK MAKBUZ VE PDF EKRANI
  if (siparisTamamlandi && tamamlananSiparis) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12">
        <BotanicalDivider className="w-24 mx-auto mb-6" />
        <h1 className="font-display text-3xl text-center" style={{ color: '#111827' }}>Siparişiniz Alındı</h1>
        <p className="mt-2 text-center text-sm mb-8" style={{ color: '#4b5563' }}>
          En kısa sürede sizinle iletişime geçilecektir.
        </p>

        {/* ================= PDF OLARAK ÇIKARILACAK MAKBUZ ALANI ================= */}
        {/* html2canvas'ın oklch hatasına takılmaması için tüm renkler saf HEX / RGB ile inline verildi */}
        <div
          id="receipt-print-area"
          className="p-8 rounded-2xl shadow-sm space-y-6"
          style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#1f2937' }}
        >
          <div className="text-center pb-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <h2 className="font-display text-2xl font-bold" style={{ color: '#111827' }}>FlowerShop</h2>
            <p className="text-xs mt-1" style={{ color: '#6b7280' }}>Sipariş Bilgilendirme & Makbuzu</p>
            <div
              className="mt-3 inline-block px-3 py-1 text-xs font-semibold rounded-full"
              style={{ backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
            >
              ✓ Sipariş Onaylandı
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between pb-1.5" style={{ borderBottom: '1px solid #f9fafb' }}>
              <span style={{ color: '#6b7280' }}>Tarih:</span>
              <span className="font-medium" style={{ color: '#1f2937' }}>{tamamlananSiparis.tarih}</span>
            </div>
            <div className="flex justify-between pb-1.5" style={{ borderBottom: '1px solid #f9fafb' }}>
              <span style={{ color: '#6b7280' }}>Alıcı Ad Soyad:</span>
              <span className="font-medium" style={{ color: '#1f2937' }}>{tamamlananSiparis.form.aliciAdSoyad}</span>
            </div>
            <div className="flex justify-between pb-1.5" style={{ borderBottom: '1px solid #f9fafb' }}>
              <span style={{ color: '#6b7280' }}>Telefon:</span>
              <span className="font-medium" style={{ color: '#1f2937' }}>{tamamlananSiparis.form.aliciTelefon}</span>
            </div>
            <div className="flex justify-between pb-1.5" style={{ borderBottom: '1px solid #f9fafb' }}>
              <span style={{ color: '#6b7280' }}>Teslimat Bölgesi:</span>
              <span className="font-medium" style={{ color: '#1f2937' }}>{tamamlananSiparis.bolgeAdi}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span style={{ color: '#6b7280' }}>Adres:</span>
              <span className="font-medium text-right max-w-[220px]" style={{ color: '#1f2937' }}>
                {tamamlananSiparis.form.teslimatAdresi}
              </span>
            </div>
          </div>

          <div className="pt-4" style={{ borderTop: '1px solid #f3f4f6' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#9ca3af' }}>
              Sipariş Özetiniz
            </h4>
            <div className="space-y-2">
              {tamamlananSiparis.sepet.map((item, index) => (
                <div key={index} className="flex justify-between text-sm" style={{ color: '#374151' }}>
                  <span>{item.ad} x {item.adet}</span>
                  <span className="font-medium">{(Number(item.fiyat) * item.adet).toFixed(2)} TL</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 space-y-1 text-sm" style={{ borderTop: '1px solid #f3f4f6' }}>
              <div className="flex justify-between" style={{ color: '#4b5563' }}>
                <span>Ürün Toplamı</span>
                <span>{tamamlananSiparis.urunToplami.toFixed(2)} TL</span>
              </div>
              <div className="flex justify-between" style={{ color: '#4b5563' }}>
                <span>Teslimat Ücreti</span>
                <span>{tamamlananSiparis.teslimatUcreti.toFixed(2)} TL</span>
              </div>
              <div className="flex justify-between font-display text-lg pt-2 font-bold" style={{ borderTop: '1px solid #e5e7eb', color: '#111827' }}>
                <span>Genel Toplam</span>
                <span style={{ color: '#e11d48' }}>{tamamlananSiparis.genelToplam.toFixed(2)} TL</span>
              </div>
            </div>
          </div>

          <div className="pt-4 text-center text-[11px]" style={{ borderTop: '1px solid #f3f4f6', color: '#9ca3af' }}>
            Bizi tercih ettiğiniz için teşekkür ederiz.
          </div>
        </div>
        {/* ================= MAKBUZ ALANININ SONU ================= */}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfYukleniyor}
            className="flex-1 py-3 px-6 rounded-full font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: '#e11d48', color: '#ffffff' }}
          >
            {pdfYukleniyor ? 'PDF Hazırlanıyor...' : '📄 Makbuzu PDF İndir'}
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-6 rounded-full font-medium text-center transition-colors"
            style={{ backgroundColor: '#111827', color: '#ffffff' }}
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
        <span className="text-sm tracking-widest uppercase" style={{ color: '#15803d' }}>Son Adım</span>
        <h1 className="font-display text-3xl mt-2" style={{ color: '#111827' }}>Sipariş Tamamla</h1>
      </div>

      <form onSubmit={siparisiTamamla} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: '#4b5563' }}>Alıcı Ad Soyad</label>
            <input
              name="aliciAdSoyad"
              onChange={alanDegisti}
              required
              className="w-full rounded-xl px-4 py-3 focus:outline-none"
              style={{ border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#1f2937' }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#4b5563' }}>Alıcı Telefon</label>
            <input
              name="aliciTelefon"
              type="tel"
              inputMode="numeric"
              value={form.aliciTelefon}
              onChange={(e) => setForm({ ...form, aliciTelefon: e.target.value.replace(/\D/g, '') })}
              required
              maxLength={11}
              placeholder="05XXXXXXXXX"
              className="w-full rounded-xl px-4 py-3 focus:outline-none"
              style={{ border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#1f2937' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: '#4b5563' }}>Teslimat Bölgesi (İlçe)</label>
          <select
            value={secilenBolgeId}
            onChange={(e) => setSecilenBolgeId(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-3 focus:outline-none"
            style={{ border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#1f2937' }}
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
          <label className="block text-sm mb-1" style={{ color: '#4b5563' }}>Açık Teslimat Adresi</label>
          <textarea
            name="teslimatAdresi"
            onChange={alanDegisti}
            required
            rows="3"
            className="w-full rounded-xl px-4 py-3 focus:outline-none"
            style={{ border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#1f2937' }}
          />
        </div>

        <div>
          <label className="block text-sm mb-1" style={{ color: '#4b5563' }}>Not (opsiyonel)</label>
          <textarea
            name="not"
            onChange={alanDegisti}
            rows="2"
            className="w-full rounded-xl px-4 py-3 focus:outline-none"
            style={{ border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#1f2937' }}
          />
        </div>

        <div className="rounded-2xl p-5 space-y-2" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151' }}>
          <div className="flex justify-between text-sm">
            <span>Ürün Toplamı</span>
            <span>{urunToplami.toFixed(2)} TL</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Teslimat Ücreti</span>
            <span>{teslimatUcreti.toFixed(2)} TL</span>
          </div>
          <div className="flex justify-between font-display text-lg pt-2 font-bold" style={{ borderTop: '1px solid #e5e7eb', color: '#111827' }}>
            <span>Genel Toplam</span>
            <span style={{ color: '#e11d48' }}>{genelToplam.toFixed(2)} TL</span>
          </div>
        </div>

        {hata && <p className="text-sm" style={{ color: '#dc2626' }}>{hata}</p>}

        <button
          type="submit"
          disabled={gonderiliyor}
          className="w-full py-3 rounded-full transition-colors disabled:opacity-60 font-medium"
          style={{ backgroundColor: '#111827', color: '#ffffff' }}
        >
          {gonderiliyor ? 'Sipariş oluşturuluyor...' : 'Siparişi Onayla'}
        </button>
      </form>
    </div>
  );
}

export default Checkout;