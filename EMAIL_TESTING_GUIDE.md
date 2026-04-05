// Toggle this flag to switch between real and mock email sending
export const USE_MOCK_EMAIL = true; // Set to false to send real emails

// Add this to your emailService.ts at the top of sendActionItemEmail function:
// if (USE_MOCK_EMAIL) {
//   console.log('📧 MOCK EMAIL (Not actually sent):');
//   console.log('━'.repeat(60));
//   console.log(`To: ${emailData.to_email}`);
//   console.log(`Name: ${emailData.to_name}`);
//   console.log(`Subject: Action Item - ${emailData.action_title}`);
//   console.log('━'.repeat(60));
//   console.log(emailData.action_details);
//   console.log('━'.repeat(60));
//
//   return {
//     success: true,
//     message: `Email preview logged to console (Mock Mode). To: ${emailData.to_email}`,
//   };
// }
