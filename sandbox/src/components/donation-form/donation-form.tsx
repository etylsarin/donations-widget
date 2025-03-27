import { useContext, useState } from 'preact/hooks';
import { Header } from '../header/header';
import { Checkbox } from '../checkbox/checkbox';
import { RadioGroup } from '../radio-group/radio-group';
import { Status } from '../../enums';
import { ShowStatus } from '../show-status/show-status';
import { DonationAmount } from '../donation-amount/donation-amount';
import { Submit } from '../submit/submit';
import { WidgetProps } from '../../interface';
import styles from './donation-form.module.css';
import { Translations } from '../../context';

export interface SubmitProps {
  amount: number;
  newsletterOptIn: boolean;
  confirmationOptIn: boolean;
  companyDonationOptIn: boolean;
}

export interface DonationFormProps extends Omit<WidgetProps, 'pgUrl'> {
  status: Status;
  onSubmit?: (form: SubmitProps) => void;
}

export const DonationForm = ({
  status,
  onSubmit,
  ...props
}: DonationFormProps) => {
  const t = useContext(Translations);
  const recurrentOptions = [
    { label: t('once'), value: 'once' },
    { label: t('recurrent'), value: 'recurrent' },
  ];
  const defaultValue = props.contributionOptions?.[0] || 0;
  const [amount, setAmount] = useState<number>(defaultValue);
  const [newsletterOptIn, setNewsletterOptIn] = useState<boolean>(false);
  const [confirmationOptIn, setConfirmationOptIn] = useState<boolean>(false);
  const [companyDonationOptIn, setCompanyDonationOptIn] =
    useState<boolean>(false);
  const statusMessage: { [key in Status]?: string } = {
    [Status.DONE]: t('successMessage'),
    [Status.ERROR]: t('errorMessage'),
  };
  const handleSubmit = (event: any) => {
    event.preventDefault();
    onSubmit?.({
      amount,
      newsletterOptIn,
      confirmationOptIn,
      companyDonationOptIn,
    });
  };
  const handleAmountChange = (amount: number) => {
    setAmount(amount);
  };
  const handleNewsletterOptIn = (checked: boolean) => {
    setNewsletterOptIn(checked);
  };
  const handleConfirmationOptIn = (checked: boolean) => {
    setConfirmationOptIn(checked);
  };
  const handleCompanyDonationOptIn = (checked: boolean) => {
    setCompanyDonationOptIn(checked);
  };

  return (
    <>
      <Header
        startDate={props.startDate}
        totalContribution={props.totalContribution}
        totalContributors={props.totalContributors}
      />
      <form onSubmit={handleSubmit} className={styles.form}>
        {props.recurrent ? (
          <RadioGroup
            name="repetition"
            values={recurrentOptions}
            className={styles.repetition}
          />
        ) : null}
        <DonationAmount
          contributionOptions={props.contributionOptions}
          onChange={handleAmountChange}
          defaultValue={defaultValue}
        />
        <Checkbox
          onCheck={handleNewsletterOptIn}
          label={t('newsletterOptIn')}
        />
        <Checkbox
          onCheck={handleConfirmationOptIn}
          label={t('confirmationOptIn')}
        />
        {confirmationOptIn ? (
          <Checkbox
            onCheck={handleCompanyDonationOptIn}
            label={t('companyDonationOptIn')}
          />
        ) : null}
        <Submit label={t('continue')} status={status} />
      </form>
      {status in statusMessage ? (
        <ShowStatus status={status} message={statusMessage[status] as string} />
      ) : null}
    </>
  );
};
