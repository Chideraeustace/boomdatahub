import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppFloat = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center group">
      {/* Animated Pulse Ring */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-20 animate-ping"></span>

      <motion.a
        href="https://wa.me/233549856098"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl shadow-green-950/20 transition-shadow"
        // Framer Motion Animations
        whileHover={{
          scale: 1.1,
          rotate: 5,
        }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FaWhatsapp size={32} />

        {/* Tooltip styled for Dark Mode */}
        <span className="absolute right-16 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none tracking-wide">
          Chat with us
        </span>
      </motion.a>
    </div>
  );
};

export default WhatsAppFloat;
