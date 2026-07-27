// Sikca Sorulan Sorular bolumu - kategorilere ayrilmis, accordion (acilir-kapanir) yapida
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
    <div className="border-b border-ink/10 py-4">
      <button
        onClick={() => setAcik(!acik)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-medium text-ink">{soru}</span>
        <span className={`text-rose text-xl transition-transform ${acik ? 'rotate-45' : ''}`}>+</span>
      </button>
      {acik && <p className="text-charcoal/70 mt-3 leading-relaxed">{cevap}</p>}
    </div>
  );
}

function SSS() {
  return (
    <section className="bg-paper-dark py-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-moss text-sm tracking-widest uppercase">Merak Ettikleriniz</span>
          <h2 className="font-display text-3xl text-ink mt-2">Sıkça Sorulan Sorular</h2>
          <BotanicalDivider className="w-24 mx-auto mt-4" />
        </div>

        <div className="space-y-10">
          {sorular.map((grup) => (
            <div key={grup.kategori}>
              <h3 className="font-display text-xl text-rose mb-2">{grup.kategori}</h3>
              <div>
                {grup.liste.map((s) => (
                  <SoruSatiri key={s.soru} soru={s.soru} cevap={s.cevap} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SSS;
