// import css from './donations.css?raw';

import { camelize, formatStringNumber, generateUniqueNum } from "./utils";

export const attributes = ['start-date', 'total-contribution', 'total-contributors', 'currency', 'contribution-options', 'lang', 'recurrent'];

export type DonationsProps = (typeof attributes)[number];

export enum Lang {
  CS_CZ = 'cs-cz',
  EN_US = 'en-us',
}

export enum CurrencySymbol {
  CZK = 'Kč',
  USD = '$'
}

export enum CurrencyCode {
  CZK = '203',
  USD = '200',
}

export interface DonationsState {
  showRecurrent?: boolean;
  showCustomAmount?: boolean;
  isRecurrent?: boolean;
  isDone?: boolean;
  isError?: boolean;
  amount: number;
  startDate?: Date;
  totalContribution?: string;
  totalContributors?: string;
  contributionOptions: string[];
  currencySymbol?: CurrencySymbol;
  currencyCode?: CurrencyCode;
  lang?: Lang;
}

export class Donations extends HTMLElement {
  state: DonationsState;
  shadow: ShadowRoot | null;
  logo: string | undefined;

  constructor() {
    super();
    this.state = {
      amount: 0,
      contributionOptions: [],
      showRecurrent: false,
      showCustomAmount: true,
      isDone: false,
      isError: false,
    };
    this.shadow = null;
  }

  // component attributes
  static get observedAttributes() {
    return attributes;
  }

  static getTranslations = (lang = Lang.EN_US) => {
    const translations = {
      [Lang.CS_CZ]: {
        infoStartDate: (startDate: Date) => `vybíráme od ${startDate.toLocaleDateString(lang)}`,
        infoContributions: (totalContribution: string) => `${totalContribution} ${translations[lang].currencySymbol}`,
        infoContributors: (totalContributors: string) => `${totalContributors} lidí`,
        labelContributors: 'přispělo',
        once: 'jednorázově',
        recurrent: 'měsíčně',
        presetOptionsLegend: 'Přispět',
        cunstomAmountLabel: 'Kolik chcete přispět?',
        contributionOption: (amount: string) => `${amount} ${translations[lang].currencySymbol}`,
        customAmountPlaceholder: CurrencySymbol.CZK,
        customAmountButton: 'Jiná částka',
        donateButton: 'Darovat',
        currencySymbol: CurrencySymbol.CZK,
        currencyCode: CurrencyCode.CZK,
        successMessage: 'Děkujeme za váš příspěvek pro HappyHearts Czech Republic! Vaši platbu jsme přijali v pořádku.',
        errorMessage: 'Nepodařilo se dokončit platbu. Zkuste to znovu.',
      },
      [Lang.EN_US]: {
        infoStartDate: (startDate: Date) => `campaign started on ${startDate.toLocaleDateString(lang)}`,
        infoContributions: (totalContribution: string) => `${translations[lang].currencySymbol} ${totalContribution}`,
        infoContributors: (totalContributors: string) => `${totalContributors} people`,
        labelContributors: 'donated',
        once: 'once',
        recurrent: 'monthly',
        presetOptionsLegend: 'Donate',
        cunstomAmountLabel: 'How much to donate?',
        contributionOption: (amount: string) => `${translations[lang].currencySymbol}${amount}`,
        customAmountPlaceholder: CurrencySymbol.USD,
        customAmountButton: 'Other Amount',
        donateButton: 'Donate',
        currencySymbol: CurrencySymbol.USD,
        currencyCode: CurrencyCode.USD,
        successMessage: 'Thank you for supporting HappyHearts Czech Republic! Your donation was received.',
        errorMessage: 'We could not process your donation. Try again.',
      },
    };
    return translations[lang];
  };

