import { Currency, ResolvedLang } from './enums';

export interface WidgetProps {
  pgUrl: string;
  startDate?: Date;
  totalContribution?: number;
  totalContributors?: number;
  currency?: Currency;
  contributionOptions?: number[];
  lang?: ResolvedLang;
  recurrent?: boolean;
}
