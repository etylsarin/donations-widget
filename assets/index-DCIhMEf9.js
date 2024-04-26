(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))e(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&e(a)}).observe(document,{childList:!0,subtree:!0});function i(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function e(o){if(o.ep)return;o.ep=!0;const n=i(o);fetch(o.href,n)}})();const f=u=>u.replace(/-./g,t=>t[1].toUpperCase()),d=u=>u.replace(new RegExp("(?<!\\.\\d+)\\B(?=(\\d{3})+\\b)","g")," ").replace(new RegExp("(?<=\\.(\\d{3})+)\\B","g")," "),x=["start-date","total-contribution","total-contributors","currency","contribution-options","lang"],r=class r extends HTMLElement{constructor(){super(),this.state={amount:0,contributionOptions:[],showCustomAmount:!0},this.shadow=null}static get observedAttributes(){return x}attributeChangedCallback(t,i,e){if(i===e)return;const o={};switch(t){case"contribution-options":o.contributionOptions=e.split(","),o.showCustomAmount=!o.contributionOptions.length;break;case"start-date":o.startDate=new Date(e);break;case"total-contribution":o.totalContribution=d(e);break;case"lang":o.lang=e.toLocaleLowerCase();break;default:o[f(t)]=e}this.state={...this.state,...o}}setIsRepetitive(t){this.state.isRepetitive=t==="true"}setCustomAmount(t){this.state.amount=parseInt(t,10)||0}setCustomAmountFocus(){var t,i;(i=(t=this.shadow)==null?void 0:t.querySelector("#amount"))==null||i.focus()}setCustomAmountToggle(t){this.state.showCustomAmount=t}resetRadios(){var i;const t=(i=this.shadow)==null?void 0:i.querySelector('input[name="options"]:checked');t&&(t.checked=!1)}updateSubmitButtonText(){var e;const t=r.getTranslations(this.state.lang),i=(e=this.shadow)==null?void 0:e.getElementById("submit");i&&(i.textContent=`${t.donateButton} ${this.state.amount?t.contributionOption(d(`${this.state.amount}`),this.state.currency):""}`)}render(){this.shadow&&(this.shadow.innerHTML=r.getHTML(this.state))}connectedCallback(){this.shadow=this.attachShadow({mode:"closed"}),this.render(),this.shadow.addEventListener("click",t=>{switch(t.target.id){case"customFieldToggle":this.setCustomAmountToggle(!0),this.render(),this.setCustomAmountFocus(),this.updateSubmitButtonText();break}}),this.shadow.addEventListener("submit",t=>{switch(t.preventDefault(),t.target.id){case"contribution":console.log(this.state.amount,this.state.isRepetitive);break}}),this.shadow.addEventListener("input",t=>{switch(t.target.id){case"amount":this.setCustomAmount(t.target.value),this.updateSubmitButtonText(),this.resetRadios();break}}),this.shadow.addEventListener("change",t=>{switch(t.target.name){case"repetition":this.setIsRepetitive(t.target.value);break;case"options":this.setCustomAmount(t.target.value),this.setCustomAmountToggle(!1),this.render(),this.updateSubmitButtonText();break}})}};r.getTranslations=(t="en-us")=>{const i={"cs-cz":{infoStartDate:e=>`vybíráme od ${e.toLocaleDateString(t)}`,infoContributions:(e,o)=>`${e} ${o||i[t].currency}`,infoContributors:e=>`${e} lidí`,labelContributors:"přispělo",repetitionOnce:"jednorázově",repetitionMonthly:"měsíčně",presetOptionsLegend:"Přispět",cunstomAmountLabel:"Kolik chcete přispět?",contributionOption:(e,o)=>`${e} ${o||i[t].currency}`,customAmountPlaceholder:e=>e||i[t].currency,customAmountButton:"Jiná částka",donateButton:"Darovat",currency:"Kč"},"en-us":{infoStartDate:e=>`campaign started on ${e.toLocaleDateString(t)}`,infoContributions:(e,o)=>`${o||i[t].currency} ${e}`,infoContributors:e=>`${e} people`,labelContributors:"donated",repetitionOnce:"once",repetitionMonthly:"monthly",presetOptionsLegend:"Donate",cunstomAmountLabel:"How much to donate?",contributionOption:(e,o)=>`${o||i[t].currency}${e}`,customAmountPlaceholder:e=>e||i[t].currency,customAmountButton:"Other Amount",donateButton:"Donate",currency:"$"}};return i[t]},r.getHTML=({showCustomAmount:t,isRepetitive:i,startDate:e,totalContribution:o,currency:n,totalContributors:a,contributionOptions:p,amount:b,lang:g})=>{const s=r.getTranslations(g);return`
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
      margin-bottom: 20px;
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
          ${o?`<p id="contributions">${s.infoContributions(o,n)}</p>`:""}
          ${e?`<p id="date">${s.infoStartDate(e)}</p>`:""}
        </div>
        <div>
          ${a?`<p id="contributors">${s.infoContributors(a)}</p><p>${s.labelContributors}</p>`:""}
        </div>
      </div>
      <form id="contribution">
        <fieldset id="repetition">
          <label class="button">${s.repetitionOnce}<input type="radio" name="repetition" value="false" ${i===!1?'checked="true"':""} /></label>
          <label class="button">${s.repetitionMonthly}<input type="radio" name="repetition" value="true" ${i===!0?'checked="true"':""} /></label>
        </fieldset>
        ${p.length?`<fieldset id="options">
            <legend>${s.presetOptionsLegend}</legend>
            ${p.reduce((h,c)=>{const m=`<label class="button">${s.contributionOption(d(c))}<input type="radio" name="options" value="${c}" ${parseInt(c,10)===b?'checked="true"':""} /></label>`;return h+m},"")}
          </fieldset>`:""}
      <fieldset id="toggle">
          ${t?`<label class="button">${s.cunstomAmountLabel}
              <input id="amount" name="amount" type="number" min="1" placeholder="${s.customAmountPlaceholder(n)}" />
            </label>`:`<button class="button" type="button" id="customFieldToggle">${s.customAmountButton}</button>`}
        </fieldset>
        <button type="submit" id="submit">${s.donateButton}</button>
      </form>
    </div>`};let l=r;customElements.define("donations-widget",l);
