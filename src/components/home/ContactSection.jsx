import ContactImage from "../../assets/ContactImage.png";

export default function ContactSection() {
  return (
    <section className="flex w-full flex-col items-center gap-8 p-8 md:flex-row">
      <img
        src={ContactImage}
        alt="Mechanic working on a tire"
        className="w-1/3 md:w-2/5 lg:w-1/3"
      />
      <div className="flex w-full flex-col justify-center md:flex-1">
        <h1 className="p-5 mb-5 text-center text-3xl font-bold">Contact</h1>
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-1 flex-col gap-4">
              <input type="text" name="name" id="name" placeholder="Name" />
              <input type="email" name="email" id="email" placeholder="Email" />
            </div>
            <a
              href="mailto:garagegloauto@gmail.com"
              className="flex-1 text-center text-blue-500 hover:underline"
            >
              Garagegloauto@gmail.com
            </a>
          </div>
          <textarea placeholder="Message" />
          <button type="submit" className="self-center">
            Submit
          </button>
        </form>
      </div>
    </section>
  );
}
