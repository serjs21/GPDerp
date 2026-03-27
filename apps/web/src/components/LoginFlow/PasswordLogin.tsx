import { Input, Button } from "antd";
import styles from "./sytle.module.css";

export const PasswordLoginForm = () => {
  return (
    <form className={styles.container}>
        <Input placeholder="Email" type="email" autoFocus/>
        <Input placeholder="Password" type="password" />
        <Button type="primary" htmlType="submit">Login</Button>
    </form>
  );
}