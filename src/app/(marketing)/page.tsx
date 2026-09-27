import { Hero } from "@/components/landing/hero";
import { Prizes } from "@/components/landing/prizes";
import { RegistrationMap } from "@/components/landing/registration-map";
import { AboutExam } from "@/components/landing/about-exam";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Prizes />
      <RegistrationMap />
      <AboutExam />
    </>
  );
}
