import { useEffect, useRef, useState } from 'react';

import { navigation } from '../../config/navigation';
import { socialLinks } from '../../config/social';
import { Icon } from './Icon';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        className="menu-toggle icon-button"
        type="button"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name={open ? 'close' : 'menu'} />
      </button>
      <nav
        className={`mobile-nav${open ? ' is-open' : ''}`}
        id="mobile-nav"
        aria-label="Navegación móvil"
        aria-hidden={!open}
        inert={!open}
      >
        {navigation.map((item) => (
          <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
            {item.label} <span>{item.number}</span>
          </a>
        ))}
        <div className="mobile-social" aria-label="Redes sociales">
          {socialLinks.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label} ↗
            </a>
          ))}
        </div>
        <p>
          7 al 18 de octubre · 2026
          <br />
          Lavalleja, Uruguay
        </p>
      </nav>
    </>
  );
}
