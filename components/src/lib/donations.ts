// import css from './donations.css?raw';

import { camelize, formatStringNumber, generateUniqueNum } from "./utils";
import { logo } from './logo';

export const attributes = ['start-date', 'total-contribution', 'total-contributors', 'currency', 'contribution-options', 'lang', 'recurrent'];

export type DonationsProps = (typeof attributes)[number];

export enum Lang {
  CS_CZ = 'cs-cz',
  EN_US = 'en-us',
}

export enum CurrencySymbol {
  CZK = 'Kč',
  USD = '$',
  EUR = '€',
}

export enum CurrencyCode {
  CZK = '203',
  USD = '840',
  EUR = '978',
}

export interface DonationsState {
  showRecurrent?: boolean;
  showCustomAmount?: boolean;
  isRecurrent?: boolean;
  isDone?: boolean;
  isError?: boolean;
  isBusy?: boolean;
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
      isBusy: false,
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
    isBusy,
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
      display: flex;
      justify-content: center;
      align-items: center;
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
      font-size: 20px;
    }
    #response.success {
      border-color: #30D053;
    }
    #response.error {
      border-color: #F23838;
      color: #F23838;
    }
    .loader {
      width: 44px;
      height: 44px;
      border: 5px solid #fff;
      border-bottom-color: transparent;
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }
    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
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
            <label class="button">${t.once}<input type="radio" checked name="repetition" value="false" ${isRecurrent === false ? 'checked="true"' : ''} /></label>
            <label class="button">${t.recurrent}<input type="radio" name="repetition" value="true" ${isRecurrent === true ? 'checked="true"' : ''} /></label>
          </fieldset>` : ''
          }
          ${contributionOptions.length ?
            `<fieldset id="options">
              <legend>${t.presetOptionsLegend}</legend>
              ${contributionOptions.reduce((prev, curr) => {
                const input = `<label class="button">${t.contributionOption(formatStringNumber(curr))}<input type="radio" name="options" value="${curr}" ${parseInt(curr, 10) === amount ? 'checked' : ''} ${!showCustomAmount ? "required" : ""} /></label>`;
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
          <button type="submit" id="submit" ${isBusy ? 'disabled' : ''}>${isBusy ? '<span class="loader"></span>' : `${t.donateButton}  ${amount ? t.contributionOption(formatStringNumber(`${amount}`)) : ''}`}</button>
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
      amount: this.state.amount || parseInt(newState['contributionOptions']?.[0] || 0, 10),
    };
  }

  setisRecurrent(v: string) {
    this.state.isRecurrent = v === 'true';
  }

  setIsBusy() {
    this.state.isBusy = true;
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
          this.setIsBusy();
          this.render();
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
