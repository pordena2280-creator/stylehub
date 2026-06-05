import { useState } from 'react';
import { Link } from 'react-router-dom';
import './TrackOrder.css';

interface TimelineStep {
  label: string;
  date: string;
  done: boolean;
  active: boolean;
}

interface OrderResult {
  id: string;
  date: string;
  status: string;
  total: string;
  estimatedDelivery: string;
  timeline: TimelineStep[];
}

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setOrderResult({
        id: orderNumber || 'TF-2025-00847',
        date: '19 May, 2025',
        status: 'In Transit',
        total: '$189.00',
        estimatedDelivery: '23 May, 2025',
        timeline: [
          { label: 'Order Placed', date: '19 May, 2025 - 09:00', done: true, active: false },
          { label: 'Payment Confirmed', date: '19 May, 2025 - 09:05', done: true, active: false },
          { label: 'Packing', date: '19 May, 2025 - 14:30', done: true, active: false },
          { label: 'Shipped', date: '20 May, 2025 - 08:00', done: true, active: false },
          { label: 'In Transit', date: '20 May, 2025 - 14:00', done: true, active: true },
          { label: 'Delivered', date: 'Est. 23 May, 2025', done: false, active: false },
        ],
      });
      setLoading(false);
      setShowResult(true);
    }, 1500);
  };

  return (
    <div className="tf-trackorder-page">
      {/* Breadcrumb */}
      <section className="tf-trackorder-section tf-trackorder-breadcrumb">
        <div className="container">
          <ul className="tf-trackorder-breakcrumbs">
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li className="tf-trackorder-breakcrumb-divider">
              <i className="icon icon-arrow-right" />
            </li>
            <li>
              <p className="body-small">Track Your Order</p>
            </li>
          </ul>
        </div>
      </section>

      {/* Hero / Header */}
      <section className="tf-trackorder-section tf-trackorder-hero">
        <div className="container">
          <h1 className="tf-trackorder-hero-title">Track Your Order</h1>
        </div>
      </section>

      {/* Tracking Form */}
      <section className="tf-trackorder-section tf-trackorder-form-section">
        <div className="container">
          <div className="tf-trackorder-form-card">
            <div className="tf-trackorder-form-header">
              <h5 className="fw-semibold">Track your order</h5>
              <p className="body-text-3">
                To track your order, please enter your order ID in the box below and press the
                "Track" button. The ID has been sent to you on your receipt and in the confirmation
                email you received.
              </p>
            </div>
            <form className="tf-trackorder-form-form" onSubmit={handleTrack}>
              <div className="tf-trackorder-form-row">
                <div className="form-group">
                  <label htmlFor="order-number">Order ID</label>
                  <input
                    id="order-number"
                    className="form-control"
                    type="text"
                    placeholder="Found in your order confirmation email"
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="order-email">Order email</label>
                  <input
                    id="order-email"
                    className="form-control"
                    type="email"
                    placeholder="Email you used during checkout"
                    value={orderEmail}
                    onChange={e => setOrderEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="tf-trackorder-form-btn-wrap">
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? (
                      <span className="tf-trackorder-spinner" />
                    ) : (
                      <span className="text-white">Track</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Tracking Result / Timeline */}
      {showResult && orderResult && (
        <section className="tf-trackorder-section tf-trackorder-result-section">
          <div className="container">
            <div className="tf-trackorder-result-card">
              <div className="tf-trackorder-result-header">
                <div>
                  <h5 className="fw-semibold">Order #{orderResult.id}</h5>
                  <span className="body-small">Placed on {orderResult.date}</span>
                </div>
                <div className="tf-trackorder-result-meta">
                  <span className="body-small">Status:</span>{' '}
                  <span className="tf-trackorder-status-badge">{orderResult.status}</span>
                </div>
              </div>

              <div className="tf-trackorder-timeline">
                {orderResult.timeline.map((step, i) => (
                  <div key={i} className={`tf-trackorder-timeline-item ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
                    <div className="tf-trackorder-timeline-point">
                      {step.done ? (
                        <i className="icon-check" />
                      ) : (
                        <span className="tf-trackorder-timeline-dot" />
                      )}
                    </div>
                    <div className="tf-trackorder-timeline-content">
                      <span className="fw-semibold">{step.label}</span>
                      <span className="body-small">{step.date}</span>
                    </div>
                  </div>
                ))}
                <div className="tf-trackorder-timeline-line" />
              </div>

              <p className="tf-trackorder-result-desc">
                Your order is estimated to be delivered on <strong>{orderResult.estimatedDelivery}</strong>.
                You will receive a notification once it is delivered.
              </p>
            </div>

            <div className="tf-trackorder-detail-card">
              <div className="tf-trackorder-detail-row">
                <div>
                  <h6 className="fw-semibold">Order #{orderResult.id}</h6>
                  <span className="body-small body-text-3">{orderResult.date}</span>
                </div>
                <span className="tf-trackorder-total">{orderResult.total}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Orders */}
      <section className="tf-trackorder-section tf-trackorder-recent-section">
        <div className="container">
          <div className="tf-trackorder-recent-header">
            <h5 className="fw-semibold">Recently Viewed</h5>
            <div className="tf-trackorder-recent-nav">
              <button className="tf-trackorder-nav-btn" aria-label="Previous">
                <i className="icon-arrow-left-lg" />
              </button>
              <button className="tf-trackorder-nav-btn" aria-label="Next">
                <i className="icon-arrow-right-lg" />
              </button>
            </div>
          </div>
          <div className="tf-trackorder-recent-grid">
            {/* Item 1 */}
            <div className="tf-trackorder-recent-card">
              <div className="tf-trackorder-card-img">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"
                  alt="Urbanears Pampas"
                  loading="lazy"
                />
              </div>
              <div className="tf-trackorder-card-info">
                <span className="text-main-2 font-2">Headphone</span>
                <a href="#" className="tf-trackorder-card-name body-md-2 fw-semibold text-secondary link">
                  Urbanears Pampas – Wireless Over-Ear Headphones with Immersive Sound
                </a>
                <p className="fk-semibold">$48.990</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="tf-trackorder-recent-card">
              <div className="tf-trackorder-card-img">
                <img
                  src="https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=300&h=300&fit=crop"
                  alt="Upgrader Headphones"
                  loading="lazy"
                />
              </div>
              <div className="tf-trackorder-card-info">
                <span className="text-main-2 font-2">Headphone</span>
                <a href="#" className="tf-trackorder-card-name body-md-2 fw-semibold text-secondary link">
                  Upgrader Headphones – Altec Lansing by ECCO Design, Premium Sound &amp; Comfort
                </a>
                <p className="fk-semibold">$27.500</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="tf-trackorder-recent-card">
              <div className="tf-trackorder-card-img">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop"
                  alt="Smartwatch"
                  loading="lazy"
                />
              </div>
              <div className="tf-trackorder-card-info">
                <span className="text-main-2 font-2">Smartwatch</span>
                <a href="#" className="tf-trackorder-card-name body-md-2 fw-semibold text-secondary link">
                  Apple Watch Series 6 (GPS) – 40mm Aluminum Case with Sport Band
                </a>
                <p className="fk-semibold">$63.999</p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="tf-trackorder-recent-card">
              <div className="tf-trackorder-card-img">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop"
                  alt="Laptop"
                  loading="lazy"
                />
              </div>
              <div className="tf-trackorder-card-info">
                <span className="text-main-2 font-2">Laptop &amp; Computer</span>
                <a href="#" className="tf-trackorder-card-name body-md-2 fw-semibold text-secondary link">
                  Lenovo Yoga 910-13IKB – 2-in-1 Ultrabook with Touchscreen &amp; 360° Hinge
                </a>
                <p className="fk-semibold">$39.990</p>
              </div>
            </div>

            {/* Item 5 */}
            <div className="tf-trackorder-recent-card">
              <div className="tf-trackorder-card-img">
                <img
                  src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=300&fit=crop"
                  alt="Lens Camera"
                  loading="lazy"
                />
              </div>
              <div className="tf-trackorder-card-info">
                <span className="text-main-2 font-2">Camera &amp; Video</span>
                <a href="#" className="tf-trackorder-card-name body-md-2 fw-semibold text-secondary link">
                  Canon EOS R50 Mirrorless Camera – 24.2 MP with RF-S 18-45mm Lens Kit
                </a>
                <p className="fk-semibold">$899.99</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrackOrder;
