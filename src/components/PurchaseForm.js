import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSpinner,
  FaWifi,
  FaMobileAlt,
  FaShieldAlt,
  FaStar,
  FaTimesCircle,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { httpsCallable } from "firebase/functions";
import { functions } from "../Firebase";

const providersData = {
  mtn: {
    color: "bg-[#FFCC00]",
    border: "border-[#FFCC00]",
    text: "text-black",
    bundles: [
      { gb: 1, price: 5.0 },
      { gb: 2, price: 10.0 },
      { gb: 3, price: 15.0 },
      { gb: 4, price: 20.0 },
      { gb: 5, price: 25.0 },
      { gb: 6, price: 30.0 },
      { gb: 8, price: 37.0 },
      { gb: 10, price: 44.0 },
      { gb: 15, price: 64.0 },
      { gb: 20, price: 84.0 },
      { gb: 25, price: 104.0 },
      { gb: 30, price: 124.0 },
      { gb: 40, price: 160.0 },
      { gb: 50, price: 200.0 },
    ],
  },
  airtel: {
    color: "bg-[#ED1C24]",
    border: "border-[#ED1C24]",
    text: "text-white",
    bundles: [
      { gb: 1, price: 4.5 },
      { gb: 2, price: 9.5 },
      { gb: 3, price: 14.0 },
      { gb: 4, price: 19.0 },
      { gb: 5, price: 24.0 },
      { gb: 6, price: 39.0 },
      { gb: 7, price: 33.0 },
      { gb: 8, price: 38.0 },
      { gb: 9, price: 40.0 },
      { gb: 10, price: 45.0 },
      { gb: 15, price: 65.0 },
      { gb: 20, price: 85.0 },
    ],
  },
  telecel: {
    color: "bg-[#E60000]",
    border: "border-[#E60000]",
    text: "text-white",
    bundles: [
      { gb: 5, price: 25.0 },
      { gb: 10, price: 50.0 },
      { gb: 15, price: 66.0 },
      { gb: 20, price: 85.0 },
      { gb: 25, price: 105.0 },
      { gb: 30, price: 123.0 },
      { gb: 40, price: 160.0 },
      { gb: 50, price: 200.0 },
    ],
  },
};

const mtnSpecialOffers = [
  {
    id: 24,
    slug: "1.7gb",
    name: "1.7 GB",
    description: "Single MashUp cycle — 1746.92MB Only",
    cost_price: "6",
  },
  {
    id: 26,
    slug: "2.6gb-mins",
    name: "2.6 GB + 1,077 mins",
    description: "Three 873.46MB bundle cycles — approx 2.6 GB + mins",
    cost_price: "18",
  },
  {
    id: 34,
    slug: "3.4gb",
    name: "3.4 GB",
    description: "Two MashUp cycles on 1.7 GB base — approx 3.4 GB",
    cost_price: "11",
  },
  {
    id: 25,
    slug: "5.1gb-12",
    name: "5.1 GB",
    description: "Three 1.7 GB MashUp cycles — approx 5.1 GB",
    cost_price: "20",
  },
  {
    id: 27,
    slug: "7.2gb-15",
    name: "7.2 GB",
    description: "Four 1806.56MB bundle cycles — approx 7.2 GB",
    cost_price: "25",
  },
  {
    id: 31,
    slug: "10.2gb",
    name: "10.2 GB",
    description: "Six MashUp cycles on 1.7 GB base — approx 10.2 GB",
    cost_price: "30",
  },
];

const PENDING_REF_KEY = "moolre_pending_ref";

const safeStorage = {
  get: (k) => {
    try {
      return window.sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      window.sessionStorage.setItem(k, v);
    } catch {}
  },
  remove: (k) => {
    try {
      window.sessionStorage.removeItem(k);
    } catch {}
  },
};

// Server status → what the customer sees.
const RESULT_COPY = {
  delivered: {
    phase: "done",
    title: "Payment Received",
    message: "Your bundle is on its way to the recipient number.",
  },
  success: {
    phase: "done",
    title: "Payment Received",
    message: "Payment confirmed. Your bundle is being delivered now.",
  },
  delivery_failed: {
    phase: "done",
    title: "Payment Received",
    message:
      "Payment confirmed, but delivery is delayed. We'll complete it shortly — no need to pay again.",
  },
  pending: {
    phase: "pending",
    title: "Waiting for Payment",
    message:
      "We haven't received confirmation yet. If you approved the prompt, give it a moment and check again.",
  },
  failed: {
    phase: "error",
    title: "Payment Not Completed",
    message: "The payment was declined or cancelled. You haven't been charged.",
  },
  amount_mismatch: {
    phase: "error",
    title: "Payment Needs Review",
    message:
      "The amount paid didn't match the order. Please contact support with your reference.",
  },
};

