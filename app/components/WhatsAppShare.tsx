import { Button } from "@shopify/polaris";

interface WhatsAppShareProps {
  message: string;
  phoneNumber?: string;
  variant?: "primary" | "secondary" | "plain";
  size?: "slim" | "medium" | "large";
}

export function WhatsAppShare({ 
  message, 
  phoneNumber, 
  variant = "secondary",
  size = "medium" 
}: WhatsAppShareProps) {
  const handleWhatsAppShare = () => {
    const encodedMessage = encodeURIComponent(message);
    let whatsappUrl = `https://wa.me/`;
    
    if (phoneNumber) {
      // Remove any non-numeric characters from phone number
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      whatsappUrl += `${cleanPhone}?text=${encodedMessage}`;
    } else {
      // Open WhatsApp with just the message (user can choose contact)
      whatsappUrl += `?text=${encodedMessage}`;
    }
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWhatsAppShare}
      accessibilityLabel="Share on WhatsApp"
    >
      📱 WhatsApp
    </Button>
  );
}