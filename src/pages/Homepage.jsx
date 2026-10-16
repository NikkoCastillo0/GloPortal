import Header from "../components/home/Header.jsx";
import Hero from "../components/home/Hero.jsx";
import BusinessHighlights from "../components/home/BusinessHighlights.jsx";
import ServiceCarousel from "../components/ServiceCarousel.jsx";
import CalendarPreview from "../components/home/CalendarPreview.jsx";
import ContactSection from "../components/home/ContactSection.jsx";
import Footer from "../components/home/Footer.jsx";

export default function Homepage() {
  return (
    <>
      <Header role="customer" isHome={false} isSignedIn={false} />
      <main className="p-8">
        <Hero />
        <BusinessHighlights />
        <ServiceCarousel />
        <CalendarPreview />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
