import { Status } from '../../enums';
import styles from './submit.module.css';

export interface SubmitProps {
  label?: string;
  status?: Status;
}

export const Submit = ({ label, status }: SubmitProps) => {
  return (
    <button
      type="submit"
      className={styles.submit}
      disabled={status === Status.BUSY}
    >
      {status === Status.BUSY ? (
        <span className={styles.loader} />
      ) : label}
    </button>
  );
};
