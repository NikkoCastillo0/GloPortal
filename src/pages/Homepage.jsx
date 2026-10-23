import Header from "../components/layout/Header.jsx";
import Hero from "../components/home/Hero.jsx";
import BusinessHighlights from "../components/home/BusinessHighlights.jsx";
import ServiceCarousel from "../components/ServiceCarousel.jsx";
import CalendarPreview from "../components/home/CalendarPreview.jsx";
import ContactSection from "../components/home/ContactSection.jsx";
import Footer from "../components/layout/Footer.jsx";

export default function Homepage() {
  return (
    <>
      <Header role="customer" isHome={true} isSignedIn={false} />
      <main>
        <div
          className="
            flex items-center justify-center gap-[60px] bg-[#999999] p-[40px]
            [@media(max-width:768px)]:flex-col [@media(max-width:768px)]:gap-[25px]
            [@media(max-width:768px)]:px-[15px] [@media(max-width:768px)]:py-[25px]
          "
        >
          <Hero id="home" />
          <BusinessHighlights />
        </div>
        <ServiceCarousel id="services" />
        <CalendarPreview id="calendar" />
        <ContactSection id="contact" />
      </main>
      <Footer />
    </>
  );
}
