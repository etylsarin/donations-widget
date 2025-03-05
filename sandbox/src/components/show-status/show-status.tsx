import { Status } from "../../enums";

export interface ShowStatusProps {
  status: Status;
  message: string;
}

export const ShowStatus = ({ status, message }: ShowStatusProps) => {
  return <div className={`status ${status.toLowerCase()}`}>{message}</div>;
};
