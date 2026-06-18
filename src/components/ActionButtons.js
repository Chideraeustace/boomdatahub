import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaPhoneAlt, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../Firebase";

const ActionButtons = ({ onCheckData, setStatusMessage }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const handleAction = (fn) => {
    document.activeElement?.blur();
    fn();
  };

  // Safe phone number formatting helper
  const formatToGhanaId = (phone) => {
    let formatted = phone.trim().replace(/\s+/g, "");
    if (formatted.startsWith("0") && formatted.length === 10) {
      return `233${formatted.slice(1)}`;
    }
    if (formatted.length === 9 && !formatted.startsWith("233")) {
      return `233${formatted}`;
    }
    return formatted;
  };

  const handleUssdActivation = async (e) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.trim().replace(/\s+/g, "");
    if (!/^\d{10}$/.test(cleanNumber)) {
      setStatusMessage(
        "Please enter a valid 10-digit number (e.g., 0541234567).",
      );
      return;
    }
    setIsActivating(true);
    const docId = formatToGhanaId(cleanNumber);
    try {
      // Create reference using the formatted 233 number as the exact Document ID
      const docRef = doc(db, "Boomwhitelist", docId);
      await setDoc(docRef, {
        phoneNumber: docId,
        activatedAt: serverTimestamp(),
        isActive: true,
      });
      setIsActivated(true);
      setStatusMessage(
        "Success! Your number has been added for offline data shopping.",
      );
      setPhoneNumber("");
      // Reset success indicator after 5 seconds
      setTimeout(() => setIsActivated(false), 5000);
    } catch (err) {
      console.error(err);
      setStatusMessage(
        "Failed to activate number for USSD. Please check connection.",
      );
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <section className="w-full space-y-6">
      {/* Informative Instruction Card */}
      <div className="w-full bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl text-sm font-black tracking-wider shadow-md animate-pulse">
            *919*111#
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">
              Buy Without Internet!
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              No data bundle? Dial our offline code anytime to instantly buy
              data.
            </p>
          </div>
        </div>
        <div className="text-xs font-bold text-indigo-400 bg-indigo-950 px-3 py-1.5 rounded-lg border border-indigo-900 uppercase tracking-widest whitespace-nowrap">
          ⚡ Faster Delivery
        </div>
      </div>

      {/* Grid Action Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Track Delivery Utility */}
        <motion.button
          onClick={() => handleAction(onCheckData)}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          className="group w-full flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg hover:shadow-xl hover:border-indigo-500/30 transition-all text-left h-fit"
        >
          <div className="bg-indigo-950 text-indigo-400 p-4 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <FaSearch size={20} />
          </div>
          <div>
            <span className="block font-bold text-white">Check Status</span>
            <span className="block text-xs text-slate-400">
              Track your order dispatch history
            </span>
          </div>
        </motion.button>

        {/* Dynamic USSD Whitelist Submission Portal */}
        <div className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col justify-between gap-3">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-950 text-emerald-400 p-4 rounded-xl">
              <FaPhoneAlt size={18} />
            </div>
            <div className="flex-1">
              <span className="block font-bold text-white text-lg">
                Activate Offline Buying
              </span>
              <p className="text-xs text-slate-400 mt-1">
                <strong>Enter your phone number below</strong> to link it and
                start using{" "}
                <span className="font-mono text-emerald-400">*919*111#</span>{" "}
                for offline data buying.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleUssdActivation}
            className="flex flex-col gap-3 w-full mt-2"
          >
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-medium px-1">
              YOUR PHONE NUMBER
            </div>

            <div className="flex gap-2 w-full">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isActivating}
                placeholder="0541234567"
                maxLength={10}
                className="flex-1 bg-slate-950 border border-slate-800 text-sm text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-500"
                required
              />
              <motion.button
                type="submit"
                disabled={isActivating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center min-w-[110px]
                  ${
                    isActivated
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-700"
                  }`}
              >
                {isActivating ? (
                  <FaSpinner className="animate-spin text-base" />
                ) : isActivated ? (
                  <FaCheckCircle className="text-base" />
                ) : (
                  "Activate"
                )}
              </motion.button>
            </div>

            <p className="text-[10px] text-slate-500 text-center mt-1">
              Once activated, you can dial{" "}
              <span className="font-mono text-emerald-400">*919*111#</span>{" "}
              anytime — even without data.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ActionButtons;
