import type { ReactNode } from 'react';
import { BrandPanel, type BrandPanelVariant } from '@/ui/layout/BrandPanel/BrandPanel';
import styles from './LoginScreen.module.css';

export type LoginScreenProps = {
  children: ReactNode;
  hideBrandOnMobile?: boolean;
  variant?: BrandPanelVariant;
};

export function LoginScreen({
  children,
  hideBrandOnMobile = false,
  variant = 'login',
}: LoginScreenProps) {
  const classes = [styles.screen, hideBrandOnMobile && styles.hideBrandOnMobile]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes}>
      <BrandPanel variant={variant} />
      <main className={styles.formPanel}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
