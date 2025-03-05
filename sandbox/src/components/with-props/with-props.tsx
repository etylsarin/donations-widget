import { FunctionComponent } from 'preact';
import { WidgetProps } from '../../interface';
import { Currency, Lang } from '../../enums';

export const withParsedProps =
  (Component: FunctionComponent<WidgetProps>) => (props: Record<string, string>) => {
    const langMap: Record<string, Lang> = {
      'cs-CZ': Lang.CS_CZ,
      'en-US': Lang.EN_US,
    };
    const newProps = {
      startDate: new Date(props.startDate),
      totalContribution: parseInt(props.totalContribution, 10) || 0,
      totalContributors: parseInt(props.totalContributors, 10) || 0,
      currency: Object.values(Currency).includes(props.currency as Currency) ? props.currency as Currency : Currency.USD,
      contributionOptions: props.contributionOptions.split(',').map(item => parseInt(item, 10)),
      lang: langMap[props.lang] || Lang.EN_US,
      recurrent: props.recurrent === 'true',
    }
    return <Component {...newProps} /> ;
  };
