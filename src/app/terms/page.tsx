
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Last Updated: August 6, 2025
        </p>
        <p className="mt-6 text-base leading-7 text-muted-foreground">
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the game server hosting services and website (the &quot;Service&quot;) provided by the Company (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By registering for or using our Service, you agree to be bound by these Terms. If you do not agree, do not use our Service.
        </p>

        <Separator className="my-8" />

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold"><strong>1. Definitions</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              <strong>&quot;Account&quot;:</strong> A registered user profile for accessing and managing game hosting services.<br />
              <strong>&quot;Customer&quot;, &quot;User&quot;, &quot;You&quot;:</strong> Any individual or entity who registers or uses the Service.<br />
              <strong>&quot;Game Server&quot;:</strong> A hosted instance of a game or modded environment provided by us on your behalf.<br />
              <strong>&quot;Content&quot;:</strong> Any data, files, mods, or user-submitted materials stored or processed on our servers.<br />
              <strong>&quot;Company&quot;:</strong> The legal entity providing and operating the Service.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>2. Eligibility &amp; Legal Use</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              You must:<br />
              - Be at least 13 years old (or the age of digital consent in your country).<br />
              - Have the authority to enter into a binding agreement.<br />
              - Use the Service only for lawful purposes in accordance with applicable game EULAs, software licenses, and international laws.<br />
              You agree not to host illegal content, distribute copyrighted materials without permission, or run cracked/pirated game servers.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>3. Account Registration</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              To access most features, you must create an Account. You agree to:<br />
              - Provide accurate, complete, and updated information.<br />
              - Keep your password secure.<br />
              - Notify us immediately of any unauthorized access.<br />
              You are responsible for activity on your account. We reserve the right to suspend or terminate your account for violations of these Terms.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>4. Server Hosting Terms</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              By purchasing or deploying a game server:<br />
              - You are renting computing resources. You do not gain ownership of the hardware.<br />
              - You are responsible for managing mods, plugins, and server configurations within legal and technical limits.<br />
              - We reserve the right to shut down or throttle servers using excessive CPU, memory, bandwidth, or causing harm to our infrastructure.<br />
              - We do not guarantee compatibility with all mods or third-party tools. Use at your own risk.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>5. Acceptable Use Policy (AUP)</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              You agree not to:<br />
              - Use the Service for illegal activities (e.g., malware hosting, DDoS attacks).<br />
              - Violate game developers’ terms of use or license agreements.<br />
              - Harass or abuse our support staff or other users.<br />
              - Share your server with third parties for resale or profit unless part of a partner/reseller program.<br />
              Violation of this policy may result in immediate suspension without refund.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>6. Intellectual Property</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              All content and materials we create (panel, website, backend systems, designs) remain our intellectual property. You may not copy, modify, reverse-engineer, or redistribute our platform or services without permission.<br />
              You retain ownership of any files you upload to your server but grant us a license to store and handle that data for service delivery.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>7. Payment &amp; Refund Policy</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              All payments are processed securely via our payment gateway(s).<br />
              Services are billed in advance (monthly, quarterly, etc.) unless stated otherwise.<br />
              Refunds are not guaranteed once services have started. Refunds for issues must be requested within 48 hours of purchase and are granted at our sole discretion.<br />
              Chargebacks without contacting support first will result in permanent account suspension.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>8. Termination</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              We reserve the right to suspend or terminate your account or services at any time, for reasons including but not limited to:<br />
              - Breach of these Terms<br />
              - Abuse or misuse of resources<br />
              - Hosting illegal or malicious content<br />
              Upon termination, your access will cease immediately and data may be deleted after a grace period. You may terminate your own account anytime by contacting support.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>9. Limitation of Liability</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              To the fullest extent permitted by law, we shall not be liable for:<br />
              - Downtime or interruptions<br />
              - Loss of data or files<br />
              - Indirect or consequential damages<br />
              - Issues caused by game updates or third-party mods<br />
              Our total liability under these Terms shall not exceed the amount you paid in the past 30 days or $100 USD, whichever is less.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>10. Disclaimer of Warranties</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              The Service is provided “as is” and “as available” without warranties of any kind. We do not guarantee that:<br />
              - Servers will be uninterrupted or error-free<br />
              - Game mods or configurations will function<br />
              - Data stored will be secure or recoverable in all cases<br />
              Use of the Service is at your own risk.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>11. DMCA &amp; Copyright Policy</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              If you believe that any content hosted on our Service infringes your copyright, please submit a Digital Millennium Copyright Act (DMCA) complaint to our designated agent with:<br />
              - Your full legal name and contact info<br />
              - The content in question and its location (e.g., IP or file path)<br />
              - A statement of good faith belief and your signature<br />
              We will review the claim and may remove or restrict the content and/or notify the offending party.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>12. Privacy Policy</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              Your use of the Service is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal data. By using our Service, you consent to that data collection and processing.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>13. Modifications to the Terms</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              We may update or revise these Terms at any time. If we make material changes, we will notify users by posting updates on the website or sending direct communication.<br />
              Continued use of the Service after changes are posted constitutes acceptance of the new Terms.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>14. Governing Law</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              These Terms are governed by the laws of the jurisdiction in which the Company is registered, without regard to its conflict of law principles. Any disputes arising under these Terms will be resolved in the appropriate court within that jurisdiction.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>15. Contact Information</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              If you have questions, concerns, or need support, you can contact us at:<br />
              - Our website&apos;s support portal<br />
              - Our official Discord server
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
