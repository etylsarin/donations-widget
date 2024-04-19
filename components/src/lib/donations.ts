import { camelCase } from 'lodash/fp';

export type DonationProps = 'startDate' | 'totalContribution' | 'totalContributors' | 'currenncy' | 'contributionOptions' | 'lang'

export class Donations extends HTMLElement {
  showCustomAmount: boolean;
  isRepetitive: string;
  customAmount: string;
  startDate: string | undefined;
  totalContribution: string | undefined;
  totalContributors: string | undefined;
  contributionOptions: string[];
  currenncy: string;
  override lang: string;

  constructor() {
    super();
    this.isRepetitive = 'false';
    this.customAmount = '0';
    this.showCustomAmount = true;
    this.contributionOptions = [];
    this.currenncy = 'Kč';
    this.lang = 'cz';
  }

  // component attributes
  static get observedAttributes() {
    return ['start-date', 'total-contribution', 'total-contributors', 'currenncy', 'contribution-options', 'lang'];
  }

  static formatStringNumber = (n: string) => n.replace(/(?<!\.\d+)\B(?=(\d{3})+\b)/g, " ").replace(/(?<=\.(\d{3})+)\B/g, " ")

  attributeChangedCallback(property: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) { return }
    switch(property) {
      case 'contribution-options':
        this.contributionOptions = newValue.split(',');
        break;
      default:
        this[camelCase(property) as Exclude<DonationProps, 'contributionOptions'>] = newValue;
    }
  }

  setIsRepetitive(v: string) {
    this.isRepetitive = v;
  }

  setCustomAmount(v: string) {
    this.customAmount = v;
  }

  setCustomAmountToggle(v: boolean) {
    this.showCustomAmount = v;
  }

  connectedCallback() {

    const shadow = this.attachShadow({ mode: 'closed' });

    shadow.innerHTML = `
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
        #toggle label { display: none; }
        #toggle.showInput label { display: inline-block; }
        #toggle.showInput button { display: none; }
      </style>
      <div id="widget-wrapper">
        <div id="info">
          ${this.startDate ? `<p id="date">vybíráme od ${new Date(this.startDate).toLocaleDateString('cz-CS').split('/').join('.')}</p>` : ''}
          ${this.totalContribution ? `<p id="contributions">${Donations.formatStringNumber(this.totalContribution)} ${this.currenncy}</p>` : ''}
          ${this.totalContributors ? `<p id="contributors">přispělo ${this.totalContributors} lidí</p>` : ''}
        </div>
        <form id="contribution">
          <fieldset id="repetition">
            <label>jednorázově<input type="radio" name="repetition" value="false" /></label>
            <label>měsíčně<input type="radio" name="repetition" value="true" /></label>
          </fieldset>
          <fieldset>
            <legend>Přispět v Kč:</legend>
            ${this.contributionOptions.reduce((prev, curr) => {
              const input = `<label>${curr}<input type="radio" name="options" value="${curr}" /></label>`;
              return prev + input;
            }, '')}
          </fieldset>
          <fieldset id="toggle">
            <button type="button" id="customFieldToggle">Jiná částka</button>
            <label>Napište prosím částku, kterou chcete přispět.
              <input id="amount" name="amount" type="text" placeholder="${this.currenncy}" />
            </label>
          </fieldset>
          <button type="submit">Darovat${this.customAmount > '0' ? this.customAmount : ""}</button>
        </form>
      </div>`;

    // monitor input values
    shadow.querySelector('#amount')?.addEventListener('input', (e) => {
      this.setCustomAmount((e.target as HTMLInputElement).value);
      const input = shadow.querySelector('input[type="radio"]:checked') as HTMLInputElement;
      if (input) {
        input.checked = false;
      }
    });
    shadow.querySelectorAll('input[name="repetition"]')?.forEach(item => item.addEventListener('change', (e) => {
      this.setIsRepetitive((e.target as HTMLInputElement).value);
    }));
    shadow.querySelectorAll('input[name="options"]')?.forEach(item => item.addEventListener('change', (e) => {
      this.setCustomAmount((e.target as HTMLInputElement).value);
    }));
    shadow.querySelector('#customFieldToggle')?.addEventListener('click', () => {
      this.setCustomAmountToggle(true);
      shadow.querySelector('#toggle')?.setAttribute('class', 'showInput');
    });
    shadow.querySelector('#contribution')?.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log(this.customAmount, this.isRepetitive);
    });
  }
}
