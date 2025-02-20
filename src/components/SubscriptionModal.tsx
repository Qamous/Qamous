import React, { useState } from 'react';
    import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
    import './SubscriptionModal.scss';
    import { useTranslation } from 'react-i18next';
    
    interface SubscriptionModalProps {
      onClose: () => void;
      onSuccess: () => void;
    }
    
    const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSuccess }) => {
      const { t } = useTranslation();
      const stripe = useStripe();
      const elements = useElements();
      const [error, setError] = useState<string | null>(null);
      const [processing, setProcessing] = useState(false);
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
    
        setProcessing(true);
        setError(null);
    
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/subscribe`);
          const { clientSecret, subscriptionId } = await response.json();
    
          const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: elements.getElement(CardElement)!,
            },
          });
    
          if (result.error) {
            setError(result.error.message || 'Payment failed');
          } else {
            onSuccess();
          }
        } catch (err) {
          setError('Subscription failed. Please try again.');
        } finally {
          setProcessing(false);
        }
      };
    
      return (
        <div className="subscription-modal">
          <div className="subscription-modal-content">
            <button className="close-button" onClick={onClose}>&times;</button>
            <h2>{t('subscription.title')}</h2>
    
            <div className="subscription-features">
              <h3>{t('subscription.features_title')}</h3>
              <ul>
                <li>{t('subscription.feature_1')}</li>
                <li>{t('subscription.feature_2')}</li>
                <li>{t('subscription.feature_3')}</li>
              </ul>
            </div>
    
            <form onSubmit={handleSubmit}>
              <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
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
          </div>
        </div>
      );
    };
    
    export default SubscriptionModal;