import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'tavi@tavicomedy.com';
const BCC_EMAIL = process.env.RESEND_BCC_EMAIL || 'tavi@tavicomedy.com';

/**
 * Send a confirmation email when someone subscribes to the mailing list
 * @param {string} email - subscriber's email
 * @param {string} interestType - 'shows', 'openmics', or 'both'
 * @returns {Promise<{success: boolean, error?: string}>}
 */
/**
 * Send a confirmation email when someone joins a show waitlist
 * @param {string} email - subscriber's email
 * @param {string} showDate - the date of the sold-out show
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendWaitlistConfirmation(email, showDate, tickets) {
  if (!resend) {
    console.warn('Resend not configured - skipping waitlist confirmation email');
    return { success: false, error: 'Resend not configured' };
  }

  const ticketText = tickets > 1 ? ` for ${tickets} tickets` : '';

  const html = `
    <p>Hey!</p>
    <p>You're on the waitlist${ticketText} for the <strong>${showDate}</strong> show. If spots open up, I'll reach out directly.</p>
    <p>- Tavi<br><a href="https://tavicomedy.com">tavicomedy.com</a></p>
    <p><em>Don't want these emails? Just reply with "unsubscribe"</em></p>
  `;

  try {
    await resend.emails.send({
      from: `Tavi Nathanson <${FROM_EMAIL}>`,
      to: email,
      bcc: BCC_EMAIL,
      subject: `You're on the waitlist: ${showDate}`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send waitlist confirmation email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendSubscriptionConfirmation(email, interestType) {
  if (!resend) {
    console.warn('Resend not configured - skipping confirmation email');
    return { success: false, error: 'Resend not configured' };
  }

  const interestText = {
    shows: 'comedy shows',
    openmics: 'open mics',
    both: 'comedy events'
  }[interestType] || 'comedy events';

  const html = `
    <p>Hey!</p>
    <p>Thanks for signing up. You'll get very occasional updates about ${interestText}. Nothing spammy, I promise!</p>
    <p>To make sure future emails don't end up in spam, you can reply with a quick "hi" or add ${FROM_EMAIL} to your contacts.</p>
    <p>- Tavi<br><a href="https://tavicomedy.com">tavicomedy.com</a></p>
    <p><em>Don't want these emails? Just reply with "unsubscribe"</em></p>
  `;

  try {
    await resend.emails.send({
      from: `Tavi Nathanson <${FROM_EMAIL}>`,
      to: email,
      bcc: BCC_EMAIL,
      subject: "You're in the loop: Lawrenceville Comedy",
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return { success: false, error: error.message };
  }
}
