import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './MainLayout.css';

const MainLayout = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div id="wrapper">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />

      {/* Scroll to Top */}
      <button
        id="goTop"
        className={showTop ? 'show' : ''}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Volver arriba"
      >
        <i className="fa-solid fa-chevron-up"></i>
      </button>
    </div>
  );
};

export default MainLayout;
