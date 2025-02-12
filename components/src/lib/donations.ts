// import css from './donations.css?raw';

import { camelize, formatStringNumber, generateUniqueNum } from "./utils";
import { hh_logo, checkmark, cross, ma_logo, visa_logo, ae_logo, apay_logo, gpay_logo } from './images';

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
        contributionOption: (amount: string) => `${amount}&nbsp;${translations[lang].currencySymbol}`,
        customAmountPlaceholder: CurrencySymbol.CZK,
        customAmountButton: 'Jiná částka',
        donateButton: 'Darovat',
        currencySymbol: CurrencySymbol.CZK,
        currencyCode: CurrencyCode.CZK,
        successMessage: 'Děkujeme za váš příspěvek pro HappyHearts Czech Republic! Vaši platbu jsme přijali v pořádku.',
        errorMessage: 'Nepodařilo se dokončit platbu. Zkuste to znovu.',
        newsletterOptIn: 'Přihlaste se k odběru novinek',
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
        newsletterOptIn: 'Opt in to receive marketing news',
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
      position: relative;
    }
    #footer {
      padding: 24px 32px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
    }
    #footer .logo {
      width: 184px;
      height: 61px;
    }
    #footer .url {
      color: #F26538;
      font-weight: 500;
      font-size: 14px;
    }
    #footer .author {
      text-align: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      gap: 10px;
    }
    #footer .author img {
      height: 30px;
    }
    #footer .logo ~ .author {
      width: 100%;
    }
    #info {
      margin-bottom: 50px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
    }
    #info .logo {
      width: 50%;
      margin: 0 auto;
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
      margin-bottom: 24px;
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
    background-image: url(${checkmark});
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
    #options .button {
      flex-basis: 33%;
    }
    #options .button:has(input:checked) {
      flex-basis: 45%;
    }
    #response {
      position: absolute;
      left: 0;
      top: 0;
      width: calc(100% - 32px);
      height: calc(100% - 32px);
      background-color: rgba(255,255,255,0.7);
      padding: 16px;
      font-size: 20px;
      box-sizing: content-box;
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
      justify-content: center;
      text-align: center;
      border-radius: 12px;
    }
    #response::before, #response::after {
      content: '';
      display: inline-block;
      width: 64px;
      height: 64px;
    }
    #response.success {
      color: #30D053;
    }
    #response.success::before {
      background: #30D053;
      mask: url(${checkmark});
    }
    #response.error {
      color: #F23838;
    }
    #response.error::before {
      background: #F23838;
      mask: url(${cross});
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
    .logos {
      margin-top: 32px;
      text-align: center;
    }
    .logos img {
      height: 24px;
    }
    .opt-in {
      display: inline-block;
      margin-top: 24px;
      font-size: 16px;
      position: relative;
      display: flex;
      align-items: center;
    }
    .opt-in input {
      cursor: pointer;
      opacity: 0;
      position: absolute;
      left: 0;
    }
    .opt-in::before {
      content: '';
      color: #fff;
      display: inline-block;
      margin-right: 10px;
      border: 1px solid orange;
      width: 22px;
      height: 22px;
      text-align: center;
      border-radius: 2px;
    }
    .opt-in:has(input:checked)::before {
      content: '✔';
      background-color: #F26538;
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
          ${totalContribution ? `
          <div>
            ${totalContribution ? `<p id="contributions">${t.infoContributions(totalContribution)}</p>` : ''}
            ${startDate ? `<p id="date">${t.infoStartDate(startDate)}</p>` : ''}
          </div>
          <div>
            ${totalContributors ? `<p id="contributors">${t.infoContributors(totalContributors)}</p><p>${t.labelContributors}</p>` : ''}
          </div>
          ` : `<img class="logo" src="${hh_logo}" alt="Happy Hearts" />`}
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
        <div class="logos">
          <img src="${ma_logo}" alt="Mastercard" />
          <img src="${visa_logo}" alt="Visa" />
          <img src="${ae_logo}" alt="American Express" />
          <img src="${apay_logo}" alt="Apple Pay" />
          <img src="${gpay_logo}" alt="Google Pay" />
        </div>
        <label class="opt-in"><input type="checkbox" name="marketing" value="opt-in" /> ${t.newsletterOptIn}</label>
      </div>
      <div id="footer">
        ${totalContribution ? 
        `<img class="logo" src="${hh_logo}" alt="Happy Hearts" />`
        : ''}
        <p class="url">happyheartsczech.org</p>
        <p class="author">Brought to you by <img src="${ma_logo}" alt="Mastercard" /></p>
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
    window.parent.location.replace(url);
  }

  render() {
    const params = new URLSearchParams(window.parent.location.search);
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
