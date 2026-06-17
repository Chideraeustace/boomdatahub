import { motion } from "framer-motion";
import mtn from "../download.png";
import airtel from "../airtel.png";
import telecel from "../telecel.png";

const logos = [
  { name: "MTN", src: mtn },
  { name: "AirtelTigo", src: airtel },
  { name: "Telecel", src: telecel },
];

const ProviderLogos = () => {
  return (
    <section className="py-2">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-slate-800"></div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 whitespace-nowrap">
          Supported Networks
        </h3>
        <div className="h-px flex-1 bg-slate-800"></div>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
        {logos.map((logo) => (
          <div key={logo.name} className="group relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center justify-center"
            >
              <motion.img
                src={logo.src}
                alt={logo.name}
                className="h-9 w-auto object-contain filter grayscale invert brightness-200 opacity-40 group-hover:grayscale-0 group-hover:invert-0 group-hover:brightness-100 group-hover:opacity-100 transition-all duration-300"
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              />
            </motion.div>

            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProviderLogos;
