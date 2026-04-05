import emailjs from '@emailjs/browser';

// EmailJS configuration
// Production keys for sending real emails
const EMAILJS_SERVICE_ID = 'meet_service';
const EMAILJS_TEMPLATE_ID = 'meet_template';
const EMAILJS_PUBLIC_KEY = '_Vfea78twEEb3a2fS';

/**
 * Initialize EmailJS with public key
 */
export function initEmailJS() {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
  }
}

/**
 * Format action item email content
 */
function formatActionItemEmail(action: {
  task: string;
  assignee: { name: string; email: string };
  priority: string;
  dueDate: string;
  description?: string;
}) {
  const priorityEmoji = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  }[action.priority] || '⚪';

  return {
    to_name: action.assignee.name,
    to_email: action.assignee.email,
    action_title: action.task,
    action_priority: `${priorityEmoji} ${action.priority.toUpperCase()}`,
    action_due_date: action.dueDate,
    action_description: action.description || 'No additional description provided.',
    action_details: `
Dear ${action.assignee.name},

You have been assigned a new action item:

📋 Task: ${action.task}
⏰ Priority: ${action.priority.toUpperCase()}
📅 Due Date: ${action.dueDate}

${action.description ? `Description:\n${action.description}` : ''}

Please make sure to complete this task by the due date. If you have any questions or need clarification, please reach out to your team.

Best regards,
Meeting Manager System
    `.trim(),
  };
}

/**
 * Send action item email to participant
 *
 * For demo purposes, this will use a mock implementation.
 * In production, you would:
 * 1. Create an EmailJS account at https://www.emailjs.com/
 * 2. Set up a template for action items
 * 3. Replace the demo keys with your actual keys
 */
export async function sendActionItemEmail(action: {
  task: string;
  assignee: { name: string; email: string };
  priority: string;
  dueDate: string;
  description?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Format the email content
    const emailData = formatActionItemEmail(action);

    console.log('📧 Sending action item email:', {
      to: emailData.to_email,
      subject: `Action Item: ${emailData.action_title}`,
      preview: emailData.action_details.substring(0, 100) + '...',
    });

    // PRODUCTION IMPLEMENTATION - Send real emails
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailData
    );

    if (response.status === 200) {
      console.log('✅ Email sent successfully to', emailData.to_email);
      return {
        success: true,
        message: `Email sent successfully to ${emailData.to_email}`,
      };
    } else {
      throw new Error(`EmailJS returned status ${response.status}`);
    }
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    return {
      success: false,
      message: `Failed to send email: ${error.message || 'Unknown error'}`,
    };
  }
}

/**
 * Alternative: Use a simple HTTP endpoint to send emails
 * This can be useful if you want to use a different email service
 */
export async function sendActionItemEmailViaAPI(action: {
  task: string;
  assignee: { name: string; email: string };
  priority: string;
  dueDate: string;
  description?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const emailData = formatActionItemEmail(action);

    // Example: Using a serverless function or backend endpoint
    // Replace with your actual API endpoint
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (response.ok) {
      return {
        success: true,
        message: `Email sent successfully to ${emailData.to_email}`,
      };
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (error: any) {
    console.error('Failed to send email via API:', error);
    return {
      success: false,
      message: `Failed to send email: ${error.message || 'Unknown error'}`,
    };
  }
}
