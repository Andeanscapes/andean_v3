/**
 * Centralized configuration for Andean Scapes site
 * Contains all social media links, contact information, and other site-wide constants
 */

export const SOCIAL_LINKS = {
  whatsapp: "https://api.whatsapp.com/send/?phone=573124815443&text=Hello%21+I%27m+interested+in+your+services+for+Andean+Scapes&type=phone_number&app_absent=0",
  instagram: "https://www.instagram.com/andean_scapes/",
  facebook: "/",
  twitter: "/",
  pinterest: "/",
  youtube: "/",
} as const;

export const CONTACT_INFO = {
  phone: "573124815443",
  phoneDisplay: "+57 312-4815443",
  email: "info@andeanscapes.com",
  address: "Colombia",
} as const;

export const WHATSAPP_MESSAGE = {
  default: "Hello! I'm interested in your services for Andean Scapes",
  encoded: "Hello%21+I%27m+interested+in+your+services+for+Andean+Scapes",
  miningAdventureQuote:
    "Hola, quiero cotizar la Aventura Minera en Chivor. Vi el anuncio y quiero reservar. ¿Me ayudas con disponibilidad y plan (2D/1N o 3D/2N)?",
  miningAdventureQuoteEncoded:
    "Hola%2C%20quiero%20cotizar%20la%20Aventura%20Minera%20en%20Chivor.%20Vi%20el%20anuncio%20y%20quiero%20reservar.%20%C2%BFMe%20ayudas%20con%20disponibilidad%20y%20plan%20%282D%2F1N%20o%203D%2F2N%29%3F",
} as const;

export const BOOKING_LINKS = {
  airbnb:
    "https://es-l.airbnb.com/rooms/1323950663214484960?guests=1&adults=1&s=67&unique_share_id=d46f7320-cf46-44c7-93f2-35781c413e15",
  whatsappMiningAdventure: `https://wa.me/${CONTACT_INFO.phone}?text=${WHATSAPP_MESSAGE.miningAdventureQuoteEncoded}`,
} as const;

export const SITE_INFO = {
  name: "Andean Scapes",
  url: "https://www.andeanscapes.com",
  logo: "/assets/images/logo.png",
  logoWhite: "/assets/images/logo-white.png",
} as const;