  static getHTML = ({
    isDone,
    isError,
    showRecurrent,
    showCustomAmount,
    isRecurrent,
    startDate,
    totalContribution,
    totalContributors,
    contributionOptions,
    amount,
    lang
  }: DonationsState) => {
    const logo = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA2ODUgMjI2Ij4KICA8cGF0aCBmaWxsPSIjRjI2NjM4IiBkPSJtMTU2LjMgMTM1LjQgMy43LTQuNi0yLjEgMi4xYTggOCAwIDAgMC0xLjYgMi41Wm03LjQtOC43LjctLjguNS0uNy0xLjMgMS41Wm02LjktNy43Wm0tNS44IDUuOGMuNS0uMy44LS41LjEuNGwyLTIuNGMtLjguOC0xLjUgMS41LTIuMiAyWm0wIDAtMS42IDEuMyAxLjYtMS4zWm0tLjYtNGMuNy0uOSAxLjIgMCAyLjUtMS43IDMuMi0zLjcgNS44LTYuOSA5LTEwLjEgMS4zLTEuNiA0LjMtMy4zIDUuNi00LjkgMS41LTEuOCA0LTUuNCA1LjItNy44IDEuNC0yLjQgMS44LTMuNi0uMi0uNmwtNC41IDUuOS00LjUgNS05LjMgOS44Yy01LjUgNi0xMC40IDEyLjItMTUuMSAxOWwtNCA1LjRjMS43LTIuMyAzLjUtNC42IDUuNi03IDIuOS0zLjMgNS4zLTggOS43LTEzWm0tMjUuOSA1My42di0zLjFjMS40LTQuNSAyLjUtOS4xIDQtMTMuN2wtMS4yIDEuOGMtLjggMi43LS43IDMgLjMuOGE0MC45IDQwLjkgMCAwIDAtMy45IDE2Yy4zLS40LjYtLjMuOC0xLjhabS0zLjcgMi45IDIuOS0xdi0uMi4xbC0zIDEuMloiLz4KICA8cGF0aCBmaWxsPSIjRjI2NjM4IiBkPSJNMTg1LjMgMTAyLjVjNC40LTUuMyA4LjItMTEgMTEtMTYuOWE1NCA1NCAwIDAgMCA1LjUtMTguNmMwLTEtLjItMS43IDAtM2wuMy0zYzAtMS45LS4yLTMuNy0uNC01LjZsLS4zLTJjLS4zLTEtLjQtLjctLjQgMHYyLTJjMC0uOSAwLTEuOS0uMy0zbC0xLjMtNS4yYy43IDIgMSAzLjcgMS4zIDUuMmwuNyAzIC4yIDFhNjkgNjkgMCAwIDAtMi45LTEyLjVjLS4zLS45LS42LTEuOC0xLTIuNS0xLTIuOC0yLjUtNS41LTMtNy40bC0xLTIgLjIuMy0uNC0uN2E2MyA2MyAwIDAgMC01LjItOC4yIDQwLjMgNDAuMyAwIDAgMC00LjctNC41bC0uNC0uNy0uOC0xLjFhMzQgMzQgMCAwIDEtMy0yYzEuMiAxLjIgMi4xIDIuNSAzIDMuNy0uOS0xLjItMS44LTIuNS0zLTMuOGE3MDk1IDcwOTUgMCAwIDAtOC4yLTZjMy43IDEuNiA2LjMgMy45IDguMiA2YTM0IDM0IDAgMCAwIDMgMmwuOCAxLjIuNS43IDIuMyAyLjIgMi4zIDIuM2E1NS40IDU1LjQgMCAwIDAtMjguNS0xOS42Yy01LjEtMS40LTEwLjQtMi0xNS42LTEuNi01LjIuNC0xMC4zIDEuNi0xNS4xIDMuNGE0NC40IDQ0LjQgMCAwIDAtMjMuMyAyMC4yYy0yLjQgNC41LTQuNSA5LTcuNCAxMy4xLTEuNCAyLTMgNC00LjggNS0xLjUgMS00IC43LTYuMyAwLTIuMy0uNi00LjYtMS43LTctMi44bC03LTMuOC00LjItMmE4Mi42IDgyLjYgMCAwIDAtMTMtMy4zIDQ1IDQ1IDAgMCAwLTE3LjkgMS42IDYyLjggNjIuOCAwIDAgMC0xNS45IDcuNmMtNC44IDMuNC05IDcuOC0xMi4zIDEyLjZBNTcuMSA1Ny4xIDAgMCAwIC40IDg0LjJhNzcgNzcgMCAwIDAgNy44IDMyLjEgNTggNTggMCAwIDAgMjMgMjQuNCA5MC4xIDkwLjEgMCAwIDAgMjMuNyA5LjVMNjMgMTUyYTM2MS4xIDM2MS4xIDAgMCAwIDE0LjcgM2M1LjQgMSAxMSAyLjQgMTYuNiA0LjFhMTA2IDEwNiAwIDAgMSAxNS41IDYgNzIgNzIgMCAwIDEgMTEuNiA3YzIuMiAxLjQgMy44IDIuNyA1LjEgMy42bDEuOCAxLjNjLjIgMCAuMy4yLjQuM2ExNS43IDE1LjcgMCAwIDAgMS41IDEuMWMxLjMgMSAyLjMgMS4zIDIuOCAxLjQuNSAwIC43LS4yLjctLjUgMC0uNi0uNS0xLjgtLjktM2EzOSAzOSAwIDAgMC0xNi4xLTE2LjVjLTctNC0xNi03LjgtMjkuNC0xMiA0LjYgMS40IDYgMi4xIDUuMiAyLjEtLjcgMC0zLjYtLjYtNy42LTEuNC04LTEuNy0yMC4zLTMuOS0yOC42LTYuNy01LjgtMi4yLTEyLjItNC42LTE4LjQtOGE0NS42IDQ1LjYgMCAwIDEtMTYuNS0xMy4yYy00LjYtNS42LTgtMTIuNy0xMC4yLTIwLjJhNTQuNCA1NC40IDAgMCAxIDUuNy00NGMzLTQuNiA2LjktOC40IDExLjMtMTEuNGE0Ny43IDQ3LjcgMCAwIDEgMjIuMy03LjVjMi41IDAgNSAuMiA3LjYuNyAyLjYuNSA1LjMgMS4yIDcuOSAybDMuNSAxLjYgMy45IDIgMiAxYTUwLjIgNTAuMiAwIDAgMCAxMiA0LjVjMS45LjMgNCAuNiA2LjggMGwyLS44IDEtLjUuNy0uNSAyLjUtMmMxLjQtMS41IDIuNS0zIDMuNS00LjNhNzcgNzcgMCAwIDAgNS04LjVsMi00LjEgMS0yYTQ1LjcgNDUuNyAwIDAgMSA2LjEtOC4yIDQ1LjIgNDUuMiAwIDAgMSA0Ny05LjMgNTMuOCA1My44IDAgMCAxIDE3LjcgMTMuNSA3MS40IDcxLjQgMCAwIDEgOC4yIDExLjZjLTItMy43LTQuMy03LjMtNy42LTExLjItMi4zLTIuNS0xLjMtMS45LjcgMCAyIDEuNyA0LjYgNSA1LjggNi45IDEuMyAxLjYgMS44IDQuOSAyLjggNi42IDEuNyA0IDMuNCA3LjYgNC44IDEyLjEuNyAyLS4zIDEuOSAwIDIuOCAxLjUgNi4xIDIuNyAxMSAyIDE1LjEtLjMgMy4xLTEgNS44LTEuOCA4LjRsLTEuNyA0LjktMS4xIDMuM2MuNi0uNyAxLTEgMS41LTEuMWwtMi44IDUuMiAyLjgtNS4yYy0uNS4yLTEgLjMtMS41IDEtMyA4LTguNCAxNi41LTE0LjYgMjMuNWguMmMxLjktMiAzLjUtNCA1LjMtNi4yTDE5MSA5NGMtMS42IDEuOS0xLjYgMS41IDAtLjlsMS40LTEuNWE0MiA0MiAwIDAgMS04LjUgMTEuNGwtMS44IDIuNmMtMS4yIDEtMS4zLjgtMS44LjhsLTIuMiAyLjQgNC41LTMuNiAyLjctMi43WiIvPgogIDxwYXRoIGZpbGw9IiNGMjY2MzgiIGQ9Im0yMDAuNyA1MC4zLjYgMi42YTc1IDc1IDAgMCAwLTIuNS0xMC40Yy4yIDEuOSAxLjIgNC44IDIgNy44Wk04NS4zIDczLjdhNS45IDUuOSAwIDEgMS0xMS40IDMgNS45IDUuOSAwIDAgMSAxMS40LTNabTQwLjUtMTAuOWE1LjkgNS45IDAgMSAxLTExLjUgMyA1LjkgNS45IDAgMCAxIDExLjUtM1ptMTEgMjguNS0uNC43LjQtLjJjLjItLjEgMC0uMyAwLS41Wm0tLjkgMS41di4xLS4zLjJabS0uNSAxLjIuNC0uNy0uNC43Wm0uOC0uOWMtLjIgMC0uMyAwLS4zLS4ybC0uMS40LjQtLjJabTAgMGguNC0uNFptMi41IDEuOWMwIC4yLS43LS4zLS43IDAtLjIuOC0uMiAxLjYtLjUgMi4xIDAgLjQtMS4xLjItMS4xLjYtLjIuNy0uNCAzIC4yIDIgLjUtLjcuOC0xLjMgMS0yIC40LS41LjctMS4xIDEtMS44bC43LTMuNi41LS44LS45IDFjLS41LjQuMSAxLjYtLjIgMi41Wm0xLTkgLjEuNWMtLjguNC0uOCAxLS45IDEuOGwuNi0uMWMwLS40LS4xLS41LS40LS4zYTMgMyAwIDAgMCAxLjMtMmgtLjdabS43LS41di41LS41Wm0tNiAxMS41Yy0xLjEgMS42LTIuMyAzLTMuNiA0LjJ2LjVoLS42bC0uNi41LS4xLjNjMCAuMiAwIC4zLjMuM2guNC0uOWMtLjIuMy0uMy41LS42LjYuMi0uMy40LS40LjYtLjVsLjItLjR2LS4ybC0xLjMgMS4yLS4zLjNjLS4yLjMtLjQuNy0xIC41bC0uMi4yaC4xLS4xbC0xLjEuOC0uNC45LS41LS4yYzAgLjMgMCAuNS0uMi43bDEgLjJjLjUuMSAwLTEuMS44LS43LS44LS40LS4zLjgtLjguN2wtMS0uM2MtLjIuNC0uOC42LTEuNC41LjMtLjYuOC0uNiAxLjQtLjRsLjItLjcuNS4yLjQtMWMtLjcuNi0xLjUgMS0yLjMgMS40YTYzIDYzIDAgMCAxLTcuNSAzLjVjLTIuNiAxLTUuMiAxLjYtOC4xIDItMy4xLjQtNi4yLjItOS0uNS0yLjgtLjYtNS41LTEtOC4xLTEuNy0yLjYtLjgtNS0yLTctNC4ybC0xLjUtMS4yLTEuOC0xLjItMS45LTEuMS0xLjUtMWMtMS41LS4zLTIuNi41LTMuNCAxLjQtLjcuOS0xIDItMSAyLS4zIDEuOS4xIDIuOCAxIDMuNmwxLjQgMS40IDEuOCAyLjJjLTEtMS4zLS4yLTEuNC44LS45bDEuOCAxLjJjLjYuNiAxLjIgMS4yIDEuNSAyYTcgNyAwIDAgMCAyLjQgMi43YzEgLjYgMi4zIDEgMy41IDEuNCAyLjUuNSA1LjIuNiA3LjYgMS4zIDEuMi40IDIuNi40IDQgLjUgMy45LjcgNy43LjMgMTEuNC0uNiAzLjctMSA3LjItMi40IDExLTQgMS45LTEgMy4xLTIuNyA0LjQtNCAxLS44IDIuNC0xLjIgMy4yLTEuOWExMiAxMiAwIDAgMCAzLTMuM2wtMyAzLjFjLS45LjggMC0xLjQuMy0yIC4xLS4zIDEuMi4xIDEuMy0uMy41LS40LjctMS4xIDEtMS44LjEtLjQuNy4zLjguMS41LS44LjItMi4yLjktMi40bDEuMS0uNy42LS42LjItLjZjLS4zIDAtLjYtLjItLjktLjRsLjgtLjUtLjguNWMuMy4yLjYuNC45LjRsMS40LTQtLjEtLjFhMyAzIDAgMCAxLTEuOCAxLjZjLjMtLjIuNSAwIC4zLjRoLS41Yy4yLS44LjQtMS41IDEuMy0xLjZ2LS41Yy4yLS4yLjUgMCAuNy4xbC4yLS40YTIgMiAwIDAgMC0xIC4zbC0uNi4yWiIvPgogIDxwYXRoIGZpbGw9IiNGMjY2MzgiIGQ9Im0xMjkuMiAxMDIuOS4zLS4zLTEuMi45Yy41LjEuNy0uMyAxLS42Wm0xMTkuNi0zNmE1LjkgNS45IDAgMSAxLTExLTQgNS45IDUuOSAwIDAgMSAxMSA0Wm0zOS42IDEzLjdhNS45IDUuOSAwIDEgMS0xMS4xLTMuOSA1LjkgNS45IDAgMSAxIDExIDRabS03IDI5LjgtLjcuMy41LjFjLjIgMCAuMi0uMi4yLS40Wm0tMS41LjYtLjEuMi4yLS4yaC0uMVptLTEuMS44Yy4zIDAgLjQtLjIuNi0uM2wtLjYuM1ptMS4yLS4zYy0uMiAwLS4zLS4xLS4yLS4zbC0uNC4zaC41Wm0wIDAgLjMuMi0uNC0uMlptMSAzYy0uMi4yLS41LS42LS43LS4zLS41LjUtMSAxLjEtMS42IDEuNC0uMi4zLTEtLjUtMS4yLS4yLS42LjUtMiAyLjItMSAxLjhsMi0xIDEuOC0xIDIuNy0yLjVjLjMtLjMuNi0uMy45LS40bC0xLjQuMmMtLjYuMS0uOCAxLjUtMS42IDJabTUuOC02LjktLjIuNWMtLjktLjEtMS4yLjUtMS43IDFsLjUuMmMuMy0uMi4yLS40LS4yLS40YTMgMyAwIDAgMCAyLjItMWMtLjIgMC0uMy0uMy0uNi0uM1ptLjYuNC40LS4zLS40LjNabS0xMS4xIDUuN2EzMCAzMCAwIDAgMS01LjMgMS41Yy0uMS4yLS4yLjQtLjQuM2wtLjUtLjItLjcuMS0uMy4xYy0uMS4yIDAgLjMgMCAuNGwtLjQtLjItLjcuMmMuMy0uMi41LS4yLjctLjJsLjQtLjJoLjEtMS43bC0uNC4yYy0uNC4xLS44LjMtMSAwaC0uNHYtLjFoLTEuNGwtLjguNS0uMy0uNGExIDEgMCAwIDEtLjUuNWwuNy43Yy4zLjQuNi0xIDEtLjEtLjQtLjgtLjcuNS0xIDBsLS43LS42Yy0uNC4xLTEgMC0xLjQtLjUuNS0uMyAxIDAgMS40LjVsLjUtLjUuMy40Yy4zIDAgLjYtLjMuOC0uNWwtMi42LS4yYTM3LjcgMzcuNyAwIDAgMS0xNi00LjMgMjcuNCAyNy40IDAgMCAxLTcuMi01LjRjLTItMi4xLTQtNC01LjctNi0xLjctMi0zLTQuNS0zLjUtNy40IDAtLjYtLjItMS4yLS41LTEuOWwtLjgtMi0uOS0yLS43LTEuNmMtMS0xLTIuNC0xLTMuNi0uNy0xIC4zLTIgMS0yIDEtMS4zIDEuNC0xLjQgMi40LTEuMiAzLjVsLjQgMmMuMi43LjMgMS42LjMgMi44LS4xLTEuNS41LTEuMiAxLjEtLjIuNC41LjcgMS4yLjggMiAuMi44LjMgMS42LjIgMi41LS4zIDEuMyAwIDIuNC40IDMuNWExMiAxMiAwIDAgMCAyLjIgMy4xYzEuNyAyIDQgMy41IDUuNSA1LjUuOCAxIDEuOSAxLjcgMyAyLjZhMjYgMjYgMCAwIDAgOS44IDUuOSA3MyA3MyAwIDAgMCAxMS4zIDIuOGMyLjEuMyA0LS4zIDUuOS0uNyAxLjItLjEgMi42LjMgMy43LjMgMS42LS4yIDMtLjYgNC4zLTEuMi0xLjUuNC0yLjUuNy00LjIgMS0xLjEuMS43LTEuMiAxLjQtMS41LjMtLjMuOS43IDEuMi41LjYtLjEgMS4yLS42IDEuOS0xIC4zLS4yLjQuNy41LjYgMS0uNCAxLjUtMS43IDIuMS0xLjZhMzkuNyAzOS43IDAgMCAwIDIuMiAwbC41LS40LS41LS44aDEtMWwuNS44IDMuNC0yLjZhMyAzIDAgMCAxLTIuNC4yYy40LjEuNC4zIDAgLjVsLS40LS4zYy42LS41IDEuMi0xIDItLjVsLjMtLjVjLjMgMCAuNC4zLjUuNWwuNC0uMmMtLjItLjItLjYtLjMtMS0uM2wtLjYtLjJaIi8+CiAgPHBhdGggZmlsbD0iI0YyNjYzOCIgZD0ibTI2OC43IDExNS43LjMtLjFoLTEuNGMuMy40LjcuMyAxIDBabS0xMzUgNzkuMS42IDEuNS0uMS0uOGMwLS4zLS4zLS41LS41LS43Wm0xLjEgMi44LjEuMy4yLjItLjMtLjVabTEuNCAyLjQtLjctMS4zLjcgMS4zWm0tLjktMmMwIC4yIDAgLjMtLjIgMGwuNC43LS4yLS43Wm0wIDB2LS42LjZabTIuMi0uM2MuMi4yLS40LjQgMCAuOGEyOS42IDI5LjYgMCAwIDAgMiAyLjdjLjQuMy4zIDEuNC43IDEuOC44LjggMy4zIDIuOCAyLjIgMS40bC0yLjItMi44Yy0uNi0uOS0xLjMtMS43LTEuOC0yLjhsLTEuNy0yLjQtMS41LTIuNy0uNC0xLjZjMCAuNy4yIDEuNS41IDIuMi4yIDEgMS4zIDIgMi4yIDMuNFptLTYuMi0xMy45LjMuN3YxLjlsLjYgMS44LjItLjZjLS4yLS43LS40LS44LS40LS4xIDAtMS41IDAtMi45LS4zLTQuMy0uMi4yLS40LjItLjQuNlptLjItMS40LjIuOC0uMi0uOFoiLz4KICA8cGF0aCBmaWxsPSIjRjI2NjM4IiBkPSJtMTM5LjYgMjA0LjUgMS42IDIuMSAxLjcgMiAuOC45LjkuOSAxLjcgMS43Yy4zIDAgLjUgMCAuNy4zbC40LjcgMS4xIDEgLjQuMmMuMy4xLjMgMCAuMi0uMmwtLjItLjQuMi40LjUuNiAxLjIuOC0xLjItLjgtLjctLjQtLjItLjEgMi42IDIgLjYuM2MuNy40IDEuNC43IDEuNyAxLjIuMiAwIC4zLjIuNS4zdi0uMWwuMS4xYy43LjUgMS40IDEgMi4yIDEuM2wxLjYuNC4zLjVoMWwtMS0uOWMtLjMtLjUtMS4zIDAtMS42LS44LjMuOCAxLjMuMyAxLjcuOGwuOSAxYTYgNiAwIDAgMSAyLjMgMS4yIDQgNCAwIDAgMS0yLjMtMS4yYy0uNC0uMS0uNy0uMi0xLS4xIDAtLjItLjMtLjUtLjMtLjVsLTEuNy0uNCAyLjIgMWMuOC41IDEuNS43IDIuMyAxYTY1LjcgNjUuNyAwIDAgMCAzMS4zIDMuNmM2LS43IDEyLTIuNSAxNy01LjVhMzIuOCAzMi44IDAgMCAwIDEyLTEyLjNjMy00LjkgNS4xLTEwLjIgNy0xNS44YTYwLjMgNjAuMyAwIDAgMCAyLTEzLjJjLjItMS41LjEtMi44LjEtNGExMC40IDEwLjQgMCAwIDAtLjYtMi4zaC0xLjRsLS43LS4xaC0uNmwtLjMtLjItLjIuMi0xLjMuMy0uOS4yaC0uMmwuMy4zLjMuNi41LjYuMi4xLjQuM2EyLjQgMi40IDAgMCAwIDIuMyAwbC4yLS4yYy4zLS4zLjYtLjYuNy0uOXYtLjhhLjcuNyAwIDAgMC0uNS0uM2MtLjIgMC0uNCAwLS42LjJsLS4yLjJhMSAxIDAgMCAxLS40LjRjLS4zLjEtLjggMC0xLS4xdi0uN2wuMy0uM2guMXYtLjFoLjFsLS4xLjFhMTAuNyAxMC43IDAgMCAwLTEuNiA1LjJsLS40IDMuM2MtLjIgMS4zLS41IDIuNy0xIDQuNC42LTIuMy45LTEuNC43LjYtLjMgMi0xIDUtMi4zIDctMS44IDIuNy0zLjEgNi4yLTQuNyA5LjdhMjYuNyAyNi43IDAgMCAxLTYuNiA5LjJjLTEuNCAxLjItMi44IDIuNS00LjYgMy43YTQ2IDQ2IDAgMCAxLTE1LjcgNS41IDU2IDU2IDAgMCAxLTE3LjgtLjFsLTQuNi0uNi00LjMtLjZjLTItLjYtMy44LTEuNy01LjMtMi40bC0zLjMtMS42LTEuNS0uNy0xLjQtLjggMS40IDEgMS41LjYgMy4xIDEuNWMuOC40LjUuNC0uMy4zYTYgNiAwIDAgMS0yLjMtLjZjLS41LS4xLS44LTEtMS4zLTEuMmwtMy0xLjVjLS42LS4yLS4yLS42LS40LS43LTEuMy0uOS0yLjgtMS4xLTMuNS0xLjlsLTEuNC0xLjdhMTIgMTIgMCAwIDAtMS0xbC0uNi0uNS0uMi43LS44LTEuMy44IDEuMy4yLS43LTIuNi0yLjMtMi41LTIuN2MuOCAxLjIgMS42IDIuMyAyLjIgMy42LS4zLS41LS4xLS42LjMgMGwuMS42YTYuNiA2LjYgMCAwIDEtMi0zbC0uNy0uNWMtLjEtLjQgMC0uNS4xLS42bC0uNS0uNy40IDEuNC40IDFaIi8+CiAgPHBhdGggZmlsbD0iI0YyNjYzOCIgZD0ibTE0OS43IDIxNC44LS42LS40IDIuMiAxLjZjLS4zLS41LTEtLjktMS43LTEuM1ptMTI4LjctNTguNy0zIC42Yy0xLjIuMi0xLjguNi0yLjcgMS4xbDUuNy0xLjdabTcuMi0xLjgtMiAuNSAxLjEtLjMuOS0uM1ptOC4xLTJabS01LjEgMS4xYy0xLjEuMi0yLjEuNC0zIC40aC4yYy41IDAgLjcuMS0uMi40bDMtLjhabS0zIC41aC0xLjkgMlptMzYuNC0xMi43LTIuMS43YTYzLjEgNjMuMSAwIDAgMS0xMy41IDMuOWwtMTMuMyAzYTE1OSAxNTkgMCAwIDAtMjMuMiA3LjFsLTYuNCAyLjNjMi44LTEgNS42LTEuOSA4LjctMi43IDQuMS0xLjEgOC44LTMuNyAxNS4zLTUuM2gxbC44LjIgMS4yLS4yYzQuOC0xLjIgOC43LTIuNCAxMy4xLTMuMyAyLS42IDUuNC0uMiA3LjQtLjhhNjkuOSA2OS45IDAgMCAwIDExLTQuOVptLTczLjMgMjcuMS0yIC44Yy0xLjQgMS0yIDEuNi0xLjggMS42bC44LS4zYTQxIDQxIDAgMCAwLTExLjQgMTAuNWMuNC0uMi41IDAgMS42LTEgLjUtMSAxLjgtMi42IDEuOC0yLjYgMy42LTIuOSA3LTYuMSAxMS05Wk0yMzEgMTgwLjJoLjFsMyAuOC4yLS4xaC0uMmwtMy0uN1oiLz4KICA8cGF0aCBmaWxsPSIjRjI2NjM4IiBkPSJNMjE3IDIuOWgtLjhhNDkgNDkgMCAwIDAtMTcuMyAzLjRjLTUuNyAyLjMtMTEgNS41LTE1LjYgOS41YTUzIDUzIDAgMCAxIDUgNS42IDQ0IDQ0IDAgMCAwLTQuNy00LjVsLS40LS43LS4yLS4yLjIuMi40LjcgMi40IDIuMiAyLjMgMi4zLjYgMWE1MS43IDUxLjcgMCAwIDEgMTMuMi04LjNjNS0yIDEwLjItMyAxNS4zLTNoLjRhNDcuOSA0Ny45IDAgMCAxIDIyLjYgNi40YzIuMiAxLjMgNC4xIDMgNiA0LjggMS45IDEuOSAzLjcgNCA1LjMgNi4yLjYuNyAxLjMgMiAyIDMuMmwyLjIgMy44IDEgMiAxLjIgMmE1My4yIDUzLjIgMCAwIDAgNi4yIDguNSAxNi41IDE2LjUgMCAwIDAgNy43IDQuM2wxIC4xaDFjMS4yIDAgMi4zLS4xIDMuMi0uMyAyLS40IDMuNy0xIDUuMy0xLjVhOTMgOTMgMCAwIDAgOS00LjNsNC0yLjIgMi0xIDEuNy0uOWEzNyAzNyAwIDAgMSAyNC41LTJjMTIgMyAyMS40IDkuMyAyNy40IDE4LjIgMiAzLjMgMy43IDcgNC45IDEwLjdhNzEuNSA3MS41IDAgMCAxIDIuMyAyNC42IDU5LjcgNTkuNyAwIDAgMC0uMS0xNS43IDQxLjMgNDEuMyAwIDAgMSAxLjYgMTEuNWMuMSAyLTEuMyA1LTEuNCA3LS44IDQuMy0xLjUgOC4zLTIuOCAxMi44LS42IDItMS4zIDEuNC0xLjYgMi4zLTIuMyA1LjktNCAxMC42LTYuOSAxMy42LTIgMi4zLTQgNC4yLTYuMiA1LjlsLTQuMiAzYTc5LjkgNzkuOSAwIDAgMS0yOCAxMy4ybC4yLjEtMy4yLjcgNS42LS40IDMuOS0uN2E4OCA4OCAwIDAgMCAxOC43LTcuOCA1My44IDUzLjggMCAwIDAgMTUtMTIuM2MuNC0uOC43LTEuNSAxLjYtMi41bDItMi4zYTU1IDU1IDAgMCAwIDIuOC00LjhsLjgtMS44Yy4yLS41LjItLjcuMS0uN2wtLjQuNC0xLjEgMS42IDEuMS0xLjYgMS41LTIuNi0xLjIgMi45LS4zLjlhNjggNjggMCAwIDAgNC42LTEybC42LTIuNWMuNy0zIDEtNiAxLjctOGwuMy0yLjItLjEuNC4yLS44YTU1LjMgNTUuMyAwIDAgMC0xMi4zLTQyIDQ2IDQ2IDAgMCAwLTEyLTEwIDU0IDU0IDAgMCAwLTI0LjctNyA0MyA0MyAwIDAgMC0yMC4zIDQuOGMtNC41IDIuNC04LjkgNS0xMy41IDYuNy0yLjEuOC00LjQgMS41LTYuMyAxLjVoLS41Yy0xLjctLjEtMy42LTEuOC01LjEtMy42YTQwIDQwIDAgMCAxLTQuMi02LjNjLTEuMi0yLjItMi40LTQuOC0zLjgtNy4xbC0yLjMtNGE2OC45IDY4LjkgMCAwIDAtOC45LTEwYy00LjUtNC4xLTEwLTctMTUuNi04LjhBNjMgNjMgMCAwIDAgMjE3IDIuOVptMTQzLjcgNjYuOS0zLjMtOS43YzIgMy40IDMgNi44IDMuMyA5LjdMMzYyIDczbC0xLjMtMy4zWm0uNCA0Ljl2LS4xWm0tMSAzMC4zYTY5IDY5IDAgMCAxLTIuOCA3LjVsLjEtLjItLjEuMy44LTIuMmMuNy0yLjIgMS40LTQuMSAyLTUuNFptLTI0LjQgMzEuMlptMCAwWm0tNS4xIDIuN2E3MyA3MyAwIDAgMCA1LjItMi43Yy0xLjUgMS0zLjcgMi01LjIgMi43Wm0zLjQtMi43Wm0tMTAuOSA3LjNjLS4zIDAgLjQtLjQgMi0xLjFsMi4xLS41YTQyLjggNDIuOCAwIDAgMS0xMy41IDQuOGwtMyAxaC0uN2MtLjggMC0uOC0uMS0xLjEtLjMgMi43LS40IDUuMi0xLjMgNy44LTJhNDQ2LjQgNDQ2LjQgMCAwIDAgNi40LTJaTTE3OS42IDE5LjJhNzAuMyA3MC4zIDAgMCAwLTE0LjQgMjMuMyA3Ny4yIDc3LjIgMCAwIDAtNC4yIDE2IDU4IDU4IDAgMCAwIDUuMyAzMy4yYzIuNSA1LjIgNS41IDEwIDkgMTQuNWwxIDEuNCAxLTEgNC41LTUgLjUtLjdjLTIuMy0zLjQtNC41LTctNi41LTExYTQ2IDQ2IDAgMCAxLTYuMi0yMC4yIDU0IDU0IDAgMCAxIDMtMjIuMyA1NC41IDU0LjUgMCAwIDEgMTIuNy0yMS42IDY1LjggNjUuOCAwIDAgMC01LjctNi42Wm0yLjQgMi4xYTc0LjIgNzQuMiAwIDAgMSAzLjQgNC4zbC42LS42YTI5IDI5IDAgMCAwLTQtMy43Wm0xIDgwLjYtMS43IDIuMmMtMSAxLjMtMy4yIDIuNi00LjcgNGw0IDQuOCA1LjcgNi4yYTMyNS4yIDMyNS4yIDAgMCAwIDEwLjUgMTAuOGMzLjggMy45IDcuNyA4LjIgMTEuMyAxMi43YTk0IDk0IDAgMCAxIDkuNSAxMy43IDY4IDY4IDAgMCAxIDUuNiAxMi40bDEuMyAzLjQuNi0uMSAxLjMtLjRoMS4xbC43LjFoMS4zbC4zLjcuNCAxLjh2NC45LS41bC41LTIuM2MuNS03LTEuMS0xMy4zLTQuNS0yMC41LTMuMi02LjYtOC0xNC4yLTE1LjUtMjQgMS4xIDEuNiAxLjUgMi4zIDEuMyAyLjNoLS4ybC01LjQtNS41Yy01LjctNS45LTE0LjctMTQuNy0yMC0yMS43bC0yLjItMy4zLTEuNiAxLjdhNzEuMiA3MS4yIDAgMCAxLTQuNSAzLjVsMi4zLTIuM2gtLjJsMy4zLTQtLjUtLjZabS42LjlhNDkgNDkgMCAwIDEtMy4zIDMuNmMuNCAwIC42LjIgMS44LS44bDEuOC0yLjUtLjMtLjNabTQzIDY4LjdoLS4xYzAgLjItLjIuMy0uMy41IDAgMC0uMSAwIDAgLjRsLjQtLjd2LS4xaC4xWm0tMS41IDIuMi4zLjcuMS0uNC0uMy0uMloiLz4KICA8cGF0aCBmaWxsPSIjRjI2NjM4IiBkPSJtMTgyLjMgMTAwLjktLjUuNy00LjUgNS0xIDEgLjMuNGMxLjUtMS4zIDMuNy0yLjYgNC43LTMuOWwxLjctMi4zLS43LS45Wm0xLTg1LjEtLjMuMi4yLjIuNC43IDIuNCAyLjIgMi4zIDIuM2E1NiA1NiAwIDAgMC01LTUuNlptLS4zLjItMy40IDMuMmE2Ny42IDY3LjYgMCAwIDEgNS43IDYuNmwuMS0uMmE3My43IDczLjcgMCAwIDAtMy40LTQuMyAyNy4xIDI3LjEgMCAwIDEgNCAzLjdsMy0yLjctLjctLjktMi4zLTIuMi0yLjQtMi4yLS40LS43LS4yLS4zWm0uNSA4Ni41LTMuMyA0aC4xbC0yLjIgMi4zYTc1LjIgNzUuMiAwIDAgMCA2LjEtNS4ybC0uMy0uNS0xLjggMi41Yy0xLjIgMS0xLjQuOC0xLjguOGEzNyAzNyAwIDAgMCAzLjMtMy42bC0uMS0uM1ptNDMuMSA2OWguMXYuMWgtLjFsLS40LjhjLS4xLS4zIDAtLjMgMC0uNGwuMy0uNGgtLjFsLTEuMy40LS42LjEuNiAxLjYuMi4xLjIuMi0uMS40LjggMi4yLjIuNC4xLjUuNCAxLjNhNy4yIDcuMiAwIDAgMCAxLjUgMi43Yy4yLjIuNC4yLjYuMi4xIDAgLjIgMCAuMy0uMi40LS40LjYtMS41LjgtMi41di0xbC4xLTMuOGExMC40IDEwLjQgMCAwIDAtLjYtMi40aC0xbC0uNS0uMWgtLjdsLS41LS4xaC0uNFptMCAwWm0tMTcuOS00Mi4yIDIgMi41LTItMi41Wm0xMTYgMTMuOGgtLjIuMlptMzUuNS0zOC4xYTM0IDM0IDAgMCAwLTIuMSA1LjRsLS43IDEuOXYuMmwtMSAyLjVhNjkgNjkgMCAwIDAgMy44LTEwWiIvPgogIDxwYXRoIGZpbGw9IiMwMDAiIGQ9Ik00MTQuMiA4Mi43YTY3LjggNjcuOCAwIDAgMC02LjUgMHYtLjJjMS40LS4yIDEuOS0uNCAxLjktMy40VjY4LjZoLTE0LjR2MTAuNWMwIDMgLjUgMy4yIDEuOSAzLjR2LjJhNjguMiA2OC4yIDAgMCAwLTYuNiAwdi0uMmMxLjQtLjIgMi0uNCAyLTMuNFY1OWMwLTMtLjYtMy4yLTItMy40di0uMmE2NS40IDY1LjQgMCAwIDAgNi42IDB2LjJjLTEuNC4yLTEuOS40LTEuOSAzLjR2OC42aDE0LjRWNTljMC0zLS41LTMuMi0yLTMuNHYtLjJhNjUuNSA2NS41IDAgMCAwIDYuNiAwdi4yYy0xLjQuMi0xLjguNC0xLjggMy40djIwLjJjMCAzIC40IDMuMiAxLjggMy40di4yWm0yNy41IDBhNjguMiA2OC4yIDAgMCAwLTYuNiAwdi0uMmMxLjIgMCAxLjYtLjYgMS42LTEuM2wtLjQtMi0yLjMtN2gtOC4zbC0yLjIgNi4xYy0uNCAxLS43IDEuOS0uNyAyLjYgMCAuOS41IDEuNSAxLjggMS42di4yaC02LjF2LS4yYzItLjQgMi41LS45IDQuMS01LjFsOC41LTIyLjdoLjRsOCAyNWMuNyAyLjQuOCAyLjcgMi4yIDIuOXYuMVpNNDMwLjIgNjBsLTQgMTEgMy41LjFoNEw0MzAuMiA2MFptMjMgMjIuN2E2OC4yIDY4LjIgMCAwIDAtNi41IDB2LS4yYzEuNC0uMiAxLjktLjQgMS45LTMuNFY1OWMwLTMtLjctMy4yLTIuMS0zLjR2LS4yaDcuNGM2LjYgMCA5LjIgMy4zIDkuMiA3LjQgMCAzLjgtMi43IDcuNS03LjYgNy41LTEgMC0yLjItLjItMy0uOGwuMi0uM2E1IDUgMCAwIDAgMi4zLjVjMy40IDAgNS0yLjcgNS02LjIgMC00LjQtMi4yLTcuMi02LTcuMi0uOCAwLTEuOCAwLTIuNi4zdjIyLjZjMCAzIC40IDMuMiAxLjggMy41di4xWm0yMC43IDBhNjguMiA2OC4yIDAgMCAwLTYuNiAwdi0uMmMxLjQtLjIgMS45LS40IDEuOS0zLjRWNTljMC0zLS42LTMuMi0yLTMuNHYtLjJoNy40YzYuNSAwIDkuMSAzLjMgOS4xIDcuNCAwIDMuOC0yLjYgNy41LTcuNiA3LjUtMSAwLTIuMi0uMi0zLS44bC4yLS4zYTUgNSAwIDAgMCAyLjMuNWMzLjQgMCA1LTIuNyA1LTYuMiAwLTQuNC0yLjEtNy4yLTYtNy4yLS44IDAtMS43IDAtMi42LjN2MjIuNmMwIDMgLjUgMy4yIDEuOSAzLjV2LjFabTI3IDBhNjguMiA2OC4yIDAgMCAwLTYuNiAwdi0uMmMxLjQtLjIgMS45LS40IDEuOS0zLjR2LTUuNmwtNy42LTE1LjJjLS45LTEuOC0xLjMtMi41LTIuNy0yLjh2LS4yYTkyLjYgOTIuNiAwIDAgMCA3IDB2LjJjLTEuMS4xLTEuNi41LTEuNiAxLjIgMCAuNS4yIDEgLjcgMmw2LjMgMTIuOSA0LjctOWMyLTQgMi40LTQuNiAyLjQtNS43IDAtLjgtLjQtMS4yLTEuNi0xLjR2LS4yaDUuNnYuMmMtMS43LjQtMS41LjUtNS4yIDcuNUw0OTkgNzN2NmMwIDMgLjUgMy4yIDEuOSAzLjV2LjFabTQ4LjIgMGE2OC4xIDY4LjEgMCAwIDAtNi41IDB2LS4yYzEuNC0uMiAxLjktLjQgMS45LTMuNFY2OC42SDUzMHYxMC41YzAgMyAuNSAzLjIgMS45IDMuNHYuMmE2OC4yIDY4LjIgMCAwIDAtNi42IDB2LS4yYzEuNC0uMiAyLS40IDItMy40VjU5YzAtMy0uNi0zLjItMi0zLjR2LS4yYTY1LjUgNjUuNSAwIDAgMCA2LjYgMHYuMmMtMS40LjItMS45LjQtMS45IDMuNHY4LjZoMTQuNFY1OWMwLTMtLjUtMy4yLTItMy40di0uMmE2NS41IDY1LjUgMCAwIDAgNi42IDB2LjJjLTEuNC4yLTEuOS40LTEuOSAzLjR2MjAuMmMwIDMgLjUgMy4yIDIgMy40di4yWm0yMS40LTQuOWMwIDMuMi0uMyAzLjMtLjMgNWwtNy43LS4xaC03LjZ2LS4xYzEuOC0uMyAyLjItMSAyLjItMy41VjU5YzAtMy0uNi0zLjEtMi4zLTMuNHYtLjJoMTUuM1Y1N2MwIC44IDAgMi4zLS4yIDNoLS4yYzAtMy4zLTEuMi0zLjQtNi43LTMuNC0yLjEgMC0yLjYgMC0zLjEuMlY2OGM2LjkgMCA3LjMtLjEgNy44LTNoLjJ2Ny40aC0uMmMtLjUtMy4yLTEtMy4zLTcuOS0zLjN2MTIuMmMuNS4yIDEuNS4zIDMuMy4zIDUuOCAwIDYuNiAwIDcuMi0zLjhoLjJabTI3IDQuOWE2OC4yIDY4LjIgMCAwIDAtNi43IDB2LS4yYzEuMyAwIDEuNy0uNiAxLjctMS4zIDAtLjUtLjItMS4yLS41LTJsLTIuMi03aC04LjNsLTIuMyA2LjFjLS4zIDEtLjYgMS45LS42IDIuNiAwIC45LjUgMS41IDEuNyAxLjZ2LjJoLTZ2LS4yYzEuOS0uNCAyLjUtLjkgNC4xLTUuMWw4LjUtMjIuN2guNGw4IDI1Yy43IDIuNC44IDIuNyAyLjIgMi45di4xWk01ODYgNjBsLTQgMTEgMy41LjFoNEw1ODYgNjBabTM1LjQgMjIuOGgtMWMtMy45LS4xLTQuMy0uNi04LjctOS0uNS0uOC0xLjMtMi43LTIuMi0zLjRoLTIuNHY4LjdjMCAzIC41IDMuMiAyIDMuNHYuMmE2OC4yIDY4LjIgMCAwIDAtNi42IDB2LS4yYzEuNC0uMiAxLjgtLjQgMS44LTMuNFY1OWMwLTIuNS0uMy0zLjItMS44LTMuNHYtLjJoNy42YzUuNyAwIDguOCAzLjIgOC44IDcuNSAwIDMuMi0yIDYuMi02LjUgNy4zIDEuMi45IDUuNCAxMS4yIDkgMTIuNXYuMlpNNjA5IDY5LjZjNS40IDAgNi44LTIuNyA2LjgtNi4zIDAtNC0yLTcuMS02LTcuMS0uOCAwLTEuNiAwLTIuNy4zdjEzLjFoMS45Wm0yOC41IDEzLjFhNjguMSA2OC4xIDAgMCAwLTYuNiAwdi0uMmMxLjQtLjIgMi0uNCAyLTMuNFY1Ni44Yy02IDAtNy44IDAtOSAyLjRoLS4xYy4zLTEuNS44LTIuNCAxLjMtNC44aC4xYy4yIDEuMiAxIDEuMyA4LjIgMS4zIDguNSAwIDEwIDAgMTEtMWguM2MtLjMuNi0xIDMuMi0xLjIgNGgtLjJ2LS41YzAtMS4yLTEtMS40LTcuNy0xLjR2MjIuM2MwIDMgLjUgMy4yIDEuOSAzLjV2LjFabTExLjUtNi4zdjFjMCAzIDIuOSA0LjcgNS45IDQuNyAyLjYgMCA1LTEuNiA1LTUgMC03LjYtMTEuMi03LjQtMTEuMi0xNS42IDAtNC4xIDMtNi44IDctNi44IDIuMSAwIDMuNS42IDUgLjZoLjZsLS4xIDIuNXYyaC0uMmMtLjUtMi45LTIuNS00LjMtNS4zLTQuMy0yLjMgMC00LjYgMS4zLTQuNiA0LjMgMCA3LjIgMTEuMyA3IDExLjMgMTUuNiAwIDQuNy0zLjUgNy42LTcuOSA3LjYtMi41IDAtMy42LS43LTUuNC0uN2gtLjV2LTFsLS4yLTIuNWMwLS43LjEtMS42LjUtMi40aC4xWm0yNi43LTUuNmE4LjcgOC43IDAgMCAxLTguOC04LjcgOC44IDguOCAwIDEgMSA4LjggOC43Wm0wLTE2LjdhOCA4IDAgMSAwIDAgMTYgOCA4IDAgMSAwIDAtMTZabTQuNiAxMy43aC0uNmMtMS42IDAtMS45LS4zLTMuNy0zLjgtLjItLjMtLjYtMS4xLTEtMS40aC0uN3YzLjZjMCAxLjMuMiAxLjQuOCAxLjVoLTNjLjYtLjEuOC0uMi44LTEuNXYtOC40YzAtMS4xLS4yLTEuNC0uOC0xLjV2LS4xaDMuNGMyLjUgMCAzLjggMS4zIDMuOCAzLjIgMCAxLjMtLjkgMi42LTIuOCAzIC42LjUgMi4zIDQuOCAzLjggNS4zdi4xWk02NzUgNjJjMi4xIDAgMi43LTEuMSAyLjctMi40IDAtMS41LS44LTIuOC0yLjMtMi44bC0xLjEuMVY2MmguOFptLTI2MC42IDU5LjhhMjcgMjcgMCAwIDAtLjMgNCAyMS4yIDIxLjIgMCAwIDEtOS40IDIuNGMtOS42IDAtMTQuNy02LjgtMTQuNy0xMy45IDAtNi45IDQuOC0xNCAxNC4zLTE0IDMuOSAwIDcuMyAxLjEgOS44IDEuOGwtLjEgMy42djEuNGgtLjFjLS40LTQtNC40LTYtOS41LTYtNS45IDAtMTEgNC0xMSAxMy40IDAgOSA2LjMgMTIuOCAxMiAxMi44IDMuNiAwIDcuNi0xLjcgOC44LTUuNWguMlptMjQuOCAxLjItLjEgNHYxbC0xNS0uMmgtNS40di0uMWwxNy40LTI2aC02LjNjLTcgMC05LjEgMC05LjggNGgtLjJsLjItNS4yaDIwdi4zbC0xNy40IDI2aDYuNmM3IDAgOS0uMSA5LjctMy44aC4yWm0yMS42IDBjMCAzLjItLjIgMy4zLS4yIDUtMy41LS4yLTQuMy0uMi03LjgtLjJsLTcuNS4xdi0uMmMxLjgtLjMgMi4xLS44IDIuMS0zLjR2LTIwLjJjMC0zLS42LTMuMS0yLjMtMy40di0uMmgxNS4zdjEuNmMwIC44IDAgMi4zLS4yIDNoLS4xYzAtMy4zLTEuMi0zLjQtNi44LTMuNC0yIDAtMi42IDAtMy4xLjJ2MTEuM2M3IDAgNy4zLS4xIDcuOS0zaC4xdjcuNGgtLjFjLS42LTMuMy0xLTMuMy04LTMuM3YxMi4yYy41LjIgMS41LjIgMy4zLjIgNS45IDAgNi43IDAgNy4yLTMuN2guMlptMjkuMi0xLjJjLS4zIDEuMy0uMyAyLjctLjMgNGEyMS4yIDIxLjIgMCAwIDEtOS40IDIuNGMtOS43IDAtMTQuOC02LjgtMTQuOC0xMy45IDAtNi45IDQuOC0xNCAxNC40LTE0IDMuOCAwIDcuMyAxLjEgOS44IDEuOGwtLjEgMy42djEuNGgtLjJjLS40LTQtNC40LTYtOS40LTYtNiAwLTExIDQtMTEgMTMuNCAwIDkgNi4zIDEyLjggMTEuOSAxMi44IDMuNiAwIDcuNy0xLjcgOC44LTUuNWguMlptMjkgNi4yYTY3LjggNjcuOCAwIDAgMC02LjUgMHYtLjNjMS40LS4yIDItLjQgMi0zLjR2LTEwLjVINTAwdjEwLjVjMCAzIC42IDMuMiAyIDMuNHYuMmE2OC4yIDY4LjIgMCAwIDAtNi42IDB2LS4yYzEuNC0uMiAxLjktLjQgMS45LTMuNHYtMjAuMmMwLTMtLjUtMy4yLTEuOS0zLjR2LS4yYTY1LjQgNjUuNCAwIDAgMCA2LjYgMHYuMmMtMS40LjItMiAuNC0yIDMuNHY4LjVoMTQuNHYtOC41YzAtMy0uNS0zLjItMS45LTMuNHYtLjJhNjUuNSA2NS41IDAgMCAwIDYuNiAwdi4yYy0xLjQuMi0xLjkuNC0xLjkgMy40djIwLjJjMCAzIC41IDMuMiAxLjkgMy40di4yWiIvPgo8L3N2Zz4K';
    const t = Donations.getTranslations(lang);
    return (
    `
    <style>
    #widget-wrapper {
      font-family: "Open Sans", "Segoe UI", Tahoma, sans-serif;
      background: #fcfcfc;
      border-radius: 24px;
      min-width: 540px;
    }
    #body {
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0px 6px 14px 0px rgba(0,0,0,0.2);
    }
    #footer {
      padding: 24px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #footer img {
      width: 184px;
      height: 61px;
    }
    #footer p {
      color: #F26538;
      font-weight: 500;
      font-size: 14px;
    }
    #info {
      margin-bottom: 50px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
    }
    p {
      margin: 0;
      color: #555;
      font-size: 16px;
      line-height: 20px;
    }
    #contributions {
      font-size: 48px;
      font-weight: 700;
      line-height: 60px;
      color: #222;
    }
    #contributors {
      color: #222;
      font-size: 32px;
      line-height: 44px;
      margin-bottom: 5px;
    }
    fieldset {
      border: 0;
      margin: 0;
      padding: 0;
      display: flex;
      gap: 12px;
      margin-bottom: 36px;
    }
    legend {
      font-size: 20px;
      line-height: 28px;
      color: #555;
      margin-bottom: 16px;
    }
    .button {
      background: linear-gradient(#fcfcfc, #fcfcfc) padding-box,
                  linear-gradient(#ddd, #ddd) border-box;
      border-radius: 32em;
      border: 2px solid transparent;
      padding: 12px 24px;
      cursor: pointer;
      font-size: 20px;
      line-height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-grow: 1;
      text-align: center;
      transition: flex-basis 100ms ease-out;
      position: relative;
    }
    .button:has(input:checked) {
      color: #F26538;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(90deg, #F26538 0%, #FBBE5E 100%) border-box;

  }
  .button:has(input:checked)::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSIjRjI2NTM4IiBkPSJNNS45IDguMSA0LjUgOS41IDkgMTQgMTkgNGwtMS40LTEuNEw5IDExLjIgNS45IDguMVpNMTggMTBjMCA0LjQtMy42IDgtOCA4cy04LTMuNi04LTggMy42LTggOC04Yy44IDAgMS41LjEgMi4yLjNMMTMuOC43QzEyLjYuMyAxMS4zIDAgMTAgMCA0LjUgMCAwIDQuNSAwIDEwczQuNSAxMCAxMCAxMCAxMC00LjUgMTAtMTBoLTJaIi8+Cjwvc3ZnPgo=);
  }
  .button input[type="radio"] {
      opacity: 0;
      position: absolute;
      left: 50%;
      transform: translateX(-100%);
  }
  #customFieldToggle {
    width: 100%;
  }
    button {
        cursor: pointer;
    }
    button[type="submit"] {
      background: linear-gradient(90deg, #F26538 0%, #FBBE5E 100%);
      border-radius: 12px;
      padding: 24px;
      color: #1A1A1A;
      font-size: 32px;
      line-height: 44px;
      font-weight: 700;
      border: 0;
      width: 100%;
    }
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type=number] {
        -moz-appearance: textfield;
        border: 0;
        background: transparent;
        font-size: 20px;
        line-height: 28px;
        flex-grow: 1;
        flex-shrink: 1;
    }
    input[type=number]:focus {
      outline: none;
    }
    input[type=number]::placeholder {
      text-align: right; 
    }
    #repetition .button {
      flex-basis: 50%;
    }
    #repetition .button:has(input:checked) {
      flex-basis: 60%;
    }
    #options {
      margin-bottom: 24px;
    }
    #options .button {
      flex-basis: 33%;
    }
    #options .button:has(input:checked) {
      flex-basis: 45%;
    }
    #response {
      margin-top: 32px;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 16px;
    }
    #response.success {
      border-color: #30D053;
    }
    #response.error {
      border-color: #F23838;
      color: #F23838;
    }
    </style>
    <div id="widget-wrapper">
      <div id="body">
        <div id="info">
          <div>  
            ${totalContribution ? `<p id="contributions">${t.infoContributions(totalContribution)}</p>` : ''}
            ${startDate ? `<p id="date">${t.infoStartDate(startDate)}</p>` : ''}
          </div>
          <div>
            ${totalContributors ? `<p id="contributors">${t.infoContributors(totalContributors)}</p><p>${t.labelContributors}</p>` : ''}
          </div>
        </div>
        <form id="contribution">
          ${showRecurrent ?
          `<fieldset id="repetition">
            <label class="button">${t.once}<input type="radio" name="repetition" value="false" ${isRecurrent === false ? 'checked="true"' : ''} /></label>
            <label class="button">${t.recurrent}<input type="radio" name="repetition" value="true" ${isRecurrent === true ? 'checked="true"' : ''} /></label>
          </fieldset>` : ''
          }
          ${contributionOptions.length ?
            `<fieldset id="options">
              <legend>${t.presetOptionsLegend}</legend>
              ${contributionOptions.reduce((prev, curr) => {
                const input = `<label class="button">${t.contributionOption(formatStringNumber(curr))}<input type="radio" name="options" value="${curr}" ${parseInt(curr, 10) === amount ? 'checked="true"' : ''} ${!showCustomAmount ? "required" : ""} /></label>`;
                return prev + input;
              }, '')}
            </fieldset>`
          : ''
        }
        <fieldset id="toggle">
            ${showCustomAmount ?
              `<label class="button">${t.cunstomAmountLabel}
                <input id="amount" name="amount" type="number" min="1" max="1000000" step="1" placeholder="${t.customAmountPlaceholder}" ${showCustomAmount ? "required" : ""} />
              </label>`
              :
              `<button class="button" type="button" id="customFieldToggle">${t.customAmountButton}</button>`
            }
          </fieldset>
          <button type="submit" id="submit">${t.donateButton}</button>
        </form>
        ${isDone ? `<div id="response" class="success">${t.successMessage}</div>` : ''}
        ${isError ? `<div id="response" class="error">${t.errorMessage}</div>` : ''}
      </div>
      <div id="footer">
        <img src="${logo}" />
        <p>happyheartsczech.org</p>
      </div>
    </div>`
  );
  };

