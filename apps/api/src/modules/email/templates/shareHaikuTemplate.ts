import { env } from "../../../env";
import { POSTCARD_BACK_CID, POSTCARD_FRONT_CID } from "../../../consts/postcard";

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toHtmlPoem = (value: string): string => escapeHtml(value).replace(/\n/g, "<br />");

export const buildShareHaikuEmail = (params: {
  senderName: string;
  personalMessage: string;
  title: string;
  body: string;
  /** Back PNG is attached with cid POSTCARD_BACK_CID; the front (POSTCARD_FRONT_CID) only when `hasFront`. */
  postcard?: { hasFront: boolean };
}) => {
  const senderName = params.senderName.trim() || "Someone";
  const personal = params.personalMessage.trim();
  const title = params.title.trim() || "Haiku";
  const poemText = params.body.trim();
  const siteUrl = env.WEB_APP_URL;
  const subject = `Is it a bird? Is it spam? It's ${senderName} pondering the meaning of "${title}"`;
  const personalSection =
    personal.length > 0
      ? `
    <div style="margin:0 0 12px;padding:10px 12px;border-left:3px solid #bc002d;background:rgba(255,255,255,0.68);border-radius:6px;">
      <p style="margin:0 0 4px;font-size:13px;line-height:1.35;color:#4a4a4a;">Few words from ${escapeHtml(senderName)}:</p>
      <p style="margin:0;font-size:15px;line-height:1.45;color:#2c2c2c;">${escapeHtml(personal)}</p>
    </div>`
      : "";

  const postcardImage = (cid: string, alt: string) =>
    `<img src="cid:${cid}" alt="${escapeHtml(alt)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;margin:0 0 12px;border:0;border-radius:8px;" />`;
  const postcardSection = params.postcard
    ? `
    <div style="margin:0 0 16px;">
      ${params.postcard.hasFront ? postcardImage(POSTCARD_FRONT_CID, `Postcard front: ${title}`) : ""}
      ${postcardImage(POSTCARD_BACK_CID, `Postcard back: message from ${senderName}`)}
    </div>`
    : "";

  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;padding:0;border-collapse:collapse;">
  <tr>
    <td style="padding:24px;color:#2c2c2c;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;background-color:background: linear-gradient(135deg, #ff7c68, #2c1e1e);background-image:linear-gradient(160deg,#0000 60%,#00000008 60%,#0000000f 100%),linear-gradient(200deg,#0000 75%,#0000000a 75%,#00000005 100%);background-repeat:no-repeat,no-repeat;background-size:cover,cover;background-position:center center,center center;">
      <div style="max-width:640px;margin:0 auto;">
      <p style="margin:0 0 12px;font-size:16px;line-height:1.4;color:rgb(0 0 0 / 65%);">A poem from ${escapeHtml(senderName)}:</p>
    ${postcardSection}
    ${personalSection}
    <div style="background:rgba(255,255,255,0.88);border:1px solid rgba(44,44,44,0.14);border-radius:10px;padding:18px 20px;">
      <h2 style="margin:0 0 8px;font-size:20px;line-height:1.3;color:#1f1f1f;">${escapeHtml(title)}</h2>
      <p style="margin:0;font-size:18px;line-height:1.6;font-style:italic;white-space:normal;">${toHtmlPoem(poemText)}</p>
    </div>
    <p style="margin:18px 0 0;font-size:14px;line-height:1.5;">
      <a href="${escapeHtml(siteUrl)}" style="color:#bc002d;text-decoration:none;font-weight:600;">Create your own poem</a>
    </p>
      </div>
    </td>
  </tr>
</table>
`.trim();

  const postcardNote = !params.postcard
    ? `${personal ? `Few words from ${senderName}:\n${personal}\n` : ""}
    ${title}\n
    ${poemText}\n`
    : ""

  const text = `
${postcardNote}

Create your own poem: ${siteUrl}`;

  return {
    subject,
    html,
    text,
  };
};
