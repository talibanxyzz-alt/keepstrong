/**
 * Email triggers - Call these functions to send automated emails
 */

/**
 * Send welcome email immediately after user signs up
 * Call this in the signup success callback
 */
export async function sendWelcomeEmail(userId: string) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'welcome',
        userId,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send welcome email');
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw - we don't want to block signup if email fails
  }
}

/**
 * Send Day 2 reminder email
 * This should be called by the daily cron job
 */
export async function sendDay2Reminder(userId: string) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'day2_reminder',
        userId,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send day 2 reminder');
    }
  } catch (error) {
    console.error('Error sending day 2 reminder:', error);
  }
}

/**
 * Send Week 1 progress summary
 * This should be called by the weekly cron job
 */
export async function sendWeek1Progress(userId: string) {
  try {
    const response = await fetch('/api/emails/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'week1_progress',
        userId,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send week 1 progress');
    }
  } catch (error) {
    console.error('Error sending week 1 progress:', error);
  }
}

