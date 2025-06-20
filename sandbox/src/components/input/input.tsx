import styles from './input.module.css';

export interface InputProps {
  label?: string;
  type?: 'text' | 'number';
  name?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  autofocus?: boolean;
  onChange?: (value: string) => void;
  onKeyDown?: (event: any) => void;
}

export const Input = ({
  label,
  type = 'text',
  required = false,
  onChange,
  ...props
}: InputProps) => {
  const handleChange = (event: any) => {
    onChange?.(event.target.value);
  };

  return (
    <label className={styles.label}>
      {label}
      <input
        {...props}
        className={`${styles.input} ${props.className}`}
        type={type}
        required={required}
        onInput={handleChange}
      />
    </label>
  );
};
