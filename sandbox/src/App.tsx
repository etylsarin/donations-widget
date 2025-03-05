import { useState } from 'preact/hooks';
import { CardLogos } from './components/card-logos/card-logos';
import { Lang, Stage } from './enums';
import { Footer } from './components';
import { WidgetProps } from './interface';
import { withParsedProps } from './components/with-props/with-props';
import { DonationForm, SubmitProps } from './components/donation-form/donation-form';
import { DonorForm, FormProps } from './components/donor-form/donor-form';
import { generateUniqueNum, getTranslations } from './utils/utils';
import styles from './App.module.css';
import { Translations } from './context/translations/translations';

export const Widget = ({ pgUrl, lang = Lang.EN_US, ...props }: WidgetProps) => {
  const t = getTranslations(lang);
  const [stage, setStage] = useState<Stage>(Stage.DONATION);
  const [donation, setDonation] = useState<SubmitProps>({
    amount: 0,
    newsletterOptIn: false,
    confirmationOptIn: false,
    companyDonationOptIn: false,
  });
  const handleDonationSubmit = (form: SubmitProps) => {
    setDonation(form);
    setStage(Stage.DONOR);
  };
  const handleDonorBack = () => {
    setStage(Stage.DONATION);
  };
  const handleDonorSubmit = async (form: FormProps) => {
    const response = await fetch(
      pgUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parameters: {
            amount: donation.amount * 100,
            currency: t('currencyCode'),
            orderNumber: generateUniqueNum(),
            redirect_url: window.location.href.split('?')[0],
            ...form,
          },
        }),
      }
    );
    const url = await response.text();
    window.parent.location.href = url;
  };
  return (
    <Translations.Provider value={t}>
      <div className={styles.wrapper}>
        <div className={styles.body}>
          {stage === Stage.DONATION ? (
            <DonationForm
              {...props}
              onSubmit={handleDonationSubmit}
            />
          ) : null}
          {stage === Stage.DONOR ? (
            <DonorForm
              onSubmit={handleDonorSubmit}
              onBack={handleDonorBack}
              donation={donation}
            />
          ) : null}
          <CardLogos />
        </div>
        <Footer showLogo={!!props.totalContribution} />
      </div>
    </Translations.Provider>
  );
};

export default withParsedProps(Widget);
