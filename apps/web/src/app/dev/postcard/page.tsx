import { notFound } from "next/navigation";
import { DevPostcardPage } from "./DevPostcardPage";

export default function DevPostcardRoute() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DevPostcardPage />;
}
