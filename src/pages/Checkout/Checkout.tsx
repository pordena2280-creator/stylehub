import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  loadStripe,
  type StripeElementsOptions,
  type StripeCardElementOptions,
} from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { stripeService } from '../../services/stripeService';
import { orderService } from '../../services/orderService';
import { getProductImageUrl } from '../../utils/imageUtils';
import Seo from '../../components/seo/Seo';
import type { OrderItem } from '../../types';
import { checkoutSchema } from '../../validators';
import './Checkout.css';

// ============================================================
// STRIPE — Cargado una sola vez al nivel del módulo
// ============================================================
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

// ============================================================
// Traduce errores de Stripe al español
// ============================================================
function translateStripeError(msg: string): string {
  if (msg.includes('card was declined'))             return 'Tu tarjeta fue rechazada. Verifica los datos o usa otra tarjeta.';
  if (msg.includes('insufficient_funds'))            return 'Fondos insuficientes en tu tarjeta.';
  if (msg.includes('incorrect_cvc'))                 return 'El código de seguridad (CVC) es incorrecto.';
  if (msg.includes('expired_card'))                  return 'Tu tarjeta ha expirado.';
  if (msg.includes('incorrect_number'))              return 'El número de tarjeta es incorrecto.';
  if (msg.includes('invalid_expiry'))                return 'La fecha de expiración es inválida.';
  if (msg.includes('processing_error'))              return 'Error al procesar el pago. Intenta de nuevo en unos segundos.';
  if (msg.includes('incomplete_number'))             return 'El número de tarjeta está incompleto.';
  if (msg.includes('incomplete_expiry'))             return 'La fecha de expiración está incompleta.';
  if (msg.includes('incomplete_cvc'))                return 'El código de seguridad está incompleto.';
  if (msg.includes('No such payment_intent'))        return 'Error de sesión. Recarga la página e intenta de nuevo.';
  if (msg.includes('card_velocity_exceeded'))        return 'Límite de intentos excedido. Intenta más tarde o usa otra tarjeta.';
  if (msg.includes('do_not_honor'))                  return 'Transacción no autorizada. Contacta a tu banco.';
  if (msg.includes('authentication_required'))       return 'Tu banco requiere verificación adicional.';
  return msg;
}

// ============================================================
// Opciones de estilo para cada campo Stripe Element
// ============================================================
const ELEMENT_STYLE: StripeCardElementOptions['style'] = {
  base: {
    fontSize: '15px',
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    color: '#1a202c',
    '::placeholder': { color: '#a0aec0' },
    iconColor: '#667eea',
  },
  invalid: {
    color: '#e53e3e',
    iconColor: '#e53e3e',
  },
};

