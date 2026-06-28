type LeadNotificationInput = {
  ownerEmails: string[];
  propertyName: string;
  suite: string;
  publicUrl: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  message: string;
};

type PublishConfirmationInput = {
  ownerEmails: string[];
  propertyName: string;
  suite: string;
  publicUrl: string;
  flyerUrl: string;
};

export async function sendLeadNotificationEmail(
  input: LeadNotificationInput
) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATIONS_FROM_EMAIL;

  if (!apiKey || !fromEmail || input.ownerEmails.length === 0) {
    return {
      delivered: false,
      reason: "email_not_configured"
    };
  }

  const subject = `New inquiry for ${input.propertyName} ${input.suite}`.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #221d14;">
      <h2 style="margin-bottom: 8px;">New vacancy inquiry</h2>
      <p style="margin-top: 0;">
        A prospect submitted an inquiry for <strong>${escapeHtml(input.propertyName)} ${escapeHtml(input.suite)}</strong>.
      </p>
      <p>
        <strong>Name:</strong> ${escapeHtml(input.contactName)}<br />
        <strong>Email:</strong> ${escapeHtml(input.contactEmail)}<br />
        <strong>Phone:</strong> ${escapeHtml(input.contactPhone || "Not provided")}
      </p>
      <p>
        <strong>Message:</strong><br />
        ${escapeHtml(input.message).replace(/\n/g, "<br />")}
      </p>
      <p>
        <strong>Public URL:</strong><br />
        <a href="${input.publicUrl}">${input.publicUrl}</a>
      </p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: input.ownerEmails,
      subject,
      html
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send lead notification: ${text}`);
  }

  return {
    delivered: true
  };
}

export async function sendPublishConfirmationEmail(
  input: PublishConfirmationInput
) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATIONS_FROM_EMAIL;

  if (!apiKey || !fromEmail || input.ownerEmails.length === 0) {
    return {
      delivered: false,
      reason: "email_not_configured"
    };
  }

  const subject = `Your space is live: ${input.propertyName} ${input.suite}`.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #221d14;">
      <h2 style="margin-bottom: 8px;">Your space is live</h2>
      <p style="margin-top: 0;">
        Your public vacancy page is now live for <strong>${escapeHtml(input.propertyName)} ${escapeHtml(input.suite)}</strong>.
      </p>
      <p>
        <strong>Public URL:</strong><br />
        <a href="${input.publicUrl}">${input.publicUrl}</a>
      </p>
      <p>
        <strong>Next actions:</strong><br />
        Share this URL with a tenant rep, post it to LoopNet, or send the flyer in outreach.
      </p>
      <p>
        <strong>Flyer download:</strong><br />
        <a href="${input.flyerUrl}">${input.flyerUrl}</a>
      </p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: input.ownerEmails,
      subject,
      html
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send publish confirmation: ${text}`);
  }

  return {
    delivered: true
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
