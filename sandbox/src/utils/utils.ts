import { CurrencyCode, CurrencySymbol, Lang, ResolvedLang } from '../enums';

type TranslationValue = string | ((param: any) => string);
type TranslationSet = Record<string, TranslationValue>;

/*
 * One Czech set and one English set, parameterised by currency symbol. The rendered
 * languages are then combinations of the two: EN_EU is the English copy with euros,
 * EN_US the same copy with dollars.
 */
const strings = (
  lang: Lang,
  currencySymbol: CurrencySymbol
): Record<Lang.CS | Lang.EN, TranslationSet> => ({
  [Lang.CS]: {
    infoStartDate: (startDate: Date) =>
      `vybíráme od ${startDate?.toLocaleDateString?.(lang)}`,
    infoContributions: (totalContribution: string) =>
      `${formatStringNumber(totalContribution)} ${currencySymbol}`,
    infoContributors: (totalContributors: string) => `${totalContributors} lidí`,
    labelContributors: 'přispělo',
    once: 'jednorázově',
    recurrent: 'měsíčně',
    presetOptionsLegend: 'Darovat',
    cunstomAmountLabel: 'Kolik chcete přispět?',
    contributionOption: (amount: string) => `${amount}\u00A0${currencySymbol}`,
    customAmountButton: 'Jiná částka',
    donateButton: 'Darovat',
    successMessage:
      'Děkujeme za váš příspěvek pro HappyHearts Czech Republic! Vaši platbu jsme přijali v pořádku.',
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
    legal:
      'Pokračováním v nákupu souhlastíte s <a href="https://www.happyheartsczech.org/_files/ugd/2e93ed_9599a59801304ac986837f29186d6748.pdf" target="_blank">Obchodními podmínkami</a><br />a <a href="https://www.happyheartsczech.org/_files/ugd/2e93ed_2e88d815952340a1b0d7cdf7e4d710e9.pdf" target="_blank">Podmínkami ochrany osobních údajů</a>.',
    customAmountPlaceholder: currencySymbol,
    currencySymbol,
  },
  [Lang.EN]: {
    infoStartDate: (startDate: Date) =>
      `campaign started on ${startDate?.toLocaleDateString?.(lang)}`,
    infoContributions: (totalContribution: string) =>
      `${currencySymbol} ${formatStringNumber(totalContribution)}`,
    infoContributors: (totalContributors: string) => `${totalContributors} people`,
    labelContributors: 'donated',
    once: 'once',
    recurrent: 'monthly',
    presetOptionsLegend: 'Donate',
    cunstomAmountLabel: 'How much to donate?',
    contributionOption: (amount: string) => `${currencySymbol}${amount}`,
    customAmountButton: 'Other Amount',
    donateButton: 'Donate',
    successMessage:
      'Thank you for supporting HappyHearts Czech Republic! Your donation was received.',
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
    legal:
      'By continuing to checkout, you agree to the <a href="https://www.happyheartsczech.org/_files/ugd/2e93ed_8fc1eb4a7a4947b9a9a3cca753c7afe1.pdf?lang=en" target="_blank">Terms and Conditions</a><br />and the <a href="https://www.happyheartsczech.org/_files/ugd/2e93ed_6001059bc66c453eaaa4a9f7b8523bbd.pdf?lang=en" target="_blank">Privacy Policy</a>.',
    customAmountPlaceholder: currencySymbol,
    currencySymbol,
  },
});

export const getTranslations = (lang: ResolvedLang = Lang.EN_EU) => {
  const byLang: Record<ResolvedLang, TranslationSet> = {
    [Lang.CS_CZ]: {
      ...strings(lang, CurrencySymbol.CZK)[Lang.CS],
      currencyCode: CurrencyCode.CZK,
    },
    [Lang.EN_US]: {
      ...strings(lang, CurrencySymbol.USD)[Lang.EN],
      currencyCode: CurrencyCode.USD,
    },
    [Lang.EN_EU]: {
      ...strings(lang, CurrencySymbol.EUR)[Lang.EN],
      currencyCode: CurrencyCode.EUR,
    },
  };
  const selection = byLang[lang] ?? byLang[Lang.EN_EU];
  return (name: string, value?: string | Date) =>
    typeof selection[name] === 'string'
      ? (selection[name] as string)
      : (selection[name] as (param: any) => string)(value);
};

export const camelize = (str: string) => str.replace(/-./g, x=>x[1].toUpperCase());

export const formatStringNumber = (n: string) => n.replace(/(?<!\.\d+)\B(?=(\d{3})+\b)/g, "\u00A0").replace(/(?<=\.(\d{3})+)\B/g, "\u00A0");

/*
 * GP Webpay requires ORDERNUMBER to be numeric, at most 15 digits, and unique per
 * merchant — it rejects a repeat outright, which the donor sees as a failed payment.
 *
 * This used to be derived from performance.now(), i.e. milliseconds since the page
 * loaded. Browsers clamp that to 0.1 ms, so the whole scheme only had ~1.7M possible
 * values, clustered tightly around however long people typically take to fill the
 * form — two donors who each took ~34.2 s got the same order number. Wall-clock
 * milliseconds (13 digits) plus two random digits stays inside the 15-digit budget
 * and only repeats if two donations land in the same millisecond AND draw the same
 * salt.
 */
export const generateUniqueNum = () =>
  `${Date.now()}${Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0')}`.slice(0, 15);
