(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))e(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&e(r)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function e(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();const f=u=>u.replace(/-./g,t=>t[1].toUpperCase()),g=u=>u.replace(new RegExp("(?<!\\.\\d+)\\B(?=(\\d{3})+\\b)","g")," ").replace(new RegExp("(?<=\\.(\\d{3})+)\\B","g")," "),y=["start-date","total-contribution","total-contributors","currency","contribution-options","lang"],a=class a extends HTMLElement{constructor(){super(),this.state={amount:0,contributionOptions:[],showCustomAmount:!0},this.shadow=null}static get observedAttributes(){return y}attributeChangedCallback(t,n,e){if(n===e)return;const o={};switch(t){case"contribution-options":o.contributionOptions=e.split(","),o.showCustomAmount=!o.contributionOptions.length;break;case"start-date":o.startDate=new Date(e);break;case"total-contribution":o.totalContribution=g(e);break;case"lang":o.lang=e.toLocaleLowerCase();break;default:o[f(t)]=e}this.state={...this.state,...o}}setIsRepetitive(t){this.state.isRepetitive=t==="true"}setCustomAmount(t){this.state.amount=parseInt(t,10)||0}setCustomAmountToggle(t){this.state.showCustomAmount=t}resetRadios(){var n;const t=(n=this.shadow)==null?void 0:n.querySelector('input[name="options"]:checked');t&&(t.checked=!1)}render(){this.shadow&&(this.shadow.innerHTML=a.getHTML(this.state))}connectedCallback(){this.shadow=this.attachShadow({mode:"closed"}),this.render(),this.shadow.addEventListener("click",t=>{switch(t.target.id){case"customFieldToggle":this.setCustomAmountToggle(!0),this.render();break}}),this.shadow.addEventListener("submit",t=>{switch(t.preventDefault(),t.target.id){case"contribution":console.log(this.state.amount,this.state.isRepetitive);break}}),this.shadow.addEventListener("input",t=>{switch(t.target.id){case"amount":this.setCustomAmount(t.target.value),this.resetRadios();break}}),this.shadow.addEventListener("change",t=>{switch(t.target.name){case"repetition":this.setIsRepetitive(t.target.value);break;case"options":this.setCustomAmount(t.target.value),this.setCustomAmountToggle(!1),this.render();break}})}};a.getTranslations=(t="en-us")=>{const n={"cs-cz":{infoStartDate:e=>`vybíráme od ${e.toLocaleDateString(t)}`,infoContributions:(e,o)=>`${e} ${o||n[t].currency}`,infoContributors:e=>`přispělo ${e} lidí`,repetitionOnce:"jednorázově",repetitionMonthly:"měsíčně",presetOptionsLegend:e=>`Přispět v ${e||n[t].currency}:`,cunstomAmountLabel:"Napište prosím částku, kterou chcete přispět.",customAmountPlaceholder:e=>e||n[t].currency,customAmountButton:"Jiná částka",donateButton:"Darovat",currency:"Kč"},"en-us":{infoStartDate:e=>`campaign started on ${e.toLocaleDateString(t)}`,infoContributions:(e,o)=>`${o||n[t].currency} ${e}`,infoContributors:e=>`${e} people donated`,repetitionOnce:"once",repetitionMonthly:"monthly",presetOptionsLegend:e=>`Donate in ${e||n[t].currency}:`,cunstomAmountLabel:"Fill in how much you want to donate.",customAmountPlaceholder:e=>e||n[t].currency,customAmountButton:"Other Amount",donateButton:"Donate",currency:"$"}};return n[t]},a.getHTML=({showCustomAmount:t,isRepetitive:n,startDate:e,totalContribution:o,currency:i,totalContributors:r,contributionOptions:l,amount:p,lang:m})=>{const s=a.getTranslations(m);return`
    <style>
    #widget-wrapper {
      font-family: "Gill Sans", sans-serif;
    }
    input {
        width: 4em;
    }
    fieldset {
        border: 0;
    }
    label:has(input[type="radio"]) {
        display: inline-block;
        padding: 5px 10px;
        margin: 4px;
        border: 1px solid grey;
        cursor: pointer;
    }
    label:has(input:checked) {
        border-color: orange;
    }
    label input[type="radio"] {
        display: none;
    }
    button {
        cursor: pointer;
    }
    button[type="submit"] {
        font-size: 20px;
        width: 100%;
        padding: 10px;
        background: orange;
        border: 1px solid grey;
        font-weight: 600;
    }
    #contributions {
        font-size: 40px;
        font-weight: 600;
        margin: 0;
    }
    #info {
        background: #eee;
        padding: 10px 20px;
        margin-bottom: 20px;
    }
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type=number] {
        -moz-appearance: textfield;
    }  
    </style>
    <div id="widget-wrapper">
      <div id="info">
        ${e?`<p id="date">${s.infoStartDate(e)}</p>`:""}
        ${o?`<p id="contributions">${s.infoContributions(o,i)}</p>`:""}
        ${r?`<p id="contributors">${s.infoContributors(r)}</p>`:""}
      </div>
      <form id="contribution">
        <fieldset id="repetition">
          <label>${s.repetitionOnce}<input type="radio" name="repetition" value="false" ${n===!1?'checked="true"':""} /></label>
          <label>${s.repetitionMonthly}<input type="radio" name="repetition" value="true" ${n===!0?'checked="true"':""} /></label>
        </fieldset>
        ${l.length?`<fieldset>
            <legend>${s.presetOptionsLegend(i)}</legend>
            ${l.reduce((h,c)=>{const b=`<label>${c}<input type="radio" name="options" value="${c}" ${parseInt(c,10)===p?'checked="true"':""} /></label>`;return h+b},"")}
          </fieldset>`:""}
      <fieldset id="toggle">
          ${t?`<label>${s.cunstomAmountLabel}
              <input id="amount" name="amount" type="number" min="1" placeholder="${s.customAmountPlaceholder(i)}" />
            </label>`:`<button type="button" id="customFieldToggle">${s.customAmountButton}</button>`}
        </fieldset>
        <button type="submit">${s.donateButton}</button>
      </form>
    </div>`};let d=a;customElements.define("donations-widget",d);
