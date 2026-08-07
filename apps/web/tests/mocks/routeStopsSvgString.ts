import { readFileSync } from "fs";
import { join } from "path";

export default readFileSync(
  join(__dirname, "../../public/route-split-segments-exact.svg"),
  "utf8",
);
