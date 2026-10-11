export type SendShareEmailContentProps = {
  message: string;
  emails: string[];
  invalidEmails: string[];
  onMessageChange: (value: string) => void;
  onEmailsChange: (value: string[]) => void;
  disabled?: boolean;
};
