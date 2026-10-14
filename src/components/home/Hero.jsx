import tireServiceImage from "../../assets/tire-service.png";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero" aria-label="Garage Glo tire service">
      <img
        src={tireServiceImage}
        alt="Mechanic working on a vehicle tire"
        className="hero-image"
      />
    </section>
  );
}
