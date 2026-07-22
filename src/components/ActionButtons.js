import React from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
//import { doc, setDoc, serverTimestamp } from "firebase/firestore";
//import { db } from "../Firebase";

const ActionButtons = ({ onCheckData, setStatusMessage }) => {
  //const [phoneNumber, setPhoneNumber] = useState("");
 // const [isActivating, setIsActivating] = useState(false);
  //const [isActivated, setIsActivated] = useState(false);

  const handleAction = (fn) => {
    document.activeElement?.blur();
    fn();
  };

  // Safe phone number formatting helper
  /*const formatToGhanaId = (phone) => {
    let formatted = phone.trim().replace(/\s+/g, "");
    if (formatted.startsWith("0") && formatted.length === 10) {
      return `233${formatted.slice(1)}`;
    }
    if (formatted.length === 9 && !formatted.startsWith("233")) {
      return `233${formatted}`;
    }
    return formatted;
  };*/

  /*const handleUssdActivation = async (e) => {
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
  */

  return (
    <section className="w-full space-y-6">
      {/* Informative Instruction Card */}
      

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
      </div>
    </section>
  );
};

export default ActionButtons;
