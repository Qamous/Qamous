import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'react-query';
import './Chatbot.scss';
import ReactMarkdown from 'react-markdown';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import SubscriptionModal from '../src/components/SubscriptionModal';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const modelTiers = {
  free: ['groq', 'gemini'],
  premium: ['groq-3', 'gemini-pro', 'gpt4', 'mistral']
} as const;

type ModelTier = keyof typeof modelTiers;
type Model = (typeof modelTiers)[ModelTier][number];

interface RagRequest {
  query: string;
  model: Model;
  preferredLanguage?: 'arabic' | 'franco-arabic';
}

interface RagResponse {
  response: string;
  sources: string[];
  definitions?: {
    word: string;
    meaning: string;
    example?: string;
  }[];
}

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  sources?: string[];
  definitions?: RagResponse['definitions'];
  isNew?: boolean;
}


const Chatbot: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<RagRequest['model']>('groq');
  const [preferredLanguage, setPreferredLanguage] = useState<RagRequest['preferredLanguage']>('arabic');
  const [directionClass, setDirectionClass] = useState<'rtl' | 'ltr'>('rtl'); // Add this state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'premium'>('free');
  
  // Query subscription status
  const { data: subStatus } = useQuery('subscriptionStatus', async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/status`);
    const data = await response.json();
    setSubscriptionStatus(data.isSubscribed ? 'premium' : 'free');
    return data;
  });
  
  const ragMutation = useMutation<RagResponse, Error, RagRequest>(
    async (request) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      return response.json();
    }
  );
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    setDirectionClass(preferredLanguage === 'arabic' ? 'rtl' : 'ltr');
  }, [preferredLanguage]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || ragMutation.isLoading) return;
    
    const isPremiumModel = modelTiers.premium.includes(selectedModel as any);
    if (isPremiumModel && subscriptionStatus === 'free') {
      setShowSubscriptionModal(true);
      return;
    }
    
    const userMessage: ChatMessage = {
      type: 'user',
      content: input,
      isNew: true,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      const result = await ragMutation.mutateAsync({
        query: input,
        model: selectedModel,
        preferredLanguage: preferredLanguage,
      });
      
      setIsTyping(false);
      
      const assistantMessage: ChatMessage = {
        type: 'assistant',
        content: result.response,
        sources: result.sources,
        definitions: result.definitions,
        isNew: true,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setIsTyping(false);
      // Handle error
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: t('chatbot.error_message'),
        },
      ]);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      // If Shift, Control, or Alt is pressed with Enter, allow default behavior (new line)
      if (e.shiftKey || e.ctrlKey || e.altKey) {
        return;
      }
      // Otherwise prevent default behavior and submit the form
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <div className={`chatbot-container ${directionClass}`}>
      <div className="chatbot-interface">
        <div className="chatbot-header">
          <h2>{t('chatbot.title')}</h2>
          <div className="chatbot-header-controls">
            <div className="chatbot-header-subscription">
              <button
                className={`subscription-status ${subscriptionStatus}`}
                onClick={() => setShowSubscriptionModal(true)}
              >
                {subscriptionStatus === 'premium' ? '⭐ Premium' : 'Upgrade to Premium'}
              </button>
            </div>
            <div className="chatbot-header-selector">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as Model)}
              >
                <optgroup label="Free Models">
                  {modelTiers.free.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </optgroup>
                <optgroup label="Premium Models">
                  {modelTiers.premium.map(model => (
                    <option key={model} value={model}>
                      {model} {subscriptionStatus === 'free' ? '⭐' : ''}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="chatbot-header-selector">
              <select
                value={preferredLanguage}
                onChange={(e) => {
                  const newLang = e.target.value as RagRequest['preferredLanguage'];
                  setPreferredLanguage(newLang);
                }}
              >
                <option value="arabic">{t('chatbot.arabic')}</option>
                <option value="franco-arabic">{t('chatbot.franco_arabic')}</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className={`chatbot-messages chatbot-messages--${directionClass}`}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chatbot-message chatbot-message--${message.type}`}
            >
              {preferredLanguage === 'arabic' && (
                <div className="chatbot-message-arabic">
                  {message.content}
                </div>
              )}
              {preferredLanguage !== 'arabic' && (
                <ReactMarkdown>{message.content}</ReactMarkdown>
              )}
              
              {message.sources && message.sources.length > 0 && (
                <div className="chatbot-message-sources">
                  {message.sources.map((source, idx) => (
                    <>
                      <a key={idx} href={`//${source}`} target="_blank" rel="noopener noreferrer">{source}</a>
                      <br/>
                    </>
                  ))}
                </div>
              )}
        
              {/*{message.definitions && message.definitions.length > 0 && (*/}
              {/*  <div className="definitions">*/}
              {/*    <strong>{t('chatbot.definitions')}:</strong>*/}
              {/*    {message.definitions.map((def, idx) => (*/}
              {/*      <div key={idx} className="definition">*/}
              {/*        <span className="word">{def.word}</span>: {def.meaning}*/}
              {/*        {def.example && (*/}
              {/*          <div className="example">{def.example}</div>*/}
              {/*        )}*/}
              {/*      </div>*/}
              {/*    ))}*/}
              {/*  </div>*/}
              {/*)}*/}
            </div>
          ))}
          
          {isTyping && (
            <div className="chatbot-typing">
              <div className="chatbot-typing-dot"></div>
              <div className="chatbot-typing-dot"></div>
              <div className="chatbot-typing-dot"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className={`chatbot-input chatbot-input--${directionClass}`}>
          <textarea
            key={preferredLanguage}
            id={preferredLanguage === 'arabic' ? 'chatInput' : ''}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chatbot.input_placeholder')}
            rows={2}
            disabled={ragMutation.isLoading}
            dir={directionClass}
          />
          <button type="submit" disabled={ragMutation.isLoading}>
            {ragMutation.isLoading ? (
              <div className="loading">
                <span>{t('chatbot.sending')}</span>
              </div>
            ) : (
              t('chatbot.send')
            )}
          </button>
        </form>
        
        {showSubscriptionModal && (
          <Elements stripe={stripePromise}>
            <SubscriptionModal
              onClose={() => setShowSubscriptionModal(false)}
              onSuccess={() => {
                setSubscriptionStatus('premium');
                setShowSubscriptionModal(false);
              }}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default Chatbot;