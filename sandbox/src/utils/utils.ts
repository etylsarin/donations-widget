import { CurrencyCode, CurrencySymbol, Lang } from "../enums";

export const getTranslations = (lang = Lang.EN_US) => {
  let selection;
  const translations: Record<Lang, Record<
  string,
  string | ((param: any) => string)
>> = {
    [Lang.CS_CZ]: {
      infoStartDate: (startDate: Date) => `vybíráme od ${startDate?.toLocaleDateString?.(lang)}`,
      infoContributions: (totalContribution: string) => `${formatStringNumber(totalContribution)} ${translations[lang]?.currencySymbol}`,
      infoContributors: (totalContributors: string) => `${totalContributors} lidí`,
      labelContributors: 'přispělo',
      once: 'jednorázově',
      recurrent: 'měsíčně',
      presetOptionsLegend: 'Darovat',
      cunstomAmountLabel: 'Kolik chcete přispět?',
      contributionOption: (amount: string) => `${amount}\u00A0${translations[lang]?.currencySymbol}`,
      customAmountPlaceholder: CurrencySymbol.CZK,
      customAmountButton: 'Jiná částka',
      donateButton: 'Darovat',
      currencySymbol: CurrencySymbol.CZK,
      currencyCode: CurrencyCode.CZK,
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
    },
    [Lang.EN_US]: {
      infoStartDate: (startDate: Date) => `campaign started on ${startDate?.toLocaleDateString?.(lang)}`,
      infoContributions: (totalContribution: string) => `${translations[lang]?.currencySymbol} ${formatStringNumber(totalContribution)}`,
      infoContributors: (totalContributors: string) => `${totalContributors} people`,
      labelContributors: 'donated',
      once: 'once',
      recurrent: 'monthly',
      presetOptionsLegend: 'Donate',
      cunstomAmountLabel: 'How much to donate?',
      contributionOption: (amount: string) => `${translations[lang]?.currencySymbol}${amount}`,
      customAmountPlaceholder: CurrencySymbol.USD,
      customAmountButton: 'Other Amount',
      donateButton: 'Donate',
      currencySymbol: CurrencySymbol.USD,
      currencyCode: CurrencyCode.USD,
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
    },
  };
  if (translations[lang]) {
    selection = translations[lang];
  } else {
    selection = translations[Lang.EN_US];
  }
  return (name: string, value?: string | Date) => typeof selection[name] === 'string' ? selection[name] : selection[name](value);
};

export const camelize = (str: string) => str.replace(/-./g, x=>x[1].toUpperCase());

export const formatStringNumber = (n: string) => n.replace(/(?<!\.\d+)\B(?=(\d{3})+\b)/g, "\u00A0").replace(/(?<=\.(\d{3})+)\B/g, "\u00A0");

export const generateUniqueNum = () => (+performance.now() * 1000000000).toFixed().match(/.{1,15}/g)?.[0];
