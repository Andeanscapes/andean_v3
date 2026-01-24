"use client";

import React from 'react';
import {createContext, useContextSelector} from 'use-context-selector';
import type {HeaderVariant} from '@/types/ui';

export type LayoutContextValue = {
  variant: HeaderVariant;
  isSticky: boolean;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({
  variant,
  isSticky,
  children
}: {
  variant: HeaderVariant;
  isSticky: boolean;
  children: React.ReactNode;
}) {
  return <LayoutContext.Provider value={{variant, isSticky}}>{children}</LayoutContext.Provider>;
}

export function useLayoutContext() {
  const variant = useContextSelector(LayoutContext, (value) => value?.variant ?? 'default');
  const isSticky = useContextSelector(LayoutContext, (value) => value?.isSticky ?? false);
  return {variant, isSticky};
}
