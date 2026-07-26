import BotanicalDivider from './BotanicalDivider';

function Footer() {
  return (
    <footer className="bg-ink text-paper mt-24 py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center gap-4">
        <span className="font-display text-2xl">FlowerShop</span>
        <BotanicalDivider className="w-32 opacity-70" />
        <p className="text-paper/60 text-sm max-w-md">
          Sevdikleriniz için taze çiçekler, özenle hazırlanır ve kapınıza kadar teslim edilir.
        </p>
        <p className="text-paper/40 text-xs mt-4">
          &copy; {new Date().getFullYear()} FlowerShop. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}

export default Footer;