import { FunctionComponent } from 'preact';
import { WidgetProps } from '../../interface';
import { Currency, Lang, LangWithRegion } from '../../enums';

export const withParsedProps =
  (Component: FunctionComponent<WidgetProps>) =>
  ({ pgUrl, ...props }: Record<string, string>) => {
    const langMap: Record<Lang, LangWithRegion> = {
      [Lang.CS]: Lang.CS_CZ,
      [Lang.CS_CZ]: Lang.CS_CZ,
      [Lang.EN]: Lang.EN_EU,
      [Lang.EN_EU]: Lang.EN_EU,
      [Lang.EN_US]: Lang.EN_US,
    };
    const contributionOptionsDefaults: Record<LangWithRegion, Array<number>> = {
      [Lang.CS_CZ]: [500, 1000, 5000],
      [Lang.EN_US]: [100, 200, 300],
      [Lang.EN_EU]: [100, 200, 300],
    };
    const currentLang = props.lang || window.parent.document.documentElement.lang;
    const lang: LangWithRegion = (currentLang && langMap[currentLang.toLocaleLowerCase() as Lang]) || Lang.EN_EU;
    const newProps = {
      startDate: new Date(props.startDate),
      totalContribution: parseInt(props.totalContribution, 10) || 0,
      totalContributors: parseInt(props.totalContributors, 10) || 0,
      currency: Object.values(Currency).includes(props.currency as Currency)
        ? (props.currency as Currency)
        : Currency.USD,
      contributionOptions: props.contributionOptions
        ? props.contributionOptions.split(',').map((item) => parseInt(item, 10))
        : contributionOptionsDefaults[lang],
      lang,
      recurrent: props.recurrent === 'true',
    };
    return <Component pgUrl={pgUrl} {...newProps} />;
  };
