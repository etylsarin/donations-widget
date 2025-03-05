import { JSXInternal } from 'preact/src/jsx';
import styles from './input.module.css';

export interface InputProps {
  label?: string;
  onChange?: (value: string) => void;
}

export const Input = ({
  label,
  type = 'text',
  required = false,
  onChange,
  ...props
}: InputProps & Omit<JSXInternal.HTMLAttributes<HTMLInputElement>, 'onChange'>) => {
  const handleChange = (event: any) => {
    onChange?.(event.target.value);
  };

  return (
    <label className={styles.label}>
      {label}
      <input
        {...props}
        className={styles.input}
        type={type}
        required={required}
        onInput={handleChange}
      />
    </label>
  );
};
