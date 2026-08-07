// Ekranin sag ust kosesinde gecici bildirimler gostermek icin context
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let idSayaci = 0;

export function ToastProvider({ children }) {
  const [toastlar, setToastlar] = useState([]);

  const toastGoster = useCallback((metin, tip = 'basari') => {
    const id = ++idSayaci;
    setToastlar((prev) => [...prev, { id, metin, tip }]);
    setTimeout(() => {
      setToastlar((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const tipClass = {
    basari: 'bg-moss text-paper',
    hata: 'bg-rose-dark text-paper',
    bilgi: 'bg-ink text-paper'
  };

  return (
    <ToastContext.Provider value={{ toastGoster }}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toastlar.map((t) => (
          <div
            key={t.id}
            className={`${tipClass[t.tip]} px-5 py-3 rounded-2xl shadow-lg text-sm font-medium min-w-[200px] max-w-sm animate-toast-in`}
          >
            {t.metin}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
rm -rf node_modules/.vite
npm run dev