  attributeChangedCallback(property: DonationsProps, oldValue: string, newValue: string) {
    if (oldValue === newValue) { return }
    const newState: { [key: string]: any } = {};
    switch(property) {
      case 'contribution-options':
        newState['contributionOptions'] = newValue.split(',');
        newState['showCustomAmount'] = !newState['contributionOptions'].length;
        break;
      case 'start-date':
        newState['startDate'] = new Date(newValue);
        break;
      case 'total-contribution':
        newState['totalContribution'] = formatStringNumber(newValue);
        break;
      case 'lang':
        newState['lang'] = newValue.toLocaleLowerCase();
        break;
      case 'recurrent':
        newState['showRecurrent'] = newValue === 'true';
        break;
      default:
        newState[camelize(property)] = newValue;
    }
    this.state = {
      ...this.state,
      ...newState,
    };
  }

  setisRecurrent(v: string) {
    this.state.isRecurrent = v === 'true';
  }

  setCustomAmount(v: string) {
    this.state.amount = parseInt(v, 10) || 0;
  }

  setCustomAmountFocus() {
    (this.shadow?.querySelector('#amount') as HTMLInputElement)?.focus();
  }

  setCustomAmountToggle(v: boolean) {
    this.state.showCustomAmount = v;
  }

  resetRadios() {
    const selectedRadio = this.shadow?.querySelector('input[name="options"]:checked');
    if (selectedRadio) {
      (selectedRadio as HTMLInputElement).checked = false;
    }
  }

