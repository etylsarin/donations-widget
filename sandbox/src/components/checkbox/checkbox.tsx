import { useState } from 'preact/hooks';

import styles from './checkbox.module.css';

export interface CheckboxProps {
  label: string;
  onCheck?: (checked: boolean) => void;
}

export const Checkbox = ({ label, onCheck }: CheckboxProps) => {
  const [checked, setChecked] = useState(false);
  const handleClick = () => {
    console.log('CLICK');
    onCheck?.(!checked);
    setChecked(!checked);
  };
  return (
    <label className={styles.checkbox} onClick={handleClick}>
      <input type="checkbox" name={label} value="true" checked={checked} />{' '}
      {label}
    </label>
  );
};
