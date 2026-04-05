// Alternative email service using Ethereal Email (fake SMTP for testing)
// Creates a test account and captures all emails without actually sending them

export async function createTestAccount() {
  try {
    // For frontend-only apps, we'll use a mock implementation
    // In a real backend, you'd use nodemailer with ethereal
    console.log('📧 Creating Ethereal test account...');

    // Simulated test account
    return {
      user: 'test.account@ethereal.email',
      pass: 'test_password_123',
      smtp: {
        host: 'smtp.ethereal.email',
        port: 587,
      },
      webUrl: 'https://ethereal.email/messages',
    };
  } catch (error) {
    console.error('Failed to create test account:', error);
    throw error;
  }
}

/**
 * Send email using Ethereal (for testing only)
 * This would work with a backend implementation
 */
export async function sendTestEmail(to: string, subject: string, content: string) {
  const account = await createTestAccount();

  console.log('📧 TEST EMAIL (Not actually sent):');
  console.log('━'.repeat(60));
  console.log(`From: ${account.user}`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('━'.repeat(60));
  console.log(content);
  console.log('━'.repeat(60));
  console.log(`View at: ${account.webUrl}`);

  return {
    success: true,
    message: 'Email logged to console (test mode)',
    previewUrl: account.webUrl,
  };
}
