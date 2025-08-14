
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
          This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
        </p>

        <Separator className="my-8" />

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold"><strong>Collecting and Using Your Personal Data</strong></h2>
            <div className="mt-4 text-muted-foreground leading-7 space-y-4">
              <h3 className="text-xl font-semibold">Types of Data Collected</h3>
              <div className="pl-4 space-y-2">
                  <h4 className="text-lg font-semibold">Personal Data</h4>
                  <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to: Email address, First name and last name, Usage Data.</p>
              </div>
              <div className="pl-4 space-y-2">
                  <h4 className="text-lg font-semibold">Usage Data</h4>
                  <p>Usage Data is collected automatically when using the Service. Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>Use of Your Personal Data</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              The Company may use Personal Data for the following purposes:<br />
              - To provide and maintain our Service, including to monitor the usage of our Service.<br />
              - To manage Your Account: to manage Your registration as a user of the Service.<br />
              - To contact You: To contact You by email, or other equivalent forms of electronic communication.<br />
              - To manage Your requests: To attend and manage Your requests to us.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>Security of Your Personal Data</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>Changes to this Privacy Policy</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.
            </p>
          </div>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-semibold"><strong>Contact Us</strong></h2>
            <p className="mt-4 text-muted-foreground leading-7">
              If you have any questions about this Privacy Policy, You can contact us by visiting the support section on our website or joining our Discord.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
