# EmailJS Rules

- use '@emailjs/browser' for EmailJS functionality.
- Follow the existing EmailJS integration pattern in the project.
- Do not send emails automatically during component rendering.
- Prevent duplicate submissions.
- Disable the submit button while an email is being sent.
- Validate required fields before sending an email.
- Display a clear success message after a successful email.
- Display a clear error message when email delivery fails.
- Do not expose private secrets in frontend code.
- Keep EmailJS configuration values in environment variables when appropriate.
- Do not log sensitive form data or credentials.