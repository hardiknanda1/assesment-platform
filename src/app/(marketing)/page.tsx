import { AboutExam } from "@/components/landing/about-exam";
import { Hero } from "@/components/landing/hero";
import { Prizes } from "@/components/landing/prizes";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Prizes />
      <AboutExam />
    </>
  );
}
