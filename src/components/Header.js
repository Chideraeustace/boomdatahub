import { motion } from "framer-motion";
import { FaWifi } from "react-icons/fa";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800/60 py-4 px-6 mb-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <motion.div
          className="flex items-center gap-3 cursor-default"
          whileHover={{ scale: 1.02 }}
        >
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-950/50">
            <FaWifi className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            BOOMDATA <span className="text-indigo-500">HUB</span>
          </h1>
        </motion.div>

        <div className="mt-1 flex items-center gap-2">
          <p className="text-slate-400 text-sm font-medium">
            Easy & Affordable Data Bundles Across Ghana
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
