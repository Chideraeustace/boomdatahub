import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase";
import { motion } from "framer-motion";

import Header from "./components/Header";
import StatusMessage from "./components/StatusMessage";
import ActionButtons from "./components/ActionButtons";
import ProviderLogos from "./components/ProviderLogos";
import PurchaseForm from "./components/PurchaseForm";
import CheckDataModal from "./components/CheckDataModal";
import WhatsAppFloat from "./components/WhatsAppFloat";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setCurrentUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const openCheckData = () => setModalType("checkData");
  const closeModal = () => setModalType(null);

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-100 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Dark Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-950/40 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[15%] -right-24 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] -left-24 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Fixed status message */}
      <div className="fixed top-0 left-0 right-0 z-[100] px-4 pointer-events-none">
        <div className="max-w-md mx-auto pt-4 pointer-events-auto">
          <StatusMessage message={statusMessage} />
        </div>
      </div>

      <Header currentUser={currentUser} title="BOOMDATA HUB" />

      <main className="max-w-4xl mx-auto px-4 pt-12 pb-24 space-y-12">
        {/* Hero / Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center">
            <ActionButtons
              onCheckData={openCheckData}
              setStatusMessage={setStatusMessage}
            />
          </div>
        </motion.section>

        {/* Main Purchase Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-black/40 border border-slate-800 p-6 md:p-10 relative overflow-hidden"
        >
          {/* Subtle Decorative Gradient Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[5rem] -z-0" />

          <div className="relative z-10">
            <ProviderLogos />
            <div className="mt-10">
              <PurchaseForm setStatusMessage={setStatusMessage} />
            </div>
          </div>
        </motion.div>

        {/* Support Section */}
        <section className="space-y-6 max-w-md mx-auto">
          <div className="flex items-center gap-4 px-2">
            <h2 className="text-lg font-bold text-slate-400 tracking-wide uppercase text-sm">
              Support Hub
            </h2>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* Call Support Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-800/80 shadow-lg flex flex-col items-center text-center group transition-all"
          >
            <div className="w-14 h-14 bg-indigo-950 text-indigo-400 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Live Assistance
            </h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-xs">
              Need help with an instant bundle delivery? Our priority support
              team is one tap away.
            </p>
            <a
              href="tel:0559370174"
              className="w-full py-3.5 px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2"
            >
              <span>Call 055 937 0174</span>
            </a>
          </motion.div>
        </section>
      </main>

      <WhatsAppFloat />

      {/* Modals */}
      <CheckDataModal
        isOpen={modalType === "checkData"}
        onClose={closeModal}
        setStatusMessage={setStatusMessage}
      />
    </div>
  );
}

export default App;
