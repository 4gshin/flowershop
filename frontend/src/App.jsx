import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButon from './components/WhatsAppButon';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Account from './pages/Account';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-paper font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/urunler" element={<ProductList />} />
          <Route path="/urunler/:id" element={<ProductDetail />} />
          <Route path="/sepet" element={<Cart />} />
          <Route path="/giris" element={<Login />} />
          <Route path="/kayit" element={<Register />} />
          <Route path="/odeme" element={<Checkout />} />
          <Route path="/hesabim" element={<Account />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButon />
    </div>
  );
}

export default App;
