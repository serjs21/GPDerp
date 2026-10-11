import styles from "../ShareLinkManagement.module.css";

const joinClasses = (...classes: Array<string | false>) => classes.filter(Boolean).join(" ");

export function shareLinkRowClassNames(exiting: boolean, grayscale: boolean) {
  return {
    shell: joinClasses(styles.linkRowShell, exiting && styles.linkRowShellExiting),
    row: joinClasses(styles.linkRow, grayscale && styles.linkRowInactive, exiting && styles.boingOutDown),
  };
}
