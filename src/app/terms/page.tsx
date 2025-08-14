
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
          Welcome to CrafterNodes! These Terms of Service ("Terms") govern your access to and use of our game server hosting services and website (collectively, the "Service"). By using our Service, you agree to be bound by these Terms.
        </p>

        <Separator className="my-8" />

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold"><strong>1. Definitions</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7 space-y-2">
              <span><strong>"Account":</strong> Your registered profile for using our services.</span><br />
              <span><strong>"User", "You":</strong> Anyone who uses our Service.</span><br />
              <span><strong>"Game Server":</strong> A game environment we host for you.</span><br />
              <span><strong>"Content":</strong> Any data or files you upload to our servers.</span>
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>2. Eligibility & Legal Use</strong></h2>
            <div className="mt-4 text-muted-foreground leading-7">
                To use our Service, you must:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Be at least 13 years old (or the legal age for digital consent in your country).</li>
                    <li>Only use the service for lawful purposes and respect all game EULAs and licenses.</li>
                </ul>
                <p className="mt-2">You agree not to host illegal content, distribute copyrighted materials without permission, or run pirated game servers.</p>
            </div>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>3. Your Account</strong></h2>
             <div className="mt-4 text-muted-foreground leading-7">
                To access most features, you need an account. You agree to:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Provide accurate and current information.</li>
                    <li>Keep your password safe and secure.</li>
                    <li>Inform us immediately if you suspect unauthorized access.</li>
                </ul>
                <p className="mt-2">You are responsible for all activity on your account. We reserve the right to suspend or terminate accounts that violate these Terms.</p>
            </div>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>4. Server Hosting</strong></h2>
            <div className="mt-4 text-muted-foreground leading-7">
                When you use a Game Server:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>You are renting resources; you do not own the hardware.</li>
                    <li>You are responsible for your server's mods, plugins, and configurations.</li>
                    <li>We reserve the right to shut down or throttle servers that cause harm to our infrastructure.</li>
                    <li>We don't guarantee compatibility with all third-party mods. Please use them at your own risk.</li>
                </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>5. Acceptable Use</strong></h2>
             <div className="mt-4 text-muted-foreground leading-7">
                You agree not to:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Use the Service for illegal activities like hosting malware or launching DDoS attacks.</li>
                    <li>Violate any game developer's terms of service.</li>
                    <li>Harass our staff or other users.</li>
                    <li>Resell our services without permission.</li>
                </ul>
                 <p className="mt-2">Violating these rules may result in immediate suspension without a refund.</p>
            </div>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>6. Intellectual Property</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              Our platform and services are our intellectual property. You may not copy or redistribute them without our permission. You retain ownership of the content you upload, but you grant us a license to store and manage it to provide the Service.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>7. Payments & Refunds</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              Services are billed in advance. Refunds are not guaranteed and must be requested within 48 hours of purchase. Chargebacks initiated without first contacting our support may result in permanent account suspension.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>8. Termination</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
             We reserve the right to suspend or terminate your account for any violation of these Terms. Upon termination, your access will be revoked, and your data may be deleted after a grace period.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>9. Limitation of Liability</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              Our Service is provided "as is." We are not liable for data loss, downtime, or other indirect damages. Our total liability is limited to the amount you paid us in the last 30 days or $100, whichever is less.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>10. Disclaimer of Warranties</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              We do not guarantee that the Service will be uninterrupted, error-free, or completely secure. Use of the Service is at your own risk.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>11. DMCA & Copyright</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              If you believe your copyright is being infringed on our service, please submit a DMCA complaint to us with all required information. We will review the claim and take appropriate action.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>12. Privacy Policy</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              Your use of the Service is also governed by our <a href="/privacy" className="underline">Privacy Policy</a>, which explains how we handle your data.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>13. Changes to These Terms</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
             We may update these Terms from time to time. We will notify you of significant changes. Continuing to use the Service after changes means you accept the new Terms.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>14. Governing Law</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              These Terms are governed by the laws of the jurisdiction where our company is registered.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>15. Contact Us</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              If you have any questions, please contact us through our website's support portal or on our official Discord server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
