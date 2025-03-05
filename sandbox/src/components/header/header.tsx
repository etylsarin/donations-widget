import { useContext } from 'preact/hooks';
import { WidgetProps } from '../../interface';
import { Logo } from '../logo/logo';
import styles from './header.module.css';
import { Translations } from '../../context';

export type HeaderProps = Pick<
  WidgetProps,
  'totalContribution' | 'startDate' | 'totalContributors' | 'lang'
>;

export const Header = ({
  totalContribution,
  startDate,
  totalContributors,
}: HeaderProps) => {
  const t = useContext(Translations);
  return (
    <div className={styles.header}>
      {totalContribution ? (
        <>
          <div>
            {totalContribution ? (
              <p className={styles.contributions}>{t('infoContributions', totalContribution.toString())}</p>
            ) : (
              ''
            )}
            {startDate ? <p className={styles.date}>{t('infoStartDate', startDate)}</p> : ''}
          </div>
          <div>
            {totalContributors ? (
              <>
                <p className={styles.contributors}>{t('infoContributors', totalContributors.toString())}</p>
                <p>{t('labelContributors')}</p>
              </>
            ) : (
              ''
            )}
          </div>
        </>
      ) : (
        <Logo />
      )}
    </div>
  );
};
