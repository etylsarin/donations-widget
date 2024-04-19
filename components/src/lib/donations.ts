import { camelCase } from 'lodash/fp';

// import content from './donations.css';

export type DonationsProps = 'start-date' | 'total-contribution' | 'total-contributors' | 'currenncy' | 'contribution-options' | 'lang'

export enum Lang {
  CS_CZ = 'cs-CZ',
  EN_US = 'en-US',
}

export interface DonationsState {
  showCustomAmount: boolean;
  isRepetitive?: boolean;
  amount: number;
  startDate?: string;
  totalContribution?: string;
  totalContributors?: string;
  contributionOptions: string[];
  currenncy: string;
  lang: Lang;
}

export class Donations extends HTMLElement {
  state: DonationsState;
  shadow: ShadowRoot | null;

  constructor() {
    super();
    this.state = {
      showCustomAmount: false,
      amount: 0,
      contributionOptions: [],
      currenncy: 'Kč',
      lang: Lang.CS_CZ,
    };
    this.shadow = null;
  }

  // component attributes
  static get observedAttributes() {
    const attributes: DonationsProps[] = ['start-date', 'total-contribution', 'total-contributors', 'currenncy', 'contribution-options', 'lang'];
    return attributes;
  }

  static formatStringNumber = (n: string) => n.replace(/(?<!\.\d+)\B(?=(\d{3})+\b)/g, " ").replace(/(?<=\.(\d{3})+)\B/g, " ");

  static getTranslations = (lang: Lang) => {
    const translations = {
      [Lang.CS_CZ]: {
        infoStartDate: (startDate: string) => `vybíráme od ${startDate}`,
        infoContributors: (totalContributors: string) => `přispělo ${totalContributors} lidí`,
        repetitionOnce: 'jednorázově',
        repetitionMonthly: 'měsíčně',
        presetOptionsLegend: (currenncy: string) => `Přispět v ${currenncy}:`,
        cunstomAmountLabel: 'Napište prosím částku, kterou chcete přispět.',
        customAmountButton: 'Jiná částka',
        donateButton: 'Darovat'
      },
      [Lang.EN_US]: {
        infoStartDate: (startDate: string) => `campaign started on ${startDate}`,
        infoContributors: (totalContributors: string) => `${totalContributors} people donated`,
        repetitionOnce: 'once',
        repetitionMonthly: 'monthly',
        presetOptionsLegend: (currenncy: string) => `Donate in ${currenncy}:`,
        cunstomAmountLabel: 'Fill in how much you want to donate.',
        customAmountButton: 'Other Amount',
        donateButton: 'Donate'
      },
    };
    return translations[lang];
  };

  static getHTML = ({ showCustomAmount, isRepetitive, startDate, totalContribution, currenncy, totalContributors, contributionOptions, amount, lang }: DonationsState) => {
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
    </style>
    <div id="widget-wrapper">
      <div id="info">
        ${startDate ? `<p id="date">${t.infoStartDate(startDate)}</p>` : ''}
        ${totalContribution ? `<p id="contributions">${totalContribution} ${currenncy}</p>` : ''}
        ${totalContributors ? `<p id="contributors">${t.infoContributors(totalContributors)}</p>` : ''}
      </div>
      <form id="contribution">
        <fieldset id="repetition">
          <label>${t.repetitionOnce}<input type="radio" name="repetition" value="false" ${isRepetitive === false ? 'checked="true"' : ''} /></label>
          <label>${t.repetitionMonthly}<input type="radio" name="repetition" value="true" ${isRepetitive === true ? 'checked="true"' : ''} /></label>
        </fieldset>
        <fieldset>
          <legend>${t.presetOptionsLegend(currenncy)}</legend>
          ${contributionOptions.reduce((prev, curr) => {
            const input = `<label>${curr}<input type="radio" name="options" value="${curr}" ${parseInt(curr, 10) === amount ? 'checked="true"' : ''} /></label>`;
            return prev + input;
          }, '')}
        </fieldset>
        <fieldset id="toggle">
          ${showCustomAmount ?
            `<label>${t.cunstomAmountLabel}
              <input id="amount" name="amount" type="text" placeholder="${currenncy}" />
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
        break;
      case 'start-date':
        newState['startDate'] = new Date(newValue).toLocaleDateString();
        break;
      case 'total-contribution':
        newState['totalContribution'] = Donations.formatStringNumber(newValue);
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
    this.state.amount = parseInt(v, 10);
  }

  setCustomAmountToggle(v: boolean) {
    this.state.showCustomAmount = v;
  }

  resetRadios() {
    const selectedRadio = this.shadow?.querySelector('input[type="radio"]:checked');
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
