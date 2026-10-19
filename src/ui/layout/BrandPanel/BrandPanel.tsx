import logoMark from '@/ui/assets/logo-mark.svg';
import logoMarkRegister from '@/ui/assets/logo-mark-register.svg';
import styles from './BrandPanel.module.css';

export type BrandPanelVariant = 'login' | 'register';

export type BrandPanelProps = {
  variant?: BrandPanelVariant;
};

/** Panel de marca del diseño (Figma, frames 01 · Login y 04 · Registro). */
export function BrandPanel({ variant = 'login' }: BrandPanelProps) {
  const isRegister = variant === 'register';

  return (
    <header className={styles.panel}>
      <div className={styles.logo}>
        <img
          src={isRegister ? logoMarkRegister : logoMark}
          alt=""
          width={20}
          height={isRegister ? 28 : 44}
        />
        <span className={styles.logoText}>KynWallet</span>
      </div>

      <div className={styles.headline}>
        <p className={styles.title}>
          {isRegister ? (
            <>
              Comienza tu <br />
              camino financiero.
            </>
          ) : (
            <>
              Tu dinero,
              <br />
              sin fronteras.
            </>
          )}
        </p>
        <p className={styles.subtitle}>
          {isRegister
            ? 'Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.'
            : 'Envía, recibe y paga en segundos. Una billetera pensada para tu día a día.'}
        </p>
      </div>

      <div className={styles.card} aria-hidden="true">
        <div className={styles.cardTop}>
          <span className={styles.cardName}>Kyn Card</span>
          <span className={isRegister ? `${styles.chip} ${styles.chipRegister}` : styles.chip} />
        </div>
        <span className={styles.cardNumber}>{'5294  ••••  ••••  4827'}</span>
        <div className={styles.cardBottom}>
          <span>STEVEN LUNA</span>
          <span>12/29</span>
        </div>
      </div>
    </header>
  );
}
