import PolicyLayout from '../components/layout/PolicyLayout.jsx'

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <section>
        <h2>Information we collect and why</h2>
        <p>
          When you sign up, GloPortal asks for your first and last name, email address, phone number,
          and password. Your email identifies your account when you sign in. Your name and contact
          details are stored with your customer profile. GloPortal uses a browser session to keep you signed in.
        </p>
        <p>
          When you use the contact form, we receive your name, email address, and the message you provide
          so Garage Glo can respond to your inquiry. If you email Garage Glo directly, your email
          provider and Garage Glo’s Gmail inbox handle your message.
        </p>
        <p>
          The calendar uses your selected date and service to check availability. It currently previews
          available times. The system can store vehicle details such as make, model, year, color,
          and license plate, and appointment details such as service, date and time, status, notes,
          and quote. These records help associate a vehicle with a customer and manage service history.
        </p>
      </section>
      <section>
        <h2>Supabase and other service providers</h2>
        <p>
          <a href="https://supabase.com/privacy">Supabase</a> handles sign-in and hosts application
          records. <a href="https://www.emailjs.com/legal/privacy-policy/">EmailJS</a> receives contact
          form entries and passes messages through a connected email service. Cloudflare Pages provides
          website hosting. Providers may process request details, such as IP addresses, for service
          operations and security.
        </p>
        <p>
          <strong>For team review.</strong> Confirm the connected email service and recipients, hosted
          logging and analytics, and any other data recipients or tracking disclosures.
        </p>
      </section>
      <section>
        <h2>Security and possible data loss</h2>
        <p>
          Supabase Auth stores salted password hashes. GloPortal’s database policies restrict access to
          customer profiles, vehicles, and appointments based on ownership and administrator permissions.
          Outages, errors, or unauthorized access can still result in interruption or loss of data.
          Recovery depends on the backups and provider settings available at the time.
        </p>
      </section>
      <section>
        <h2>Retention and deletion requests</h2>
        <p>
          Account records, contact emails, logs, and backups can be held in different systems.
          GloPortal has no self-service account deletion. Contact Garage Glo with questions about
          deleting your information.
        </p>
        <p>
          <strong>For Adrian and team review.</strong> Approve retention criteria, deletion exceptions,
          and the request process for database, mailbox, provider, and backup copies.
        </p>
      </section>
      <section>
        <h2>Customer privacy rights</h2>
        <p>
          You can contact Garage Glo to ask about access to your information or to request a correction
          or deletion. The rights and procedures that apply depend on applicable law.
        </p>
        <p>
          <strong>For Adrian and team review.</strong> Confirm applicable California disclosures,
          rights, request channels, and identity verification before publication.
        </p>
      </section>
      <section>
        <h2>Children’s privacy and minimum age</h2>
        <p>
          <strong>For Adrian and team review.</strong> Confirm the website’s intended audience, the
          minimum age for an account, and how to handle information received from children.
          Review any applicable children’s privacy obligations separately from the account age rule.
        </p>
      </section>
      <section>
        <h2>Policy updates and contact</h2>
        <p>
          Garage Glo’s published contact address is{' '}
          <a href="mailto:Garagegloauto@gmail.com">Garagegloauto@gmail.com</a>.
        </p>
        <p>
          <strong>For Adrian and team review.</strong> Confirm the legal operator, monitored privacy
          contact, effective date, and how Garage Glo will communicate material policy changes.
        </p>
      </section>
    </PolicyLayout>
  )
}
