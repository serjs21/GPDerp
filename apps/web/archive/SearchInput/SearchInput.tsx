"use client";

import { SearchOutlined } from "@ant-design/icons";
import { Input } from "@/components/StyledComponents";
import styles from "./SearchInput.module.css";

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({ value, onChange, placeholder = "Search haikus...", className }: SearchInputProps) {
  return (
    <Input
      prefix={<SearchOutlined className={styles.icon} />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${styles.searchInput} ${className || ""}`}
      allowClear
    />
  );
}
