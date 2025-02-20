import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import './SubscriptionModal.scss';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentForm: React.FC<SubscriptionModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  React.useEffect(() => {
    // Create a payment intent when the modal opens
    fetch(`${import.meta.env.VITE_API_URL}/subscriptions/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => setError('Failed to initialize payment. Please try again.'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription-success`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message || 'Payment failed');
    } else {
      onSuccess();
    }
    setProcessing(false);
  };

  return (
    <div className="subscription-modal">
      <div className="subscription-modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>{t('subscription.title')}</h2>

        <div className="subscription-pricing">
          <div className="subscription-price">
            <span className="amount">$19.99</span>
            <span className="period">/month</span>
          </div>
        </div>

        <div className="subscription-features">
          <h3>{t('subscription.features_title')}</h3>
          <ul>
            <li>{t('subscription.feature_1')}</li>
            <li>{t('subscription.feature_2')}</li>
            <li>{t('subscription.feature_3')}</li>
          </ul>
        </div>

        {clientSecret ? (
          <form onSubmit={handleSubmit}>
            <PaymentElement
              options={{
                layout: 'tabs',
                defaultValues: {
                  billingDetails: {
                    name: '',
                    email: '',
                  }
                }
              }}
            />
            {error && <div className="error-message">{error}</div>}
            <button
              type="submit"
              disabled={!stripe || processing}
              className="subscribe-button"
            >
              {processing ? t('subscription.processing') : t('subscription.subscribe')}
            </button>
          </form>
        ) : (
          <div className="loading-payment">
            <div className="loading-ring">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = (props) => {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#dd8500',
            colorBackground: '#292929',
            colorText: '#ffffff',
          },
        },
      }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
};

export default SubscriptionModal;