// ============================================================
// CHECKOUT FORM — usa CardNumberElement + Expiry + CVC separados
// para máxima UX y control visual
// ============================================================
const CheckoutForm = () => {
  const navigate  = useNavigate();
  const stripe    = useStripe();
  const elements  = useElements();

  const { items, subtotal, shipping, tax, discount, total, clearCart, coupon, applyCoupon, removeCoupon } = useCart();
  const { user } = useAuth();

  const [processing, setProcessing]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);
  const [stripeReady, setStripeReady]   = useState(false);
  const [couponCode, setCouponCode]     = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const [acceptTerms, setAcceptTerms]   = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.full_name?.split(' ')[0] || '',
    lastName:  user?.full_name?.split(' ').slice(1).join(' ') || '',
    email:     user?.email || '',
    phone:     user?.phone || '',
    address:   '',
    city:      '',
    state:     '',
    zipCode:   '',
    country:   'MX',
    notes:     '',
  });

  // Marcar como listo cuando el SDK de Stripe termina de cargar
  useEffect(() => {
    if (stripe && elements) setStripeReady(true);
  }, [stripe, elements]);

  const sanitizeText = (value: string) => value.replace(/[<>]/g, '').trim();

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : sanitizeText(e.target.value);
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  // Detectar cuando Stripe Elements está listo
  // useStripe() y useElements() devuelven null hasta que el SDK carga
  const stripeReadyRef = useState(() => false);
  void stripeReadyRef; // evitar warning unused
  // Actualizar stripeReady cuando stripe y elements dejen de ser null
  if (!stripeReady && stripe && elements) {
    setStripeReady(true);
  }
  // ── Aplicar cupón ────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    const ok = await applyCoupon(couponCode.trim().toUpperCase());
    setCouponMsg(ok
      ? { ok: true,  text: '✅ Cupón aplicado correctamente' }
      : { ok: false, text: '❌ Cupón inválido o expirado' }
    );
    setCouponLoading(false);
  };

  // ── Pagar ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user)            { setError('Debes iniciar sesión para continuar.'); return; }
    if (items.length === 0){ setError('Tu carrito está vacío.'); return; }
    if (!stripe || !elements){ setError('Stripe aún no está listo. Recarga la página.'); return; }

    const sanitizedForm = {
      ...formData,
      firstName: sanitizeText(formData.firstName),
      lastName: sanitizeText(formData.lastName),
      email: sanitizeText(formData.email).toLowerCase(),
      phone: sanitizeText(formData.phone),
      address: sanitizeText(formData.address),
      city: sanitizeText(formData.city),
      state: sanitizeText(formData.state),
      zipCode: sanitizeText(formData.zipCode),
      country: sanitizeText(formData.country),
      notes: sanitizeText(formData.notes),
      paymentMethod: 'card' as const,
      acceptTerms,
    };

    const validation = checkoutSchema.safeParse(sanitizedForm);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Revisa los datos del formulario.');
      return;
    }

    setFormData(prev => ({ ...prev, ...sanitizedForm }));

    setProcessing(true);
    setError(null);

    try {
      const safeForm = {
        firstName: sanitizeText(formData.firstName),
        lastName: sanitizeText(formData.lastName),
        email: sanitizeText(formData.email).toLowerCase(),
        phone: sanitizeText(formData.phone),
        address: sanitizeText(formData.address),
        city: sanitizeText(formData.city),
        state: sanitizeText(formData.state),
        zipCode: sanitizeText(formData.zipCode),
        country: sanitizeText(formData.country),
        notes: sanitizeText(formData.notes),
      };

      // 1. Crear la orden en Supabase (estado pendiente)
      const createdOrder = await orderService.createOrder({
        user_id:          user.id,
        status:           'pendiente',
        payment_method:   'tarjeta',
        payment_status:   'pendiente',
        subtotal,
        shipping_cost:    shipping,
        tax,
        discount,
        total,
        shipping_address: {
          full_name: `${safeForm.firstName} ${safeForm.lastName}`,
          phone:     safeForm.phone,
          address:   safeForm.address,
          city:      safeForm.city,
          state:     safeForm.state,
          zip_code:  safeForm.zipCode,
          country:   safeForm.country,
        } as any,
        notes:  safeForm.notes,
        items:  [] as OrderItem[],
      });

      // 2. Crear PaymentIntent en Stripe (via Edge Function)
      const { clientSecret } = await stripeService.createPaymentIntent({
        items: items.map(item => ({
          product_id: item.product.id,
          name:        item.product.name,
          description: item.product.description || '',
          image:       getProductImageUrl(item.product),
          price:       item.product.price,
          quantity:    item.quantity,
        })),
        customerEmail: safeForm.email,
        customerName:  `${safeForm.firstName} ${safeForm.lastName}`,
        address: {
          line1:       safeForm.address,
          city:        safeForm.city,
          state:       safeForm.state,
          postal_code: safeForm.zipCode,
          country:     safeForm.country,
        },
        metadata: { order_id: String(createdOrder.id), notes: safeForm.notes },
        userId:   user.id,
        orderId:  createdOrder.id,
      });

      // 3. Confirmar pago con CardNumberElement (Stripe Elements embebido)
      const cardNumber = elements.getElement(CardNumberElement);
      if (!cardNumber) { setError('Error al obtener el elemento de tarjeta.'); setProcessing(false); return; }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name:  `${safeForm.firstName} ${safeForm.lastName}`,
            email:  safeForm.email,
            phone:  safeForm.phone,
            address: {
              line1:       safeForm.address,
              city:        safeForm.city,
              state:       safeForm.state,
              postal_code: safeForm.zipCode,
              country:     safeForm.country,
            },
          },
        },
      });

      if (confirmError) {
        // 4a. Pago fallido → marcar orden como fallida
        await orderService.updateOrder(createdOrder.id, { payment_status: 'fallido' });
        setError(translateStripeError(confirmError.message || 'Error al procesar el pago.'));
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // 4b. Pago exitoso → actualizar orden + limpiar carrito
        await orderService.updateOrder(createdOrder.id, {
          payment_status: 'pagado',
          status:         'procesando',
        });
        clearCart();
        setSuccess(true);
        setTimeout(() => navigate(`/orders/${createdOrder.id}`), 3000);
      }

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Error inesperado. Intenta de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  // ── Pantalla de éxito ────────────────────────────────────
  if (success) {
    return (
      <div className="checkout-success">
        <div className="checkout-success-inner">
          <div className="success-icon-wrap"><i className="fa-solid fa-circle-check"></i></div>
          <h2>¡Pago exitoso!</h2>
          <p>Gracias por tu compra. Recibirás un email de confirmación en breve.</p>
          <p className="success-redirect">Redirigiendo a tu pedido…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Seo title="Checkout Seguro" robots="noindex" />

      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Inicio</Link><span>/</span>
          <Link to="/cart">Carrito</Link><span>/</span>
          <span>Checkout</span>
        </div>

        <h1 className="checkout-title">
          <i className="fa-solid fa-lock"></i> Checkout Seguro
        </h1>

        {/* Banda de seguridad */}
        <div className="checkout-security-bar">
          <span><i className="fa-solid fa-shield-halved"></i> Pago 100% seguro</span>
          <span><i className="fa-brands fa-stripe"></i> Procesado por Stripe</span>
          <span><i className="fa-solid fa-lock"></i> Cifrado SSL 256-bit</span>
          <span><i className="fa-solid fa-eye-slash"></i> No almacenamos datos de tarjeta</span>
        </div>

        {error && (
          <div className="checkout-error-banner">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
            <button onClick={() => setError(null)} aria-label="Cerrar error">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="checkout-layout" noValidate>

          {/* ── Columna izquierda: Datos ── */}
          <div className="checkout-left">

            {/* Sección datos de envío */}
            <div className="checkout-section">
              <h2 className="checkout-section-title">
                <span className="checkout-step-num">1</span> Datos de Envío
              </h2>
              <div className="checkout-form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">Nombre *</label>
                  <input id="firstName" name="firstName" type="text"
                    value={formData.firstName} onChange={onChange}
                    autoComplete="given-name" required maxLength={60} />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Apellido *</label>
                  <input id="lastName" name="lastName" type="text"
                    value={formData.lastName} onChange={onChange}
                    autoComplete="family-name" required maxLength={60} />
                </div>
                <div className="form-group full">
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email"
                    value={formData.email} onChange={onChange}
                    autoComplete="email" required maxLength={120} />
                </div>
                <div className="form-group full">
                  <label htmlFor="phone">Teléfono</label>
                  <input id="phone" name="phone" type="tel"
                    value={formData.phone} onChange={onChange}
                    autoComplete="tel" maxLength={20} />
                </div>
                <div className="form-group full">
                  <label htmlFor="address">Dirección *</label>
                  <input id="address" name="address" type="text"
                    value={formData.address} onChange={onChange}
                    autoComplete="street-address" required maxLength={160} />
                </div>
                <div className="form-group">
                  <label htmlFor="city">Ciudad *</label>
                  <input id="city" name="city" type="text"
                    value={formData.city} onChange={onChange}
                    autoComplete="address-level2" required maxLength={80} />
                </div>
                <div className="form-group">
                  <label htmlFor="state">Estado *</label>
                  <input id="state" name="state" type="text"
                    value={formData.state} onChange={onChange}
                    autoComplete="address-level1" required maxLength={80} />
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">C.P. *</label>
                  <input id="zipCode" name="zipCode" type="text"
                    value={formData.zipCode} onChange={onChange}
                    autoComplete="postal-code" required maxLength={12} />
                </div>
                <div className="form-group">
                  <label htmlFor="country">País *</label>
                  <select id="country" name="country" value={formData.country} onChange={onChange}>
                    <option value="MX">México</option>
                    <option value="US">Estados Unidos</option>
                    <option value="CA">Canadá</option>
                    <option value="AR">Argentina</option>
                    <option value="CO">Colombia</option>
                    <option value="ES">España</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label htmlFor="notes">Notas del pedido (opcional)</label>
                  <textarea id="notes" name="notes" rows={2}
                    value={formData.notes} onChange={onChange}
                    placeholder="Instrucciones especiales de entrega…" maxLength={300} />
                </div>
              </div>
            </div>

            {/* Sección pago con Stripe Elements */}
            <div className="checkout-section">
              <h2 className="checkout-section-title">
                <span className="checkout-step-num">2</span> Datos de Pago
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                  alt="Stripe" className="stripe-logo-inline" />
              </h2>

              <p className="stripe-security-note">
                <i className="fa-solid fa-lock"></i>
                Los datos de tu tarjeta son procesados directamente por Stripe. Nunca los almacenamos.
              </p>

              <div className="stripe-elements-wrapper">

                <div className="form-group full">
                  <label>Número de Tarjeta *</label>
                  <div className="stripe-element-field">
                    <CardNumberElement options={{ style: ELEMENT_STYLE, showIcon: true }} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Fecha de Expiración *</label>
                  <div className="stripe-element-field">
                    <CardExpiryElement options={{ style: ELEMENT_STYLE }} />
                  </div>
                </div>

                <div className="form-group">
                  <label>CVC *</label>
                  <div className="stripe-element-field">
                    <CardCvcElement options={{ style: ELEMENT_STYLE }} />
                  </div>
                </div>

              </div>

              {/* Logos de tarjetas aceptadas */}
              <label className="checkout-terms-row">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  required
                />
                <span>Acepto los términos, la política de privacidad y que la transacción se procesa de forma segura por Stripe.</span>
              </label>

              <div className="accepted-cards">
                <span>Aceptamos:</span>
                <i className="fa-brands fa-cc-visa" title="Visa"></i>
                <i className="fa-brands fa-cc-mastercard" title="Mastercard"></i>
                <i className="fa-brands fa-cc-amex" title="Amex"></i>
                <i className="fa-brands fa-cc-discover" title="Discover"></i>
              </div>
            </div>
          </div>

          {/* ── Columna derecha: Resumen ── */}
          <div className="checkout-right">
            <div className="checkout-summary-card">
              <h3>Resumen del Pedido</h3>

              {/* Items del carrito */}
              <div className="checkout-items-list">
                {items.map(item => (
                  <div key={item.product_id} className="checkout-item-row">
                    <img
                      src={getProductImageUrl(item.product)}
                      alt={item.product.name}
                      onError={e => (e.currentTarget.src = '/images/products/placeholder.jpg')}
                    />
                    <div className="checkout-item-info">
                      <span className="checkout-item-name">{item.product.name}</span>
                      <span className="checkout-item-qty">×{item.quantity}</span>
                    </div>
                    <span className="checkout-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cupón */}
              <div className="checkout-coupon">
                {coupon ? (
                  <div className="coupon-applied">
                    <i className="fa-solid fa-tag"></i>
                    <span>{coupon.code} — {coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`} desc.</span>
                    <button type="button" onClick={() => { removeCoupon(); setCouponMsg(null); }}>✕</button>
                  </div>
                ) : (
                  <div className="coupon-input-row">
                    <input
                      type="text"
                      placeholder="Código de descuento"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                    />
                    <button type="button" onClick={handleApplyCoupon} disabled={couponLoading}>
                      {couponLoading ? '…' : 'Aplicar'}
                    </button>
                  </div>
                )}
                {couponMsg && (
                  <p className={`coupon-msg ${couponMsg.ok ? 'ok' : 'error'}`}>{couponMsg.text}</p>
                )}
              </div>

              {/* Totales */}
              <div className="checkout-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Envío</span>
                  <span>{shipping === 0 ? <span className="free-tag">Gratis</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                {tax > 0 && (
                  <div className="total-row">
                    <span>IVA (16%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="total-row discount-row">
                    <span>Descuento</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-row grand-total">
                  <span>Total</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>
              </div>

              {/* Botón de pago */}
              <button
                type="submit"
                className="btn-pay"
                disabled={processing || items.length === 0 || !stripeReady}
              >
                {processing ? (
                  <><span className="btn-spinner"></span> Procesando pago…</>
                ) : !stripeReady ? (
                  <><span className="btn-spinner"></span> Cargando Stripe…</>
                ) : (
                  <><i className="fa-solid fa-lock"></i> Pagar ${total.toFixed(2)} de forma segura</>
                )}
              </button>

              <p className="checkout-guarantee">
                <i className="fa-solid fa-shield-halved"></i>
                Garantía de devolución de 30 días. Pago 100% seguro.
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

// ============================================================
// WRAPPER con Elements Provider
// ============================================================
const Checkout = () => {
  const options: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary:       '#ff3d3d',
        colorBackground:    '#ffffff',
        colorText:          '#1a202c',
        colorDanger:        '#e53e3e',
        fontFamily:         '"Segoe UI", system-ui, sans-serif',
        borderRadius:       '8px',
        spacingUnit:        '4px',
      },
      rules: {
        '.Input': {
          border:    '1.5px solid #e2e8f0',
          boxShadow: 'none',
          padding:   '10px 12px',
        },
        '.Input:focus': {
          border:    '1.5px solid #ff3d3d',
          boxShadow: '0 0 0 3px rgba(255,61,61,0.12)',
        },
        '.Label': { fontWeight: '600', fontSize: '13px' },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
