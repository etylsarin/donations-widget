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
  selected?: number;
  onSelect?: (value: string) => void;
}

export const RadioGroup = ({
  legend,
  name,
  values,
  className,
  selected: selectedValue,
  onSelect,
}: RadioGroupProps) => {
  const [selected, setSelected] = useState<RadioGroupItemProps | undefined>();
  const handleClick = (item: RadioGroupItemProps) => {
    setSelected(item);
    onSelect?.(item.value);
  };
  useEffect(() => {
    if (selectedValue !== selected?.value) {
      setSelected(
        values.find((item) => parseInt(item.value) === selectedValue)
      );
    }
  }, [selectedValue]);
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
            checked={item.value === selected?.value}
          />
        </label>
      ))}
    </fieldset>
  );
};
