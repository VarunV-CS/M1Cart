import { FloatingWhatsApp } from 'react-floating-whatsapp';
import { whatsappConfig } from '../config/env';
import './WhatsAppWidget.css';

function WhatsAppWidget({ className = '' }) {
  const containerClassName = ['whatsapp-widget-container', className].filter(Boolean).join(' ');
  const isInOverlay = className.includes('in-overlay');
  const buttonStyle = isInOverlay ? { right: '100px', bottom: '104px' } : undefined;
  const chatboxStyle = isInOverlay ? { right: '110px', bottom: '190px' } : undefined;

  return (
    <div className={containerClassName}>
      <FloatingWhatsApp
        phoneNumber={whatsappConfig.phoneNumber}
        accountName={whatsappConfig.accountName}
        avatar={whatsappConfig.avatar}
        statusMessage={whatsappConfig.statusMessage}
        chatMessage={whatsappConfig.chatMessage}
        placeholder={whatsappConfig.placeholder}
        allowClickAway={true}
        notification={true}
        notificationSound={true}
        buttonStyle={buttonStyle}
        chatboxStyle={chatboxStyle}
      />
    </div>
  );
}

export default WhatsAppWidget;
