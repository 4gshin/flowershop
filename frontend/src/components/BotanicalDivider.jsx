// FlowerShop'un imza gorsel elementi - bolumler arasinda kullanilan
// el cizimi tarzinda botanik ayirici. Sitenin genelinde tekrarlanarak
// markaya ozgu bir kimlik olusturur.
function BotanicalDivider({ className = '' }) {
  return (
    <svg
      viewBox="0 0 240 40"
      className={`w-40 h-auto ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 20 C 60 5, 90 5, 120 20 C 150 35, 180 35, 230 20"
        stroke="#B8934B"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="120" cy="20" r="3" fill="#B8737A" />
      <path
        d="M120 20 C 110 12, 105 8, 108 3 C 112 8, 115 14, 120 20"
        fill="#6B7F5B"
      />
      <path
        d="M120 20 C 130 12, 135 8, 132 3 C 128 8, 125 14, 120 20"
        fill="#8A9C7A"
      />
    </svg>
  );
}

export default BotanicalDivider;