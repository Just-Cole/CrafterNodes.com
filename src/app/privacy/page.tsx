
import { Separator } from "@/components/ui/separator";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Last Updated: August 13, 2025
        </p>
        <p className="mt-6 text-base leading-7 text-muted-foreground">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our services.
        </p>

        <Separator className="my-8" />

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold"><strong>Information We Collect</strong></h2>
            <div className="mt-4 text-muted-foreground leading-7 space-y-4">
              <p>To provide our service, we collect a few types of information.</p>
              <div className="pl-4 space-y-2">
                  <h3 className="text-xl font-semibold">Personal Data</h3>
                  <p>When you create an account, we may ask for information that can be used to identify you. This is limited to what's necessary and may include:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Your email address</li>
                      <li>Your first and last name</li>
                  </ul>
              </div>
              <div className="pl-4 space-y-2">
                  <h3 className="text-xl font-semibold">Usage Data</h3>
                  <p>We automatically collect technical data when you use our service. This helps us understand how our service is performing and how to improve it. This data may include:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Your IP address</li>
                      <li>Browser type and version</li>
                      <li>The pages you visit on our site and how long you spend on them</li>
                      <li>Unique device identifiers</li>
                  </ul>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>How We Use Your Data</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              We use the data we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground leading-7">
                <li><strong>To Provide and Maintain Our Service:</strong> Ensuring our services are running smoothly and monitoring usage.</li>
                <li><strong>To Manage Your Account:</strong> To set up and manage your user registration and game servers.</li>
                <li><strong>To Contact You:</strong> To send important notices or respond to your support requests.</li>
                <li><strong>To Improve Our Service:</strong> To understand how you use our service so we can make it better.</li>
            </ul>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>Data Security</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              The security of your data is a top priority. While no method of online transmission or storage is 100% secure, we use commercially acceptable means to protect your personal information and continuously work to enhance our security measures.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>Changes to This Policy</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              We may update our Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and, if the changes are substantial, by sending you an email.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>Contact Us</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              If you have any questions about this Privacy Policy, please don't hesitate to reach out. You can contact us by visiting the support section on our website or by joining our Discord community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
