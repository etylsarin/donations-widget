import { camelCase } from 'lodash/fp';

// import content from './donations.css';

export type DonationsProps = 'start-date' | 'total-contribution' | 'total-contributors' | 'currency' | 'contribution-options' | 'lang'

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
    const attributes: DonationsProps[] = ['start-date', 'total-contribution', 'total-contributors', 'currency', 'contribution-options', 'lang'];
    return attributes;
  }

  static formatStringNumber = (n: string) => n.replace(/(?<!\.\d+)\B(?=(\d{3})+\b)/g, " ").replace(/(?<=\.(\d{3})+)\B/g, " ");

  static getTranslations = (lang = Lang.EN_US) => {
    const translations = {
      [Lang.CS_CZ]: {
        infoStartDate: (startDate: Date) => `vybíráme od ${startDate.toLocaleDateString(lang)}`,
        infoContributions: (totalContribution: string, currency?: string) => `${totalContribution} ${currency || translations[lang].currency}`,
        infoContributors: (totalContributors: string) => `přispělo ${totalContributors} lidí`,
        repetitionOnce: 'jednorázově',
        repetitionMonthly: 'měsíčně',
        presetOptionsLegend: (currency?: string) => `Přispět v ${currency || translations[lang].currency}:`,
        cunstomAmountLabel: 'Napište prosím částku, kterou chcete přispět.',
        customAmountPlaceholder: (currency?: string) => currency || translations[lang].currency,
        customAmountButton: 'Jiná částka',
        donateButton: 'Darovat',
        currency: 'Kč',
      },
      [Lang.EN_US]: {
        infoStartDate: (startDate: Date) => `campaign started on ${startDate.toLocaleDateString(lang)}`,
        infoContributions: (totalContribution: string, currency?: string) => `${currency || translations[lang].currency} ${totalContribution}`,
        infoContributors: (totalContributors: string) => `${totalContributors} people donated`,
        repetitionOnce: 'once',
        repetitionMonthly: 'monthly',
        presetOptionsLegend: (currency?: string) => `Donate in ${currency || translations[lang].currency}:`,
        cunstomAmountLabel: 'Fill in how much you want to donate.',
        customAmountPlaceholder: (currency?: string) => currency || translations[lang].currency,
        customAmountButton: 'Other Amount',
        donateButton: 'Donate',
        currency: '$',
      },
    };
    return translations[lang];
  };

  static getHTML = ({ showCustomAmount, isRepetitive, startDate, totalContribution, currency, totalContributors, contributionOptions, amount, lang }: DonationsState) => {
    const t = Donations.getTranslations(lang);
    return (
    `
    <style>
      #widget-wrapper { font-family: "Gill Sans", sans-serif; }
      input { width: 4em; }
      fieldset { border: 0; }
      label:has(input[type="radio"]) { display: inline-block; padding: 5px 10px; margin: 4px; border: 1px solid grey; cursor: pointer; }
      label:has(input:checked) { border-color: orange; }
      label input[type="radio"] { display: none; }
      button { cursor: pointer; }
      button[type="submit"] { font-size: 20px; width: 100%; padding: 10px; background: orange; border: 1px solid grey; font-weight: 600; }
      #contributions { font-size: 40px; font-weight: 600; margin: 0; }
      #info { background: #eee; padding: 10px 20px; margin-bottom: 20px;}
      input[type=number]::-webkit-outer-spin-button,
      input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      input[type=number] { -moz-appearance: textfield; }
    </style>
    <div id="widget-wrapper">
      <div id="info">
        ${startDate ? `<p id="date">${t.infoStartDate(startDate)}</p>` : ''}
        ${totalContribution ? `<p id="contributions">${t.infoContributions(totalContribution, currency)}</p>` : ''}
        ${totalContributors ? `<p id="contributors">${t.infoContributors(totalContributors)}</p>` : ''}
      </div>
      <form id="contribution">
        <fieldset id="repetition">
          <label>${t.repetitionOnce}<input type="radio" name="repetition" value="false" ${isRepetitive === false ? 'checked="true"' : ''} /></label>
          <label>${t.repetitionMonthly}<input type="radio" name="repetition" value="true" ${isRepetitive === true ? 'checked="true"' : ''} /></label>
        </fieldset>
        ${contributionOptions.length ?
          `<fieldset>
            <legend>${t.presetOptionsLegend(currency)}</legend>
            ${contributionOptions.reduce((prev, curr) => {
              const input = `<label>${curr}<input type="radio" name="options" value="${curr}" ${parseInt(curr, 10) === amount ? 'checked="true"' : ''} /></label>`;
              return prev + input;
            }, '')}
          </fieldset>`
        : ''
      }
      <fieldset id="toggle">
          ${showCustomAmount ?
            `<label>${t.cunstomAmountLabel}
              <input id="amount" name="amount" type="number" min="1" placeholder="${t.customAmountPlaceholder(currency)}" />
            </label>`
            :
            `<button type="button" id="customFieldToggle">${t.customAmountButton}</button>`
          }
        </fieldset>
        <button type="submit">${t.donateButton}</button>
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
        newState['totalContribution'] = Donations.formatStringNumber(newValue);
        break;
      case 'lang':
        newState['lang'] = newValue.toLocaleLowerCase();
        break;
      default:
        newState[camelCase(property)] = newValue;
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

  setCustomAmountToggle(v: boolean) {
    this.state.showCustomAmount = v;
  }

  resetRadios() {
    const selectedRadio = this.shadow?.querySelector('input[name="options"]:checked');
    if (selectedRadio) {
      (selectedRadio as HTMLInputElement).checked = false;
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
          break;
      }
    });
  }
}
