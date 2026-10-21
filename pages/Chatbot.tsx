import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import './Chatbot.scss';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { API_URL, ApiError, apiJson } from '../src/api';

interface RagRequest {
  query: string;
  model: 'cloudflare';
  preferredLanguage?: 'arabic' | 'franco-arabic';
  turnstileToken: string;
}

type TurnstileApi = {
  render: (container: HTMLElement, options: {
    sitekey: string;
    action: string;
    callback: (token: string) => void;
    'expired-callback': () => void;
    'error-callback': () => void;
  }) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};
const turnstile = () => (window as typeof window & {turnstile?: TurnstileApi}).turnstile;
const turnstileSiteKey = import.meta.env.DEV ? '1x00000000000000000000AA' : '0x4AAAAAAFfPL_h2uX1-Qyc8';

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
  const [selectedModel, setSelectedModel] = useState<RagRequest['model']>('cloudflare');
  const [preferredLanguage, setPreferredLanguage] = useState<RagRequest['preferredLanguage']>('arabic');
  const [directionClass, setDirectionClass] = useState<'rtl' | 'ltr'>('rtl'); // Add this state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [verificationError, setVerificationError] = useState(false);
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const turnstileHostRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    const render = () => {
      const api = turnstile();
      if (!active || !api || !turnstileHostRef.current || widgetIdRef.current) return;
      widgetIdRef.current = api.render(turnstileHostRef.current, {
        sitekey: turnstileSiteKey,
        action: 'rag',
        callback: token => { if (active) { setVerificationToken(token); setVerificationError(false); } },
        'expired-callback': () => { if (active) setVerificationToken(''); },
        'error-callback': () => { if (active) { setVerificationToken(''); setVerificationError(true); } },
      });
    };
    const fail = () => { if (active) setVerificationError(true); };
    const existing = document.querySelector<HTMLScriptElement>('script[data-qamous-turnstile]');
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', render);
    script.addEventListener('error', fail);
    if (!existing) {
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.qamousTurnstile = '';
      document.head.appendChild(script);
    }
    render();
    return () => {
      active = false;
      script.removeEventListener('load', render);
      script.removeEventListener('error', fail);
      if (widgetIdRef.current) turnstile()?.remove(widgetIdRef.current);
      widgetIdRef.current = null;
    };
  }, []);
  
  const ragMutation = useMutation<RagResponse, Error, RagRequest>(
    async (request) => {
      const response = await fetch(`${API_URL}/rag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        credentials: 'include',
      });
      
      return apiJson<RagResponse>(response);
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
  }, [messages, guestLimitReached]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !verificationToken || ragMutation.isLoading || guestLimitReached) return;
    const submittedToken = verificationToken;
    setVerificationToken('');
    
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
        turnstileToken: submittedToken,
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
      if (error instanceof ApiError && error.code === 'GUEST_CHAT_LIMIT') {
        setGuestLimitReached(true);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'assistant',
            content: error instanceof Error ? error.message : t('chatbot.error_message'),
          },
        ]);
      }
    } finally {
      if (widgetIdRef.current) turnstile()?.reset(widgetIdRef.current);
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
            <div className="chatbot-header-selector">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as RagRequest['model'])}
              >
                <option value="cloudflare">Cloudflare AI · Free</option>
                {/*<option value="gpt4">GPT-4</option>*/}
                {/*<option value="mistral">Mistral</option>*/}
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
                    <React.Fragment key={idx}>
                      <a href={source.startsWith('https://qamous.org/') ? source : `https://${source.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">{source}</a>
                      <br/>
                    </React.Fragment>
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
          {guestLimitReached && (
            <div className="chatbot-guest-limit" role="status">
              <span>{t('chatbot.guest_limit')}</span>
              <Link to="/login" state={{returnTo: '/chatbot'}}>{t('chatbot.sign_in_to_continue')}</Link>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form method="post" onSubmit={handleSubmit} className={`chatbot-input chatbot-input--${directionClass}`}>
          <div className="chatbot-input-verification" ref={turnstileHostRef} />
          {verificationError && <p className="chatbot-input-verification-error" role="alert">{t('chatbot.verification_error')}</p>}
          <textarea
            key={preferredLanguage}
            id={preferredLanguage === 'arabic' ? 'chatInput' : ''}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chatbot.input_placeholder')}
            rows={2}
            disabled={ragMutation.isLoading || guestLimitReached}
            dir={directionClass}
          />
          <button type="submit" disabled={ragMutation.isLoading || !verificationToken || guestLimitReached}>
            {ragMutation.isLoading ? (
              <div className="loading">
                <span>{t('chatbot.sending')}</span>
              </div>
            ) : (
              t('chatbot.send')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
