import { useEffect, useState } from 'preact/hooks';
import { CardLogos } from './components/card-logos/card-logos';
import { Lang, Stage, Status, Routes } from './enums';
import { Footer } from './components';
import { WidgetProps } from './interface';
import { withParsedProps } from './components/with-props/with-props';
import { DonationForm, SubmitProps } from './components/donation-form/donation-form';
import { DonorForm, FormProps } from './components/donor-form/donor-form';
import { generateUniqueNum, getTranslations } from './utils/utils';
import styles from './App.module.css';
import { Translations } from './context/translations/translations';

export const Widget = ({ pgUrl, lang = Lang.EN_US, ...props }: WidgetProps) => {
  const params = new URLSearchParams(window.parent.location.search);
  const resultText = params.get('RESULTTEXT');
  const orderNumber = params.get('ORDERNUMBER');
  const t = getTranslations(lang);
  const [status, setStatus] = useState<Status>(Status.NEW);
  const [stage, setStage] = useState<Stage>(Stage.DONATION);
  const [donation, setDonation] = useState<SubmitProps>({
    amount: 0,
    newsletterOptIn: false,
    confirmationOptIn: false,
    companyDonationOptIn: false,
  });
  const fetchParams = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const handleDonationSubmit = (form: SubmitProps) => {
    setDonation(form);
    setStage(Stage.DONOR);
  };
  const handleDonorBack = () => {
    setStage(Stage.DONATION);
  };
  const handleDonorSubmit = async (form: FormProps) => {
    setStatus(Status.BUSY);
    const response = await fetch(
      `${pgUrl}/${Routes.REQUEST}`,
      {
        ...fetchParams,
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
  useEffect(() => {
    if (resultText) {
      if (resultText === 'OK') {
        setStatus(Status.DONE);
        fetch(
          `${pgUrl}/${Routes.CONFIRMATION}`,
          {
            ...fetchParams,
            body: JSON.stringify({
              parameters: {
                orderNumber,
              },
            }),
          }
        );
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setStatus(Status.ERROR);
      }
    }
  }, [resultText]);
  return (
    <Translations.Provider value={t}>
      <div className={styles.wrapper}>
        <div className={styles.body}>
          {stage === Stage.DONATION ? (
            <DonationForm
              {...props}
              status={status}
              onSubmit={handleDonationSubmit}
            />
          ) : null}
          {stage === Stage.DONOR ? (
            <DonorForm
              status={status}
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
