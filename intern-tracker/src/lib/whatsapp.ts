export function buildWhatsAppLink(whatsapp: string, message: string) {
  const digits = whatsapp.replace(/[^0-9]/g, '');
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}
