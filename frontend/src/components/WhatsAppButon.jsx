// Ekranin sag-alt kösesinde sabit duran WhatsApp iletisim butonu
// Tiklaninca WhatsApp uzerinden onceden yazilmis bir mesajla sohbet baslatir

const WHATSAPP_NUMARA = '905053847727';
const ON_TANIMLI_MESAJ = 'Merhaba, FlowerShop web sitesinden yazıyorum. Çiçek siparişi hakkında bilgi almak istiyorum.';

function WhatsAppButon() {
  const link = 'https://wa.me/' + WHATSAPP_NUMARA + '?text=' + encodeURIComponent(ON_TANIMLI_MESAJ);

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp uzerinden iletisime gecin" className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#1ebe5b] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105">
      <svg viewBox="0 0 32 32" className="w-7 h-7" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.34.646 4.53 1.77 6.4L4 29l7.79-1.73A11.94 11.94 0 0 0 16.001 27C22.63 27 28 21.627 28 15S22.63 3 16.001 3zm0 21.818a9.78 9.78 0 0 1-4.99-1.37l-.358-.213-4.62 1.026 1.01-4.5-.234-.37A9.77 9.77 0 0 1 6.18 15c0-5.417 4.404-9.818 9.821-9.818S25.82 9.583 25.82 15 21.418 24.818 16.001 24.818zm5.36-7.34c-.294-.148-1.74-.858-2.01-.956-.27-.099-.467-.148-.663.148-.196.295-.76.956-.932 1.153-.172.196-.343.221-.637.074-.294-.148-1.243-.458-2.368-1.463-.875-.78-1.466-1.744-1.638-2.038-.172-.295-.018-.454.13-.601.133-.133.294-.344.442-.516.147-.172.196-.295.294-.492.098-.196.049-.369-.025-.517-.074-.148-.663-1.6-.909-2.19-.24-.575-.482-.497-.663-.506l-.564-.01c-.196 0-.516.074-.786.369-.27.295-1.03 1.006-1.03 2.454s1.055 2.847 1.201 3.043c.147.196 2.077 3.171 5.034 4.446.703.303 1.252.484 1.68.62.706.225 1.348.193 1.856.117.566-.085 1.74-.712 1.986-1.4.245-.688.245-1.277.172-1.4-.074-.123-.27-.196-.564-.344z" />
      </svg>
    </a>
  );
}

export default WhatsAppButon;