const PurchaseForm = ({ setStatusMessage }) => {
  const isSpecialOfferAvailable = false;

  const [purchaseType, setPurchaseType] = useState("regular");
  const [selectedProvider, setSelectedProvider] = useState("mtn");
  const [selectedBundleSize, setSelectedBundleSize] = useState("1");
  const [selectedSpecialId, setSelectedSpecialId] = useState(
    mtnSpecialOffers[0].id.toString(),
  );
  const [recipientPhoneNumber, setRecipientPhoneNumber] = useState("");
  const [fieldError, setFieldError] = useState("");

  // "idle" | "submitting" | "redirecting" | "verifying" | "done" | "pending" | "error"
  const [paymentPhase, setPaymentPhase] = useState("idle");
  const [result, setResult] = useState({ title: "", message: "" });
  const [pendingRef, setPendingRef] = useState(null);

  const startMoolrePayment = useMemo(
    () => httpsCallable(functions, "startMoolrePayment"),
    [],
  );
  const verifyMoolrePayment = useMemo(
    () => httpsCallable(functions, "verifyMoolrePayment"),
    [],
  );

  const activeType = isSpecialOfferAvailable ? purchaseType : "regular";
  const isBusy = paymentPhase !== "idle";

  const report = useCallback(
    (phase, title, message) => {
      setPaymentPhase(phase);
      setResult({ title, message });
      setStatusMessage?.(message);
    },
    [setStatusMessage],
  );

  const activeBundleDetails = useMemo(() => {
    if (activeType === "regular") {
      const bundle = providersData[selectedProvider].bundles.find(
        (b) => b.gb === Number(selectedBundleSize),
      );
      return bundle
        ? {
            price: bundle.price,
            desc: `${bundle.gb}GB ${selectedProvider.toUpperCase()} Data Bundle`,
            meta: {
              type: "data_bundle",
              provider: selectedProvider.toUpperCase(),
              gb: bundle.gb,
            },
          }
        : null;
    }
    const offer = mtnSpecialOffers.find(
      (o) => o.id === Number(selectedSpecialId),
    );
    return offer
      ? {
          price: Number(offer.cost_price),
          desc: `MTN Special: ${offer.name}`,
          meta: {
            type: "special_offer",
            provider: "MTN",
            package_id: offer.id,
            slug: offer.slug,
          },
        }
      : null;
  }, [activeType, selectedProvider, selectedBundleSize, selectedSpecialId]);

  const formatPhoneNumber = (phone) => `233${phone.trim().slice(1)}`;

  /* ------------- Check payment when returning from Moolre ------------- */
  const verifyPayment = useCallback(
    async (reference) => {
      setPendingRef(reference);
      setPaymentPhase("verifying");
      try {
        const { data } = await verifyMoolrePayment({ reference });
        const copy = RESULT_COPY[data?.status] || RESULT_COPY.pending;
        if (copy.phase !== "pending") safeStorage.remove(PENDING_REF_KEY);
        report(copy.phase, copy.title, copy.message);
      } catch (err) {
        console.error("Failed to verify payment:", err);
        if (err.code === "functions/not-found") {
          safeStorage.remove(PENDING_REF_KEY);
          report("error", "Order Not Found", err.message);
        } else {
          report(
            "pending",
            "Couldn't Check Payment",
            err.message || "Please try checking again in a moment.",
          );
        }
      }
    },
    [verifyMoolrePayment, report],
  );

  const checkedOnLoad = useRef(false);
  useEffect(() => {
    if (checkedOnLoad.current) return;
    checkedOnLoad.current = true;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") || safeStorage.get(PENDING_REF_KEY);
    if (!ref) return;

    if (params.has("ref")) {
      params.delete("ref");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`,
      );
    }
    verifyPayment(ref);
  }, [verifyPayment]);

  const handlePhoneInput = (e) => {
    setRecipientPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
    if (fieldError) setFieldError("");
  };

  const resetPurchase = useCallback(() => {
    safeStorage.remove(PENDING_REF_KEY);
    setPendingRef(null);
    setPaymentPhase("idle");
    setResult({ title: "", message: "" });
  }, []);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!activeBundleDetails) return;
    if (!/^0\d{9}$/.test(recipientPhoneNumber)) {
      setFieldError("Enter a valid 10-digit number starting with 0.");
      return;
    }

    setPaymentPhase("submitting");

    try {
      const reference = uuidv4();
      const { data } = await startMoolrePayment({
        amount: activeBundleDetails.price,
        desc: activeBundleDetails.desc,
        reference,
        metadata: {
          ...activeBundleDetails.meta,
          recipient_number: formatPhoneNumber(recipientPhoneNumber),
        },
      });

      if (data?.authorization_url) {
        // Remember the order in case Moolre's redirect drops the ref param.
        safeStorage.set(PENDING_REF_KEY, data.reference || reference);
        setPaymentPhase("redirecting");
        window.location.assign(data.authorization_url);
        return;
      }

      report(
        "error",
        "Payment Request Failed",
        data?.message || "Couldn't open the payment page. Please try again.",
      );
    } catch (err) {
      console.error("Failed to start payment:", err);
      report(
        "error",
        "Payment Request Failed",
        err.message || "Failed to initiate payment. Please try again.",
      );
    }
  };

  const showForm = ["idle", "submitting", "redirecting"].includes(paymentPhase);

  return (
    <section className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80"
      >
        {/* Header Section */}
        <div className="bg-slate-950 p-5 sm:p-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-500/10 p-2 rounded-lg">
              <FaWifi className="text-indigo-400 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-white">Purchase Bundle</h2>
          </div>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Verified numbers are delivered within 3 minutes to 2 hours, while
            unverified numbers are delivered within 24 hours.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.form
              key="form"
              onSubmit={handlePurchase}
              className="p-5 sm:p-6 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Service Category Toggle */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300">
                  Select Offer Type
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    disabled={isBusy}
                    onClick={() => {
                      setPurchaseType("regular");
                      setSelectedProvider("mtn");
                      setSelectedBundleSize("1");
                    }}
                    className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                      activeType === "regular"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Regular Bundles
                  </motion.button>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    disabled={!isSpecialOfferAvailable || isBusy}
                    onClick={() => {
                      setPurchaseType("special");
                      setSelectedProvider("mtn");
                    }}
                    className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 relative
                      ${
                        !isSpecialOfferAvailable
                          ? "opacity-30 cursor-not-allowed bg-slate-900 text-slate-500"
                          : activeType === "special"
                            ? "bg-amber-500 text-black shadow-md"
                            : "text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    <FaStar
                      className={
                        activeType === "special"
                          ? "text-black"
                          : "text-slate-500"
                      }
                    />
                    <span>MTN Special Offers</span>
                    {!isSpecialOfferAvailable && (
                      <span className="absolute -top-2 -right-1 bg-rose-600 text-white text-[8px] font-medium tracking-tight px-1.5 py-0.5 rounded-full uppercase">
                        Out of Stock
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Network Selection */}
              {activeType === "regular" && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-300">
                    Choose Network
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.keys(providersData).map((prov) => (
                      <motion.button
                        key={prov}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        disabled={isBusy}
                        onClick={() => {
                          setSelectedProvider(prov);
                          setSelectedBundleSize(prov === "telecel" ? "5" : "1");
                        }}
                        className={`py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-wider
                          ${
                            selectedProvider === prov
                              ? `${providersData[prov].border} ${providersData[prov].color} ${providersData[prov].text} shadow-md`
                              : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                          }`}
                      >
                        {prov}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Plan Select */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-300">
                  {activeType === "regular"
                    ? "Select Data Plan"
                    : "Select MTN Special Offer Package"}
                </label>
                <div className="relative">
                  {activeType === "regular" ? (
                    <select
                      value={selectedBundleSize}
                      onChange={(e) => setSelectedBundleSize(e.target.value)}
                      disabled={isBusy}
                      className="w-full appearance-none bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      {providersData[selectedProvider].bundles.map((b) => (
                        <option
                          key={b.gb}
                          value={b.gb}
                          className="bg-slate-950 text-slate-100"
                        >
                          {b.gb}GB — GHS {b.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={selectedSpecialId}
                      onChange={(e) => setSelectedSpecialId(e.target.value)}
                      disabled={isBusy}
                      className="w-full appearance-none bg-slate-950 border border-amber-500/30 text-slate-100 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    >
                      {mtnSpecialOffers.map((offer) => (
                        <option
                          key={offer.id}
                          value={offer.id}
                          className="bg-slate-950 text-slate-100"
                        >
                          {offer.name} — GHS{" "}
                          {Number(offer.cost_price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {activeType === "special" && (
                  <p className="text-xs text-amber-400 bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-lg">
                    <strong>Package detail:</strong>{" "}
                    {
                      mtnSpecialOffers.find(
                        (o) => o.id === Number(selectedSpecialId),
                      )?.description
                    }
                  </p>
                )}
              </div>

              {/* Recipient Phone Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">
                  Recipient Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <FaMobileAlt />
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={recipientPhoneNumber}
                    onChange={handlePhoneInput}
                    disabled={isBusy}
                    placeholder="0541234567"
                    className={`w-full bg-slate-950 border text-slate-100 rounded-xl pl-11 pr-4 py-3.5 outline-none focus:ring-2 focus:border-transparent transition-all placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                      fieldError
                        ? "border-rose-600 focus:ring-rose-500"
                        : "border-slate-800 focus:ring-indigo-500"
                    }`}
                    maxLength={10}
                    required
                  />
                </div>
                {fieldError ? (
                  <p className="text-xs text-rose-400">{fieldError}</p>
                ) : (
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                    The number that receives the data bundle
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-400 bg-slate-950 border border-slate-800 p-3 rounded-lg">
                You'll be taken to Moolre's secure page to pay with Mobile
                Money. You can pay from any MoMo wallet.
              </p>

              {/* Pay Button */}
              <motion.button
                type="submit"
                disabled={isBusy || !activeBundleDetails}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2
                  ${
                    activeType === "special"
                      ? "bg-amber-500 hover:bg-amber-600 text-black disabled:bg-slate-800 disabled:text-slate-600"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-800 disabled:text-slate-600"
                  }`}
              >
                {paymentPhase === "submitting" ? (
                  <FaSpinner className="animate-spin" />
                ) : paymentPhase === "redirecting" ? (
                  <>
                    <FaSpinner className="animate-spin" /> Opening payment page…
                  </>
                ) : (
                  <>Pay GHS {activeBundleDetails?.price?.toFixed(2)}</>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium uppercase tracking-tighter">
                <FaShieldAlt className="text-emerald-500" /> Secured by Moolre
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-8 flex flex-col items-center text-center gap-4 min-h-[320px] justify-center"
            >
              {paymentPhase === "verifying" ? (
                <>
                  <FaSpinner className="animate-spin text-indigo-400 text-3xl" />
                  <h3 className="text-lg font-bold text-white">
                    Checking your payment…
                  </h3>
                </>
              ) : (
                <>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center border ${
                      paymentPhase === "done"
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : paymentPhase === "pending"
                          ? "bg-amber-500/10 border-amber-500/40"
                          : "bg-rose-500/10 border-rose-500/40"
                    }`}
                  >
                    {paymentPhase === "done" && (
                      <FaCheckCircle className="text-emerald-400 text-2xl" />
                    )}
                    {paymentPhase === "pending" && (
                      <FaClock className="text-amber-400 text-2xl" />
                    )}
                    {paymentPhase === "error" && (
                      <FaTimesCircle className="text-rose-400 text-2xl" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {result.title}
                  </h3>
                  <p className="text-sm text-slate-400 max-w-xs">
                    {result.message}
                  </p>
                  {pendingRef && (
                    <p className="text-[10px] text-slate-600 break-all">
                      Ref: {pendingRef}
                    </p>
                  )}
                  <div className="flex gap-3 mt-2">
                    {paymentPhase === "pending" && pendingRef && (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => verifyPayment(pendingRef)}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-sm font-semibold transition-all"
                      >
                        Check Again
                      </motion.button>
                    )}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={resetPurchase}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all"
                    >
                      {paymentPhase === "error"
                        ? "Try Again"
                        : "Make Another Purchase"}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default PurchaseForm;
