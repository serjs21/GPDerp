import { Suspense } from "react";
import { EmailChangeRevertPageContent } from "./EmailChangeRevertPageContent";

/** Target of the "undo the change" link in the old-address alert email. */
export default function RevertEmailChangePage() {
  return (
    <Suspense fallback={null}>
      <EmailChangeRevertPageContent />
    </Suspense>
  );
}
