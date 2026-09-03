import { useContext, useState } from 'preact/hooks';
import { formatStringNumber } from '../../utils/utils';
import { RadioGroup } from '../radio-group/radio-group';
import { Input } from '../input/input';
import styles from './donation-amount.module.css';
import { Translations } from '../../context';

export enum DonationType {
  PRESET = 'PRESET',
  CUSTOM = 'CUSTOM',
}

export interface DonationAmountProps {
  defaultValue?: number;
  contributionOptions?: number[];
  onChange?: (amount: number) => void;
}

export const DonationAmount = ({
  defaultValue,
  contributionOptions,
  onChange,
}: DonationAmountProps) => {
  const t = useContext(Translations);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [radioValue, setRadioValue] = useState<number | undefined>(defaultValue);
  const presetOptions = contributionOptions?.map?.((item) => ({
    label: t('contributionOption', formatStringNumber(item.toString())),
    value: item.toString(),
  }));
  const handleChange = (type: DonationType) => (value: string) => {
    if (type === DonationType.PRESET) {
      setShowCustomInput(false);
      setRadioValue(parseInt(value));
    }
    // Guard the amount that ends up in the payment request: abs() so a pasted or
    // spinner-produced negative can never reach the gateway, radix 10 so a leading
    // zero is not read as octal.
    onChange?.(Math.abs(parseInt(value, 10)) || 0);
  };
  const handleClick = () => {
    setShowCustomInput(true);
    setRadioValue(undefined);
  };
  // The amount is a number input, so the browser would otherwise accept "1e5", "+2"
  // and "-3" as valid keystrokes.
  const handleKeyDown = (event: KeyboardEvent) =>
    ['e', 'E', '+', '-'].includes(event.key) && event.preventDefault();
  return (
    <>
      {presetOptions?.length ? (
        <RadioGroup
          legend={t('presetOptionsLegend')}
          name="amount-preset"
          values={presetOptions}
          selected={radioValue}
          className={styles.options}
          onSelect={handleChange(DonationType.PRESET)}
        />
      ) : null}
      <fieldset id="toggle" className={styles.fieldset}>
        {showCustomInput ? (
          <>
            <Input
              label={t('cunstomAmountLabel')}
              className={styles.amount}
              name="amount"
              type="number"
              min={1}
              max={1000000}
              step={1}
              required={showCustomInput}
              autofocus={true}
              onChange={handleChange(DonationType.CUSTOM)}
              onKeyDown={handleKeyDown}
            />
            <span className={styles.currency}>
              {t('customAmountPlaceholder')}
            </span>
          </>
        ) : (
          <button
            type="button"
            role="button"
            className={styles.customFieldToggle}
            onClick={handleClick}
          >
            {t('customAmountButton')}
          </button>
        )}
      </fieldset>
    </>
  );
};
