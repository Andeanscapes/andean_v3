import type { Metadata } from 'next';

// This page is a client-only stub, so metadata must live in its layout.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BookingStubLayout({ children }: { children: React.ReactNode }) {
  return children;
}
