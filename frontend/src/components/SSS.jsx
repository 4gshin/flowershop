// Sikca Sorulan Sorular bolumu - minimalist, tipografi agirlikli tasarim
// Kategoriler ince alt cizgili sekmeler olarak, sorular sade accordion yapida
import { useState } from 'react';
import BotanicalDivider from './BotanicalDivider';

const sorular = [
  {
    kategori: 'Ürünler Hakkında',
    liste: [
      {
        soru: 'Çiçekler ne kadar taze?',
        cevap: 'Tüm çiçeklerimiz sipariş günü sabahı tedarikçilerimizden temin edilir ve aynı gün hazırlanıp gönderilir. Vazoda veya suyla temas eden aranjmanlarımız uygun bakımla 5-7 gün tazeliğini korur.'
      },
      {
        soru: 'Ürün fotoğraftaki ile birebir aynı mı olur?',
        cevap: 'Çiçekler doğal ürünler olduğu için mevsime ve tedarik durumuna göre renk tonlarında hafif farklılıklar olabilir. Kompozisyon ve genel görünüm fotoğraftakiyle aynı kalitede hazırlanır.'
      },
      {
        soru: 'Bir ürün stokta yoksa ne olur?',
        cevap: 'Stokta olmayan ürünler sitede "Tükendi" etiketiyle işaretlenir ve sipariş verilemez. Ürün tekrar stoka girdiğinde otomatik olarak satışa açılır.'
      }
    ]
  },
  {
    kategori: 'Teslimat Hakkında',
    liste: [
      {
        soru: 'Teslimat ücreti nasıl hesaplanır?',
        cevap: 'Sipariş sırasında teslimat yapılacak ilçeyi seçmeniz yeterlidir; o bölgeye özel teslimat ücreti otomatik olarak sepetinize yansıtılır.'
      },
      {
        soru: 'Aynı gün teslimat mümkün mü?',
        cevap: 'Saat 15:00\'a kadar verilen siparişler, seçilen bölgeye bağlı olarak aynı gün içinde teslim edilmeye çalışılır. Bu saatten sonraki siparişler bir sonraki gün teslim edilir.'
      },
      {
        soru: 'Siparişimin durumunu nereden takip edebilirim?',
        cevap: 'Giriş yaptıktan sonra "Hesabım" sayfasından tüm siparişlerinizin güncel durumunu (Alındı, Hazırlanıyor, Yolda, Teslim Edildi) görebilirsiniz.'
      }
    ]
  },
  {
    kategori: 'Firma Hakkında',
    liste: [
      {
        soru: 'Hangi bölgelere teslimat yapıyorsunuz?',
        cevap: 'Şu an için Ankara genelinde, sipariş sayfasında listelenen ilçelere teslimat yapmaktayız. Yeni bölgeler zamanla eklenmektedir.'
      },
      {
        soru: 'Toplu veya kurumsal sipariş verebilir miyim?',
        cevap: 'Evet, kurumsal ve toplu siparişleriniz için WhatsApp üzerinden bizimle iletişime geçebilirsiniz; size özel fiyatlandırma sunulur.'
      },
      {
        soru: 'İade veya değişim yapabilir miyim?',
        cevap: 'Çiçekler doğası gereği bozulabilir ürünler olduğundan, teslimat sonrası iade kabul edilmemektedir. Ancak üründe bir hata veya hasar varsa, teslimat gününde bize ulaşmanız durumunda sorununuzu çözüyoruz.'
      }
    ]
  }
];

function SoruSatiri({ soru, cevap }) {
  const [acik, setAcik] = useState(false);

  return (
    <div className="border-b border-ink/8 py-5 first:pt-0">
      <button
        onClick={() => setAcik(!acik)}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span className="text-ink">{soru}</span>
        <svg
          className={`w-4 h-4 text-moss shrink-0 transition-transform duration-300 ${acik ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {acik && (
        <p className="text-charcoal/60 mt-3 leading-relaxed text-sm max-w-xl">
          {cevap}
        </p>
      )}
    </div>
  );
}

function SSS() {
  const [aktifIndex, setAktifIndex] = useState(0);

  return (
    <section className="bg-paper py-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-moss text-xs tracking-widest uppercase">Merak Ettikleriniz</span>
          <h2 className="font-display text-3xl text-ink mt-3">Sıkça Sorulan Sorular</h2>
          <BotanicalDivider className="w-20 mx-auto mt-5 opacity-70" />
        </div>

        {/* Kategori sekmeleri - ince alt cizgili, minimal */}
        <div className="flex justify-center gap-8 mb-10 border-b border-ink/8">
          {sorular.map((grup, index) => (
            <button
              key={grup.kategori}
              onClick={() => setAktifIndex(index)}
              className={`relative pb-4 text-sm transition-colors ${
                aktifIndex === index ? 'text-ink' : 'text-charcoal/40 hover:text-charcoal/70'
              }`}
            >
              {grup.kategori}
              {aktifIndex === index && (
                <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-rose rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Secilen kategorinin sorulari */}
        <div>
          {sorular[aktifIndex].liste.map((s) => (
            <SoruSatiri key={s.soru} soru={s.soru} cevap={s.cevap} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SSS;
