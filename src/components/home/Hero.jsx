import tireServiceImage from "../../assets/tire-service.png";

export default function Hero() {
  return (
    <section
      id="home"
      className="
        flex flex-1 justify-center scroll-mt-[500px]
        [@media(min-width:769px)]:max-w-[420px]
        [@media(max-width:768px)]:w-full
      "
      aria-label="Garage Glo tire service">
      <img
        src={tireServiceImage}
        alt="Mechanic working on a vehicle tire"
        className="
          h-[300px] w-full max-w-[420px] object-cover
          [@media(max-width:768px)]:h-auto
          [@media(max-width:768px)]:max-w-full
        "
      />
    </section>
  );
}
