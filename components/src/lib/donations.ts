// import css from './donations.css?raw';

import { camelize, formatStringNumber } from "./utils";

export const attributes = ['start-date', 'total-contribution', 'total-contributors', 'currency', 'contribution-options', 'lang'];

export type DonationsProps = (typeof attributes)[number];

export enum Lang {
  CS_CZ = 'cs-cz',
  EN_US = 'en-us',
}

export interface DonationsState {
  showCustomAmount?: boolean;
  isRepetitive?: boolean;
  amount: number;
  startDate?: Date;
  totalContribution?: string;
  totalContributors?: string;
  contributionOptions: string[];
  currency?: string;
  lang?: Lang;
}

export class Donations extends HTMLElement {
  state: DonationsState;
  shadow: ShadowRoot | null;

  constructor() {
    super();
    this.state = {
      amount: 0,
      contributionOptions: [],
      showCustomAmount: true,
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
        infoContributions: (totalContribution: string, currency?: string) => `${totalContribution} ${currency || translations[lang].currency}`,
        infoContributors: (totalContributors: string) => `${totalContributors} lidí`,
        labelContributors: 'přispělo',
        repetitionOnce: 'jednorázově',
        repetitionMonthly: 'měsíčně',
        presetOptionsLegend: 'Přispět',
        cunstomAmountLabel: 'Kolik chcete přispět?',
        contributionOption: (amount: string, currency?: string) => `${amount} ${currency || translations[lang].currency}`,
        customAmountPlaceholder: (currency?: string) => currency || translations[lang].currency,
        customAmountButton: 'Jiná částka',
        donateButton: 'Darovat',
        currency: 'Kč',
      },
      [Lang.EN_US]: {
        infoStartDate: (startDate: Date) => `campaign started on ${startDate.toLocaleDateString(lang)}`,
        infoContributions: (totalContribution: string, currency?: string) => `${currency || translations[lang].currency} ${totalContribution}`,
        infoContributors: (totalContributors: string) => `${totalContributors} people`,
        labelContributors: 'donated',
        repetitionOnce: 'once',
        repetitionMonthly: 'monthly',
        presetOptionsLegend: 'Donate',
        cunstomAmountLabel: 'How much to donate?',
        contributionOption: (amount: string, currency?: string) => `${currency || translations[lang].currency}${amount}`,
        customAmountPlaceholder: (currency?: string) => currency || translations[lang].currency,
        customAmountButton: 'Other Amount',
        donateButton: 'Donate',
        currency: '$',
      },
    };
    return translations[lang];
  };

  static getHTML = ({
    showCustomAmount,
    isRepetitive,
    startDate,
    totalContribution,
    currency,
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
      padding: 32px;
      box-shadow: 0px 6px 14px 0px rgba(0,0,0,0.2);
      min-width: 500px;
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
  display: inline-block;
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
      display: none;
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
    </style>
    <div id="widget-wrapper">
      <div id="info">
        <div>  
          ${totalContribution ? `<p id="contributions">${t.infoContributions(totalContribution, currency)}</p>` : ''}
          ${startDate ? `<p id="date">${t.infoStartDate(startDate)}</p>` : ''}
        </div>
        <div>
          ${totalContributors ? `<p id="contributors">${t.infoContributors(totalContributors)}</p><p>${t.labelContributors}</p>` : ''}
        </div>
      </div>
      <form id="contribution">
        <fieldset id="repetition">
          <label class="button">${t.repetitionOnce}<input type="radio" name="repetition" value="false" ${isRepetitive === false ? 'checked="true"' : ''} /></label>
          <label class="button">${t.repetitionMonthly}<input type="radio" name="repetition" value="true" ${isRepetitive === true ? 'checked="true"' : ''} /></label>
        </fieldset>
        ${contributionOptions.length ?
          `<fieldset id="options">
            <legend>${t.presetOptionsLegend}</legend>
            ${contributionOptions.reduce((prev, curr) => {
              const input = `<label class="button">${t.contributionOption(formatStringNumber(curr))}<input type="radio" name="options" value="${curr}" ${parseInt(curr, 10) === amount ? 'checked="true"' : ''} /></label>`;
              return prev + input;
            }, '')}
          </fieldset>`
        : ''
      }
      <fieldset id="toggle">
          ${showCustomAmount ?
            `<label class="button">${t.cunstomAmountLabel}
              <input id="amount" name="amount" type="number" min="1" placeholder="${t.customAmountPlaceholder(currency)}" />
            </label>`
            :
            `<button class="button" type="button" id="customFieldToggle">${t.customAmountButton}</button>`
          }
        </fieldset>
        <button type="submit" id="submit">${t.donateButton}</button>
      </form>
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
      default:
        newState[camelize(property)] = newValue;
    }
    this.state = {
      ...this.state,
      ...newState,
    };
  }

  setIsRepetitive(v: string) {
    this.state.isRepetitive = v === 'true';
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
      submit.textContent = `${t.donateButton} ${this.state.amount ? t.contributionOption(formatStringNumber(`${this.state.amount}`), this.state.currency) : ''}`;
    }
  }

  render() {
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
          console.log(this.state.amount, this.state.isRepetitive);
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
          this.setIsRepetitive((e.target as HTMLInputElement).value);
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
