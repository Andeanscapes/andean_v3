import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom does not implement scrollIntoView — mock it globally
window.HTMLElement.prototype.scrollIntoView = () => {};

// Cleanup after each test to ensure DOM is clean
afterEach(() => {
  cleanup();
});