  updateSubmitButtonText() {
    const t = Donations.getTranslations(this.state.lang);
    const submit = this.shadow?.getElementById('submit');
    if (submit) {
      submit.textContent = `${t.donateButton} ${this.state.amount ? t.contributionOption(formatStringNumber(`${this.state.amount}`)) : ''}`;
    }
  }

  async sendDonation() {
    const t = Donations.getTranslations(this.state.lang);
    const response = await fetch("https://wazxcc9io0.execute-api.eu-central-1.amazonaws.com/integration/hh_set_config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parameters: {
          amount: this.state.amount * 100,
          currency: t.currencyCode,
          orderNumber: generateUniqueNum(),
          redirect_url: window.location.href.split('?')[0],
        },
      }),
    });
    const url = await response.text();
    window.location.replace(url);
  }

  render() {
    const params = new URLSearchParams(window.location.search);
    const resultText = params.get('RESULTTEXT');
    if (resultText) {
      if (resultText === 'OK') {
        this.state.isDone = true;
      } else {
        this.state.isError = true;
      }
    }
    if (this.shadow) {
      this.shadow.innerHTML = Donations.getHTML(this.state);
    }
  }

  connectedCallback() {
    this.shadow = this.attachShadow({ mode: 'closed' });
    this.render();

    // monitor input values
    this.shadow.addEventListener('click', (e) => {
      switch ((e.target as HTMLElement).id) {
        case 'customFieldToggle':
          this.setCustomAmountToggle(true);
          this.render();
          this.setCustomAmountFocus();
          this.updateSubmitButtonText();
          break;
      }
    });
    this.shadow.addEventListener('submit', (e) => {
      e.preventDefault();
      switch ((e.target as HTMLElement).id) {
        case 'contribution':
          this.sendDonation();
          break;
      }
    });
    this.shadow.addEventListener('keydown', (e) => {
      switch ((e.target as HTMLElement).id) {
        case 'amount':
          ["e", "E", "+", "-"].includes((e as KeyboardEvent).key) && e.preventDefault();
          break;
      }
    });
    this.shadow.addEventListener('input', (e) => {
      switch ((e.target as HTMLElement).id) {
        case 'amount':
          this.setCustomAmount((e.target as HTMLInputElement).value);
          this.updateSubmitButtonText();
          this.resetRadios();
          break;
      }
    });
    this.shadow.addEventListener('change', (e) => {
      switch ((e.target as HTMLInputElement).name) {
        case 'repetition':
          this.setisRecurrent((e.target as HTMLInputElement).value);
          break;
        case 'options':
          this.setCustomAmount((e.target as HTMLInputElement).value);
          this.setCustomAmountToggle(false);
          this.render();
          this.updateSubmitButtonText();
          break;
      }
    });
  }
}
