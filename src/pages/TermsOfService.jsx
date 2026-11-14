import PolicyLayout from '../components/layout/PolicyLayout.jsx'

export default function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service">
      <section>
        <h2>Account responsibilities</h2>
        <p>
          Keep your password private, provide accurate account and vehicle information, and contact
          Garage Glo if you suspect someone else has accessed your account.
        </p>
        <p><strong>For Adrian and team review.</strong> Approve account eligibility and minimum age.</p>
      </section>
      <section>
        <h2>Appointment requests and confirmations</h2>
        <p>
          The calendar shows available times for review. Selecting a time in the current calendar
          does not submit a request or reserve an appointment. Contact Garage Glo to confirm your appointment.
        </p>
        <p>
          <strong>For Adrian and team review.</strong> Confirm how requests are accepted, how the shop
          sends confirmations, and when a quote becomes a final price.
        </p>
      </section>
      <section>
        <h2>Cancellations and rescheduling</h2>
        <p>
          Contact Garage Glo directly if you need to cancel or reschedule. The current website does
          not provide self-service cancellation or rescheduling.
        </p>
        <p>
          <strong>For Adrian and team review.</strong> Approve the notice process and any cancellation,
          rescheduling, or missed-appointment rules.
        </p>
      </section>
      <section>
        <h2>Acceptable website use</h2>
        <p>
          Use the website for legitimate service inquiries. Do not access another person’s account
          or records without permission, send spam, or interfere with the website’s operation or security.
        </p>
      </section>
      <section>
        <h2>Garage Glo content and ownership</h2>
        <p>
          The website displays Garage Glo branding and may include material owned or licensed by
          third parties. Obtain permission from the relevant rights holder before reusing material
          where permission is required.
        </p>
        <p>
          <strong>For Adrian and team review.</strong> Confirm ownership of the branding and site content
          and the scope of any permissions granted to visitors.
        </p>
      </section>
      <section>
        <h2>Website availability and third-party interruptions</h2>
        <p>
          Maintenance and outages can interrupt the website. Problems with Supabase can affect sign-in
          and access to records or availability. Problems with EmailJS or its connected email service
          can delay or prevent delivery of contact messages. If a message fails or you are unsure it
          reached the shop, email <a href="mailto:Garagegloauto@gmail.com">Garagegloauto@gmail.com</a>.
        </p>
      </section>
      <section>
        <h2>Limitations of liability</h2>
        <p>
          <strong>For Adrian and legal review.</strong> Approve any liability limits, warranty terms,
          and applicable exceptions before publication. This draft proposes no liability cap or waiver.
        </p>
      </section>
    </PolicyLayout>
  )
}
