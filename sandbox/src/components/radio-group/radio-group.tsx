import { useEffect, useState } from 'preact/hooks';

export interface RadioGroupItemProps {
  label: string;
  value: string;
}

export interface RadioGroupProps {
  legend?: string;
  name: string;
  values: RadioGroupItemProps[];
  className?: string;
  onSelect?: (value: string) => void;
}

export const RadioGroup = ({ legend, name, values, className, onSelect }: RadioGroupProps) => {
  const [selected, setSelected] = useState<RadioGroupItemProps>(values[0]);
  const handleClick = (item: RadioGroupItemProps) => {
    setSelected(item);
    onSelect?.(item.value);
  };
  useEffect(() => {
    handleClick(selected);
  }, []);
  return (
    <fieldset className={className}>
      <legend>{legend}</legend>
      {values.map((item: RadioGroupItemProps) => (
        <label role="button" onClick={() => handleClick(item)}>
          {item.label}
          <input
            type="radio"
            name={name}
            value={item.value}
            checked={item.value === selected.value}
          />
        </label>
      ))}
    </fieldset>
  );
};
