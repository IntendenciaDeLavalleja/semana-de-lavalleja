import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';

import { $motionPreference } from '../../features/motion/preferences';
import { Icon } from './Icon';

export function MotionToggle() {
  const preference = useStore($motionPreference);
  const [mounted, setMounted] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    setMounted(true);
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const current = mounted ? preference : 'system';
  const reduced = current === 'reduce' || (current === 'system' && systemReduced);
  const label = systemReduced
    ? 'Movimiento reducido (sistema)'
    : reduced
      ? 'Activar movimiento'
      : 'Reducir movimiento';

  return (
    <button
      className="motion-toggle"
      type="button"
      aria-pressed={reduced}
      disabled={systemReduced}
      title={
        systemReduced
          ? 'Se respeta la preferencia de accesibilidad de tu dispositivo.'
          : 'Cambiar entre recorrido animado y programación estática'
      }
      onClick={() => {
        const next = reduced ? 'full' : 'reduce';
        $motionPreference.set(next);
        window.dispatchEvent(new CustomEvent('festival:motion', { detail: next }));
      }}
    >
      <Icon name="motion" />
      <span>{label}</span>
    </button>
  );
}
