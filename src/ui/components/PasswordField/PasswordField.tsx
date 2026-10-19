import { useState } from 'react';
import eyeIcon from '@/ui/assets/eye.svg';
import eyeRegisterIcon from '@/ui/assets/eye-register.svg';
import { TextField, type TextFieldProps } from '../TextField/TextField';
import styles from './PasswordField.module.css';

export type PasswordFieldVariant = 'login' | 'register';

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'endAdornment'> & {
  variant?: PasswordFieldVariant;
};

/** Campo de contraseña con control accesible de visibilidad (FR-013). */
export function PasswordField({ variant = 'login', ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const iconSrc = variant === 'register' ? eyeRegisterIcon : eyeIcon;
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={visible}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setVisible((current) => !current)}
        >
          <img src={iconSrc} alt="" width={20} height={12} />
        </button>
      }
    />
  );
}
