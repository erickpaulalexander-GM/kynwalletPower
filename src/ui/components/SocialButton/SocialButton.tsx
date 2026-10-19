import socialIcon from '@/ui/assets/social-placeholder.svg';
import socialRegisterIcon from '@/ui/assets/social-placeholder-register.svg';
import { Button } from '../Button/Button';

export type SocialButtonVariant = 'login' | 'register';

type SocialButtonProps = {
  provider: string;
  onClick: () => void;
  variant?: SocialButtonVariant;
};

/** Botón de proveedor externo. El icono es el marcador de posición del diseño (research.md R11). */
export function SocialButton({ provider, onClick, variant = 'login' }: SocialButtonProps) {
  const iconSrc = variant === 'register' ? socialRegisterIcon : socialIcon;
  return (
    <Button variant="secondary" onClick={onClick}>
      <img src={iconSrc} alt="" width={20} height={20} />
      {provider}
    </Button>
  );
}
