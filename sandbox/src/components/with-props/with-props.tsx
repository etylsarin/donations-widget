import { FunctionComponent } from 'preact';
import { WidgetProps } from '../../interface';
import { Currency, Lang } from '../../enums';

export const withParsedProps =
  (Component: FunctionComponent<WidgetProps>) =>
  ({ pgUrl, ...props }: Record<string, string>) => {
    const langMap: Record<string, Lang> = {
      'cs-CZ': Lang.CS_CZ,
      'en-US': Lang.EN_US,
    };
    const contributionOptionsDefaults: Record<Lang, Array<number>> = {
      [Lang.CS_CZ]: [500, 1000, 5000],
      [Lang.EN_US]: [100, 200, 300],
    };
    const lang = langMap[props.lang] || Lang.EN_US;
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
