import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;

// const stripeBackendUrl = import.meta.env.VITE_STRIPE_BACKEND_URL as string;

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    if (!stripePublishableKey) {
      console.error('❌ Falta VITE_STRIPE_PUBLISHABLE_KEY en .env.local');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export interface CheckoutItem {
  id?: string | number;
  product_id?: number;
  name: string;
  description?: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface CheckoutSessionData {
  items: CheckoutItem[];
  customerEmail?: string;
  customerName?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  metadata?: Record<string, string>;
  userId?: string;
  orderId?: number;
}

export interface PaymentIntent {
  clientSecret: string;
  orderId: number;
  amount: number;
  currency: string;
}

export const stripeService = {
  getStripe(): Promise<Stripe | null> {
    return getStripe();
  },

   async createPaymentIntent(data: CheckoutSessionData): Promise<PaymentIntent> {
     const payload = {
       items: data.items,
       customer_email: data.customerEmail,
       customer_name: data.customerName,
       address: data.address,
       metadata: { ...data.metadata, order_id: data.orderId?.toString() },
       user_id: data.userId,
     };

     // Siempre usar Supabase Functions
     const { data: result, error } = await supabase.functions.invoke('create-payment-intent', {
       body: payload,
     });
     if (error) throw new Error(error.message);
     return result;
   },
};