import { Input, Button } from "antd";
import styles from "./sytle.module.css";
import { useState } from "react";

export const SignUpFlow = () => {
    const [isManual, setIsManual] = useState(false);
    
  return (
    <form className={styles.container}>
        <Input placeholder="Email" type="email" autoFocus/>
        <Input placeholder="Password" type="password" />
        <Input placeholder="Repeat password" type="password" />

        <Button type="primary" htmlType="submit">Sign up</Button>
    </form>
  );
}