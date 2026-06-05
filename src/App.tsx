import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ToastProvider } from './components/common/Toast/ToastContainer';

// Layout
import MainLayout from './components/layout/MainLayout/MainLayout';
import AdminLayout from './pages/admin/AdminLayout/AdminLayout';

// Public Pages (immediate loading for critical pages)
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import Categories from './pages/Categories/Categories';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import FAQ from './pages/FAQ/FAQ';
import Blog from './pages/Blog/Blog';
import BlogDetail from './pages/BlogDetail/BlogDetail';
import Terms from './pages/Terms/Terms';
import Cart from './pages/Cart/Cart';
import Wishlist from './pages/Wishlist/Wishlist';
import Compare from './pages/Compare/Compare';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminLogin from './pages/admin/AdminLogin/AdminLogin';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import AuthCallback from './pages/Auth/AuthCallback';
import CompleteProfile from './pages/Auth/CompleteProfile';
import ProtectedRoute from './components/auth/ProtectedRoute';

// User Pages
import Checkout from './pages/Checkout/Checkout';
import TrackOrder from './pages/TrackOrder/TrackOrder';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import OrderDetail from './pages/OrderDetail/OrderDetail';

// Admin Pages - lazy loaded for performance
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/Categories/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/Orders/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/Users/AdminUsers'));
const AdminBlog = lazy(() => import('./pages/admin/Blog/AdminBlog'));
const AdminBanners = lazy(() => import('./pages/admin/Banners/AdminBanners'));
const AdminRoles = lazy(() => import('./pages/admin/Roles/AdminRoles'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons/AdminCoupons'));
const AdminReports = lazy(() => import('./pages/admin/Reports/AdminReports'));
const AdminSettings = lazy(() => import('./pages/admin/Settings/AdminSettings'));
const AdminLoyalty = lazy(() => import('./pages/admin/Loyalty/AdminLoyalty'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications/AdminNotifications'));
const AdminAffiliates = lazy(() => import('./pages/admin/Affiliates/AdminAffiliates'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews/AdminReviews'));
const AdminCMS = lazy(() => import('./pages/admin/CMS/AdminCMS'));

// 404
import NotFound from './pages/NotFound/NotFound';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      {/* AuthProvider envuelve todo — CartProvider y WishlistProvider dependen de useAuth */}
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>

                {/* ===== PUBLIC ROUTES ===== */}

                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="products" element={<Products />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/:id" element={<BlogDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="compare" element={<Compare />} />
                  <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="track-order" element={<TrackOrder />} />
                  <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                </Route>

               {/* ===== AUTH ROUTES (sin layout principal) ===== */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/completar-perfil" element={<CompleteProfile />} />

               {/* ===== ADMIN ROUTES ===== */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="products" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminProducts />
                    </Suspense>
                  } />
                  <Route path="categories" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminCategories />
                    </Suspense>
                  } />
                  <Route path="orders" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminOrders />
                    </Suspense>
                  } />
                  <Route path="users" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminUsers />
                    </Suspense>
                  } />
                  <Route path="roles" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminRoles />
                    </Suspense>
                  } />
                  <Route path="coupons" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminCoupons />
                    </Suspense>
                  } />
                  <Route path="reports" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminReports />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminSettings />
                    </Suspense>
                  } />
                  <Route path="loyalty" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminLoyalty />
                    </Suspense>
                  } />
                  <Route path="notifications" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminNotifications />
                    </Suspense>
                  } />
                  <Route path="affiliates" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminAffiliates />
                    </Suspense>
                  } />
                  <Route path="reviews" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminReviews />
                    </Suspense>
                  } />
                  <Route path="blog" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminBlog />
                    </Suspense>
                  } />
                  <Route path="banners" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminBanners />
                    </Suspense>
                  } />
                  <Route path="cms" element={
                    <Suspense fallback={<div className="admin-loading">Cargando…</div>}>
                      <AdminCMS />
                    </Suspense>
                  } />
                </Route>

               {/* ===== 404 ===== */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
      </BrowserRouter>
    );
}

export default App;