import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-paper font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<div className="text-center py-24 font-display text-3xl text-ink">Ana Sayfa (Step 12&apos;de dolduracağız)</div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;