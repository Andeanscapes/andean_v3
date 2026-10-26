import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

function ModalHarness({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open dialog</button>
      <Modal open={open} title="Trip photos" closeLabel="Close gallery" onClose={() => {
        onClose();
        setOpen(false);
      }}>
        <button type="button">First photo</button>
        <button type="button">Last photo</button>
        <div hidden><button type="button">Hidden photo</button></div>
        <div style={{ display: 'none' }}><button type="button">CSS-hidden photo</button></div>
        <fieldset disabled><button type="button">Disabled photo</button></fieldset>
      </Modal>
    </>
  );
}

describe('Modal accessibility', () => {
  afterEach(() => cleanup());

  it('names the dialog, moves focus inside, traps focus, and restores focus on Escape', () => {
    const onClose = vi.fn();
    render(<ModalHarness onClose={onClose} />);
    const trigger = screen.getByRole('button', { name: 'Open dialog' });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Trip photos' });
    const closeButton = screen.getByRole('button', { name: 'Close gallery' });
    const lastPhoto = screen.getByRole('button', { name: 'Last photo' });

    expect(closeButton).toHaveFocus();
    expect(trigger.closest('[inert]')).not.toBeNull();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(lastPhoto).toHaveFocus();
    lastPhoto.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(closeButton).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
    expect(trigger).toHaveFocus();
    expect(trigger.closest('[inert]')).toBeNull();
  });

  it('isolates only the top dialog and keeps the parent locked when a nested dialog closes', () => {
    function NestedDialogs() {
      const [outerOpen, setOuterOpen] = useState(false);
      const [innerOpen, setInnerOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOuterOpen(true)}>Open trip</button>
          <Modal open={outerOpen} title="Trip" closeLabel="Close trip" onClose={() => setOuterOpen(false)}>
            <button type="button" onClick={() => setInnerOpen(true)}>Open photos</button>
            <Modal open={innerOpen} title="Photos" closeLabel="Close photos" onClose={() => setInnerOpen(false)}>
              <button type="button">Photo details</button>
            </Modal>
          </Modal>
        </>
      );
    }

    const { container } = render(<NestedDialogs />);
    const tripTrigger = screen.getByRole('button', { name: 'Open trip' });
    tripTrigger.focus();
    fireEvent.click(tripTrigger);
    const tripDialog = screen.getByRole('dialog', { name: 'Trip' });
    const photosTrigger = within(tripDialog).getByRole('button', { name: 'Open photos' });
    photosTrigger.focus();
    fireEvent.click(photosTrigger);
    const photosDialog = screen.getByRole('dialog', { name: 'Photos' });

    expect(tripDialog).toHaveAttribute('inert');
    expect(container).toHaveAttribute('inert');
    expect(photosDialog).not.toHaveAttribute('inert');
    fireEvent.keyDown(photosDialog, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: 'Photos' })).toBeNull();
    expect(tripDialog).not.toHaveAttribute('inert');
    expect(container).toHaveAttribute('inert');
    expect(document.body.style.overflow).toBe('hidden');
    expect(photosTrigger).toHaveFocus();

    fireEvent.keyDown(tripDialog, { key: 'Escape' });
    expect(container).not.toHaveAttribute('inert');
    expect(document.body.style.overflow).toBe('');
    expect(tripTrigger).toHaveFocus();
  });

  it('restores existing inert attributes and scroll policy after closing', () => {
    const background = document.createElement('div');
    background.setAttribute('inert', '');
    document.body.appendChild(background);
    document.body.style.overflow = 'auto';
    try {
      render(<ModalHarness onClose={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }));
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(background).toHaveAttribute('inert');
      expect(document.body.style.overflow).toBe('auto');
    } finally {
      background.remove();
      document.body.style.overflow = '';
    }
  });
});
