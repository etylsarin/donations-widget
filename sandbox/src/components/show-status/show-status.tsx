import { Status } from "../../enums";

import styles from './show-status.module.css';

export interface ShowStatusProps {
  status: Status;
  message: string;
}

export const ShowStatus = ({ status, message }: ShowStatusProps) => {
  return <div className={`${styles.status} ${styles[status.toLowerCase()]}`}>{message}</div>;
};
