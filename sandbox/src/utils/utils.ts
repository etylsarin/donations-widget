import { CurrencyCode, CurrencySymbol, Lang, LangWithRegion } from "../enums";

export const getTranslations = (lang: LangWithRegion) => {
  const getTranslationsObj = (currencySymbol: CurrencySymbol) => ({
    [Lang.CS]: {
      infoStartDate: (startDate: Date) => `vybíráme od ${startDate?.toLocaleDateString?.(lang)}`,
      infoContributions: (totalContribution: string) => `${formatStringNumber(totalContribution)} ${currencySymbol}`,
      infoContributors: (totalContributors: string) => `${totalContributors} lidí`,
      labelContributors: 'přispělo',
      once: 'jednorázově',
      recurrent: 'měsíčně',
      presetOptionsLegend: 'Darovat',
      cunstomAmountLabel: 'Kolik chcete přispět?',
      contributionOption: (amount: string) => `${amount}\u00A0${currencySymbol}`,
      customAmountButton: 'Jiná částka',
      donateButton: 'Darovat',
      successMessage: 'Děkujeme za váš příspěvek pro HappyHearts Czech Republic! Vaši platbu jsme přijali v pořádku.',
      errorMessage: 'Nepodařilo se dokončit platbu. Zkuste to znovu.',
      newsletterOptIn: 'Přihlaste se k odběru novinek',
      confirmationOptIn: 'Potvrzení o daru',
      companyDonationOptIn: 'Darovat jako firma',
      firstName: 'Jméno',
      lastName: 'Příjmení',
      companyName: 'Název firmy',
      companyAddress: 'Adresa společnosti',
      email: 'E-mail',
      companyRegistrationNumber: 'IČO',
      continue: 'Pokračovat',
      back: 'Zpět',
      footer: 'Od společnosti',
      legal: 'Pokračováním v nákupu souhlastíte s <a href="https://www.happyheartsczech.org/_files/ugd/2e93ed_9599a59801304ac986837f29186d6748.pdf" target="_blank">Obchodními podmínkami</a><br />a <a href="https://www.happyheartsczech.org/_files/ugd/2e93ed_2e88d815952340a1b0d7cdf7e4d710e9.pdf" target="_blank">Podmínkami ochrany osobních údajů</a>.',
      customAmountPlaceholder: currencySymbol,
      currencySymbol,
    },
    [Lang.EN]: {
      infoStartDate: (startDate: Date) => `campaign started on ${startDate?.toLocaleDateString?.(lang)}`,
      infoContributions: (totalContribution: string) => `${currencySymbol} ${formatStringNumber(totalContribution)}`,
      infoContributors: (totalContributors: string) => `${totalContributors} people`,
      labelContributors: 'donated',
      once: 'once',
      recurrent: 'monthly',
      presetOptionsLegend: 'Donate',
      cunstomAmountLabel: 'How much to donate?',
      contributionOption: (amount: string) => `${currencySymbol}${amount}`,
      customAmountButton: 'Other Amount',
      donateButton: 'Donate',
      successMessage: 'Thank you for supporting HappyHearts Czech Republic! Your donation was received.',
      errorMessage: 'We could not process your donation. Try again.',
      newsletterOptIn: 'Opt in to receive marketing news',
      confirmationOptIn: 'Donation confirmation',
      companyDonationOptIn: 'Donating on behalf of a company',
      firstName: 'First name',
      lastName: 'Last name',
      companyName: 'Company name',
      companyAddress: 'Company address',
      email: 'E-mail',
      companyRegistrationNumber: 'CRN',
      continue: 'Continue',
      back: 'Back',
      footer: 'Brought to you by',
      legal: 'By continuing to checkout, you agree to the <a href="https://www.happyheartsczech.org/_files/ugd/2e93ed_8fc1eb4a7a4947b9a9a3cca753c7afe1.pdf?lang=en" target="_blank">Terms and Conditions</a><br />and the <a href="https://www.happyheartsczech.org/_files/ugd/2e93ed_6001059bc66c453eaaa4a9f7b8523bbd.pdf?lang=en" target="_blank">Privacy Policy</a>.',
      customAmountPlaceholder: currencySymbol,
      currencySymbol,
    },
  });
  const translationsWithCurrency: Record<string, Record<
  string,
  string | ((param: any) => string)
>> = {
    [Lang.CS_CZ]: {
      ...getTranslationsObj(CurrencySymbol.CZK).cs,
      currencyCode: CurrencyCode.CZK,
    },
    [Lang.EN_US]: {
      ...getTranslationsObj(CurrencySymbol.USD).en,
      currencyCode: CurrencyCode.USD,
    },
    [Lang.EN_EU]: {
      ...getTranslationsObj(CurrencySymbol.EUR).en,
      currencyCode: CurrencyCode.EUR,
    },
  };

  const selection = translationsWithCurrency[lang];
  return (name: string, value?: string | Date) => typeof selection[name] === 'string' ? selection[name] : selection[name](value);
};

export const camelize = (str: string) => str.replace(/-./g, x=>x[1].toUpperCase());

export const formatStringNumber = (n: string) => n.replace(/(?<!\.\d+)\B(?=(\d{3})+\b)/g, "\u00A0").replace(/(?<=\.(\d{3})+)\B/g, "\u00A0");

export const generateUniqueNum = () => (+performance.now() * 1000000000).toFixed().match(/.{1,15}/g)?.[0];
