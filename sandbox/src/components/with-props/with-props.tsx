import { FunctionComponent } from 'preact';
import { WidgetProps } from '../../interface';
import { Currency, Lang, ResolvedLang } from '../../enums';

export const withParsedProps =
  (Component: FunctionComponent<WidgetProps>) =>
  ({ pgUrl, ...props }: Record<string, string>) => {
    // Bare language tags are accepted as well as full ones, because the fallback below
    // reads the host page's <html lang>, which is very often just "cs" or "en".
    const langMap: Record<string, ResolvedLang> = {
      [Lang.CS]: Lang.CS_CZ,
      [Lang.CS_CZ]: Lang.CS_CZ,
      [Lang.EN]: Lang.EN_EU,
      [Lang.EN_EU]: Lang.EN_EU,
      [Lang.EN_US]: Lang.EN_US,
    };
    const contributionOptionsDefaults: Record<ResolvedLang, Array<number>> = {
      [Lang.CS_CZ]: [500, 1000, 5000],
      [Lang.EN_US]: [50, 100, 200],
      [Lang.EN_EU]: [50, 100, 200],
    };
    const requestedLang = props.lang || window.parent.document.documentElement.lang;
    const lang =
      (requestedLang && langMap[requestedLang.toLocaleLowerCase()]) || Lang.EN_EU;
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
