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

export const BOOKING_LINKS = {
  airbnb: "https://es-l.airbnb.com/rooms/1323950663214484960?guests=1&adults=1&s=67&unique_share_id=1fc6b985-4dc1-4d91-9439-95938f0b9e40",
} as const;

export const CONTACT_INFO = {
  phone: "573124815443",
  phoneDisplay: "+57 312-4815443",
  email: "info@andeanscapes.com",
  address: "Colombia",
} as const;

export const SITE_INFO = {
  name: "Andean Scapes",
  url: "https://www.andeanscapes.com",
  logo: "/assets/images/logo.png",
  logoWhite: "/assets/images/logo-white.png",
} as const;

export const WHATSAPP_MESSAGE = {
  default: "Hello! I'm interested in your services for Andean Scapes",
  encoded: "Hello%21+I%27m+interested+in+your+services+for+Andean+Scapes",
} as const;
