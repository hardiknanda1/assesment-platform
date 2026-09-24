import { SectionHeading } from "@/components/landing/section-heading";
import { FadeIn } from "@/components/landing/motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { siteConfig } from "@/config/site";

const FAQS = [
  {
    q: "Who can register?",
    a: "Any student currently studying in Classes 6 to 12 can register. You'll choose your grade on the enrollment form so you get the right paper.",
  },
  {
    q: "Is there a registration fee?",
    a: "Registration is free. You only need an email address to create your account.",
  },
  {
    q: "When will I get my application number?",
    a: "Immediately. As soon as you submit the enrollment form, your unique application number is generated and shown on screen. It's also always visible on your dashboard.",
  },
  {
    q: "Can I register for more than one assessment?",
    a: "Yes. You can enroll in each open assessment once. Each enrollment gets its own application number.",
  },
  {
    q: "How will the test be conducted?",
    a: "The assessment is taken online in your browser at the scheduled time. Your answers are saved automatically as you go, and the timer is controlled by our servers so everyone gets the same amount of time.",
  },
  {
    q: "I made a mistake in my details. What should I do?",
    a: `Write to ${siteConfig.supportEmail} with your application number and the correction, and our team will update it for you.`,
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <FadeIn delay={0.1} className="mt-12 rounded-2xl border bg-card px-6">
          <Accordion type="single" collapsible>
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}
