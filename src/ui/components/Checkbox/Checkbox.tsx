import { useId, type ReactNode, type Ref } from 'react';
import styles from './Checkbox.module.css';

export type CheckboxProps = {
  label: ReactNode;
  checked: boolean;
  error?: string;
  ref?: Ref<HTMLInputElement>;
  onChange: (checked: boolean) => void;
};

export function Checkbox({ label, checked, error, ref, onChange }: CheckboxProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <div className={styles.wrapper}>
        <input
          id={id}
          ref={ref}
          type="checkbox"
          className={[styles.box, error && styles.invalid].filter(Boolean).join(' ')}
          checked={checked}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
