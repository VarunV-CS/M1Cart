import FloatingWhatsApp from 'react-floating-whatsapp';
import { whatsappConfig } from '../config/env';
import './WhatsAppWidget.css';

function WhatsAppWidget() {
  return (
    <div className="whatsapp-widget-container">
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
      />
    </div>
  );
}

export default WhatsAppWidget;

