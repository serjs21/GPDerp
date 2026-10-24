/**
 * From header for outgoing mail: `"GPDerp" <toaster@gpderp.party>` from a bare MAIL_FROM address plus
 * MAIL_FROM_NAME. A MAIL_FROM that already carries a display name (`Name <a@b.c>`) is used as-is, and an
 * empty name leaves the bare address.
 */
export function formatMailFrom(address: string, name: string): string {
  const trimmedAddress = address.trim();
  const displayName = name.replace(/["\r\n]/g, "").trim();
  if (!trimmedAddress || !displayName || trimmedAddress.includes("<")) return trimmedAddress;
  return `"${displayName}" <${trimmedAddress}>`;
}
