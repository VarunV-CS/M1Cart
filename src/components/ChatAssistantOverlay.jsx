import { useState } from 'react';
import { whatsappConfig } from '../config/env';
import WhatsAppWidget from './WhatsAppWidget';
import './ChatAssistantOverlay.css';

function ChatAssistantOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isWhatsAppWidgetOpen, setIsWhatsAppWidgetOpen] = useState(false);
  const [message, setMessage] = useState(whatsappConfig.chatMessage);

  const toggleMenu = () => {
    setIsOpen(prev => {
      const next = !prev;

      if (!next) {
        setIsWhatsAppOpen(false);
        setIsWhatsAppWidgetOpen(false);
      }

      return next;
    });
  };

  const phoneNumber = (whatsappConfig.phoneNumber || '').replace(/\D/g, '');

  const openWhatsAppLink = () => {
    if (!phoneNumber) return;

    const text = encodeURIComponent(message.trim() || whatsappConfig.chatMessage);
    const link = `https://wa.me/${phoneNumber}?text=${text}`;

    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppToggle = () => {
    setIsWhatsAppWidgetOpen(false);
    setIsWhatsAppOpen(prev => !prev);
  };

  const handleWhatsAppWidgetToggle = () => {
    setIsWhatsAppOpen(false);
    setIsWhatsAppWidgetOpen(prev => !prev);
  };

  const handleWhatsAppSubmit = (event) => {
    event.preventDefault();
    openWhatsAppLink();
  };

  const handleMessageKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      openWhatsAppLink();
    }
  };

  return (
    <div className={`chat-assistant-overlay ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className={`chat-sub-button chat-sub-button-top ${isOpen ? 'show' : ''}`}
        onClick={handleWhatsAppToggle}
        aria-label={isWhatsAppOpen ? 'Close WhatsApp helper' : 'Open WhatsApp helper'}
        aria-expanded={isWhatsAppOpen}
      >
        <img
          src={isWhatsAppOpen ? '/WA_square.png' : '/WA_circle.png'}
          alt="WhatsApp support"
          className="chat-sub-button-logo"
        />
      </button>

      <button
        type="button"
        className={`chat-sub-button chat-sub-button-mid ${isOpen ? 'show' : ''}`}
        aria-label="AI helper"
      >
        AI
      </button>

      <button
        type="button"
        className={`chat-sub-button chat-sub-button-low ${isOpen ? 'show' : ''}`}
        onClick={handleWhatsAppWidgetToggle}
        aria-label={isWhatsAppWidgetOpen ? 'Close WhatsApp widget' : 'Open WhatsApp widget'}
        aria-expanded={isWhatsAppWidgetOpen}
      >
        <img src="/WA_square.png" alt="WhatsApp widget" className="chat-sub-button-logo" />
      </button>

      <button
        type="button"
        className={`chat-main-button ${isOpen ? 'is-open' : ''}`}
        onClick={toggleMenu}
        aria-label={isOpen ? 'Close chat quick actions' : 'Open chat quick actions'}
        aria-expanded={isOpen}
      >
        <img src="/chat-icon.jpg" alt="Chat assistant" className="chat-main-image" />
        <span className="chat-main-close" aria-hidden="true">
          ✗
        </span>
      </button>

      {isWhatsAppOpen && isOpen ? (
        <section className="whatsapp-quick-widget" aria-label="WhatsApp support chat">
          <header className="whatsapp-quick-widget-header">
            <img
              src={whatsappConfig.avatar}
              alt={`${whatsappConfig.accountName} avatar`}
              className="whatsapp-quick-widget-avatar"
            />
            <div>
              <p className="whatsapp-quick-widget-title">{whatsappConfig.accountName}</p>
              <p className="whatsapp-quick-widget-status">{whatsappConfig.statusMessage}</p>
            </div>
          </header>

          <form className="whatsapp-quick-widget-form" onSubmit={handleWhatsAppSubmit}>
            <label htmlFor="whatsapp-quick-message" className="visually-hidden">
              WhatsApp message
            </label>
            <textarea
              id="whatsapp-quick-message"
              className="whatsapp-quick-widget-input"
              placeholder={whatsappConfig.placeholder}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleMessageKeyDown}
              rows={3}
            />
            <button
              type="submit"
              className="whatsapp-quick-widget-send"
              disabled={!phoneNumber}
              title={!phoneNumber ? 'Missing WhatsApp number in configuration' : 'Open WhatsApp'}
            >
              Continue in WhatsApp
            </button>
          </form>
        </section>
      ) : null}

      {isWhatsAppWidgetOpen && isOpen ? <WhatsAppWidget className="in-overlay" /> : null}
    </div>
  );
}

export default ChatAssistantOverlay;
