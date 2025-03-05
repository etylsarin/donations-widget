import { Input } from '../input/input';
import { Submit } from '../submit/submit';
import styles from './donor-form.module.css';
import { useContext, useState } from 'preact/hooks';
import { Translations } from '../../context';
import { formatStringNumber } from '../../utils/utils';
import { SubmitProps } from '../donation-form/donation-form';

export interface FormProps {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companyAddress?: string;
  companyRegistrationNumber?: string;
  email?: string;
}

export interface DonorFormProps {
  donation: SubmitProps;
  onSubmit?: (from: FormProps) => void;
  onBack?: () => void;
}

export const DonorForm = ({ donation, onSubmit, onBack }: DonorFormProps) => {
  const [form, setForm] = useState<FormProps>({});
  const t = useContext(Translations);
  const submitLabel = `${t('donateButton')}  ${
    donation.amount
      ? t('contributionOption', formatStringNumber(`${donation.amount}`))
      : ''
  }`;
  const handleClick = () => {
    onBack?.();
  };
  const handleInput = (name: string, value: string) => {
    setForm({
      ...form,
      [name]: value,
    });
  };
  const handleSubmit = (event: any) => {
    event.preventDefault();
    onSubmit?.(form);
  };
  return (
    <>
      <button type="button" onClick={handleClick} className={styles.back}>
        {t('back')}
      </button>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          placeholder={t('firstName')}
          name="firstName"
          required={donation.confirmationOptIn}
          onChange={(value) => handleInput('firstName', value)}
        />
        <Input
          placeholder={t('lastName')}
          name="lastName"
          required={donation.confirmationOptIn}
          onChange={(value) => handleInput('lastName', value)}
        />
        {donation.companyDonationOptIn ? (
          <>
            <Input
              placeholder={t('companyName')}
              name="companyName"
              required
              onChange={(value) => handleInput('companyName', value)}
            />
            <Input
              placeholder={t('companyAddress')}
              name="companyAddress"
              required
              onChange={(value) => handleInput('companyAddress', value)}
            />
            <Input
              placeholder={t('companyRegistrationNumber')}
              name="crn"
              required
              onChange={(value) => handleInput('crn', value)}
            />
          </>
        ) : null}
        <Input
          placeholder={t('email')}
          name="email"
          required={donation.confirmationOptIn || donation.newsletterOptIn}
          onChange={(value) => handleInput('email', value)}
        />
        <Submit label={submitLabel} />
      </form>
    </>
  );
};
