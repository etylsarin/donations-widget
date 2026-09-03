import { useEffect, useState } from 'preact/hooks';
import { CardLogos } from './components/card-logos/card-logos';
import { Stage, Status, Routes } from './enums';
import { Footer } from './components';
import { WidgetProps } from './interface';
import { withParsedProps } from './components/with-props/with-props';
import { DonationForm, SubmitProps } from './components/donation-form/donation-form';
import { DonorForm, FormProps } from './components/donor-form/donor-form';
import { generateUniqueNum, getTranslations } from './utils/utils';
import styles from './App.module.css';
import { widgetStyles } from './styles';
import { Translations } from './context/translations/translations';

export const Widget = ({ pgUrl, lang, ...props }: WidgetProps) => {
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
    try {
      const response = await fetch(
        `${pgUrl}${Routes.REQUEST}`,
        {
          ...fetchParams,
          body: JSON.stringify({
            parameters: {
              amount: donation.amount * 100,
              currency: t('currencyCode'),
              orderNumber: generateUniqueNum(),
              redirect_url: window.location.href.split('?')[0],
              lang: lang?.split('_')[0],
              ...form,
            },
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`payment request failed with ${response.status}`);
      }
      const url = (await response.text()).trim();
      // The gateway hands back an absolute URL to redirect to. Anything else — an
      // error body, an empty response — must never reach location.href: a relative
      // value would resolve against the host page and take the donor to a 404
      // instead of to the payment form, with no way back.
      if (!/^https?:\/\//i.test(url)) {
        throw new Error('payment request did not return a gateway url');
      }
      window.parent.location.href = url;
    } catch (error) {
      // Without this the button spins forever and the donor has no idea what
      // happened. Back to the donation stage, which is where the error is shown.
      console.error('donations-widget: could not start the payment', error);
      setStatus(Status.ERROR);
      setStage(Stage.DONATION);
    }
  };
  useEffect(() => {
    // Coming back from the payment gateway restores this page from the back/forward
    // cache with whatever state it was frozen in — which is BUSY, with the submit
    // button spinning forever. Reset it so the form is usable again.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setStatus(Status.NEW);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);
  useEffect(() => {
    if (resultText) {
      if (resultText === 'OK') {
        setStatus(Status.DONE);
        // Fire and forget: the donation already succeeded at the gateway, so a failure
        // here must not surface to the donor — but it must not go unhandled either.
        fetch(
          `${pgUrl}${Routes.CONFIRMATION}`,
          {
            ...fetchParams,
            body: JSON.stringify({
              parameters: {
                orderNumber,
              },
            }),
          }
        ).catch((error) =>
          console.error('donations-widget: confirmation call failed', error)
        );
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setStatus(Status.ERROR);
      }
    }
  }, [resultText]);
  return (
    <Translations.Provider value={t}>
      {/* Part of the render tree on purpose: the widget carries its own stylesheet
          into its own shadow root, so it stays styled however often a host page
          tears it down and rebuilds it. See src/styles.ts. */}
      <style dangerouslySetInnerHTML={{ __html: widgetStyles }} />
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
