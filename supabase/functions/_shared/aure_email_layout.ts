/** Shared HTML layout for Auré / Bailadmin transactional emails (Spanish). */

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Refined card layout: soft gradient background, prominent centered logo, accent bar.
 */
export function buildAureEmailLayout(opts: {
  logoUrl: string | null;
  schoolName: string;
  preheader: string;
  headline: string;
  /** e.g. "Hola, Ana," or "Hola," — omit awkward English fallbacks */
  greetingLine: string;
  /** Short HTML fragments (already safe or use escapeHtml in caller) */
  bodyHtml: string[];
  /** Optional key/value detail block */
  details?: { label: string; valueHtml: string }[];
  closingLine?: string;
  signOff?: string;
}): string {
  const {
    logoUrl,
    schoolName,
    preheader,
    headline,
    greetingLine,
    bodyHtml,
    details,
    closingLine,
    signOff = 'Bailadmin',
  } = opts;

  const accent = '#b8956a';
  const logoBlock = logoUrl
    ? `<tr>
  <td style="padding:36px 40px 20px;text-align:center;background:#fafbfc;border-radius:20px 20px 0 0;">
    <div style="display:inline-block;padding:16px 28px;background:#ffffff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
      <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(schoolName)}" width="200" style="max-width:200px;max-height:72px;width:auto;height:auto;object-fit:contain;display:block;border:0;margin:0 auto;" />
    </div>
  </td>
</tr>
<tr><td style="height:4px;background:${accent};line-height:4px;font-size:0;">&nbsp;</td></tr>`
    : `<tr><td style="height:4px;background:${accent};border-radius:20px 20px 0 0;line-height:4px;font-size:0;">&nbsp;</td></tr>
<tr><td style="padding:40px 40px 8px;text-align:center;"><span style="font-size:22px;font-weight:700;color:#1d1d1f;font-family:Georgia,'Times New Roman',serif;letter-spacing:0.02em;">${escapeHtml(schoolName)}</span></td></tr>`;

  const topPad = logoUrl ? '8px' : '12px';
  const bodyRows = bodyHtml
    .map(
      (h) =>
        `<tr><td style="padding:0 40px 16px;font-size:16px;line-height:1.7;color:#3d3d40;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${h}</td></tr>`
    )
    .join('');

  let detailBlock = '';
  if (details && details.length) {
    const rows = details
      .map(
        (d) =>
          `<tr><td style="padding:10px 0;border-bottom:1px solid #ececf0;"><span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#86868b;display:block;margin-bottom:4px;">${escapeHtml(d.label)}</span><span style="font-size:16px;color:#1d1d1f;font-weight:500;">${d.valueHtml}</span></td></tr>`
      )
      .join('');
    detailBlock = `<tr><td style="padding:8px 40px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#f8f9fb 0%,#f2f4f7 100%);border-radius:16px;border:1px solid #e8eaef;overflow:hidden;"><tr><td style="padding:20px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr></table></td></tr>`;
  }

  const closing = closingLine
    ? `<tr><td style="padding:0 40px 32px;font-size:16px;line-height:1.7;color:#3d3d40;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${closingLine}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapeHtml(headline)}</title>
</head>
<body style="margin:0;padding:0;background:#e8ecf2;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#dfe6ee 0%,#e8ecf2 45%,#eceff4 100%);min-height:100%;">
<tr><td align="center" style="padding:40px 16px 56px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(15,23,42,0.08),0 2px 8px rgba(15,23,42,0.04);">
${logoBlock}
<tr><td style="padding:${topPad} 40px 8px;"><h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.4px;line-height:1.35;color:#1a1a1c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;text-align:center;">${escapeHtml(headline)}</h1></td></tr>
<tr><td style="padding:16px 40px 8px;font-size:17px;line-height:1.6;color:#2d2d30;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${greetingLine}</td></tr>
${bodyRows}
${detailBlock}
${closing}
<tr><td style="border-top:1px solid #f0f0f3;padding:22px 40px 32px;background:#fafbfc;"><p style="margin:0;font-size:14px;color:#6e6e73;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">— ${escapeHtml(signOff)}</p></td></tr>
</table>
<p style="margin:28px 0 0;font-size:12px;color:#86868b;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">Bailadmin · <a href="mailto:noreply@bailadmin.lat" style="color:#86868b;text-decoration:none;">noreply@bailadmin.lat</a></p>
</td></tr>
</table>
</body>
</html>`;
}
