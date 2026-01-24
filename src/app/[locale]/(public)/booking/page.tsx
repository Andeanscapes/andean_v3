'use client';

import { useLanguageContext } from '@/contexts/LanguageContext';

const Booking = () => {
  const { currentLocale } = useLanguageContext();

  return (
    <div className="container lg:py-20 py-16">
      <h1 className="text-4xl font-semibold text-dark-1">Booking</h1>
      <p className="text-lg text-dark-2 mt-4">
        Current selected language: <span className="font-bold text-primary-1">{currentLocale}</span>
      </p>
    </div>
  );
};

export default Booking;