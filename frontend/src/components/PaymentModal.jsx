import React, { useState } from "react";

/**
 * PaymentModal — Razorpay Integration
 *
 * Props:
 *   open        {boolean}  — controls visibility
 *   onClose     {fn}       — called when user dismisses modal
 *   onSuccess   {fn}       — called with Razorpay payment response after success
 *   amount      {number}   — amount in PAISE (e.g. 100 = ₹1, 5000 = ₹50)
 *   orderId     {string}   — Razorpay order_id from your backend (required)
 *   razorpayKey {string}   — your Razorpay Key ID (from env)
 *   prefill     {object}   — optional: { name, email, contact }
 */
export default function PaymentModal({
  open,
  onClose,
  onSuccess,
  amount = 100,
  orderId,
  razorpayKey,
  prefill = {},
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  function handlePay() {
    setError(null);

    if (!window.Razorpay) {
      setError("Razorpay SDK failed to load. Please refresh and try again.");
      return;
    }

    if (!orderId) {
      setError("Order not created yet. Please try again.");
      return;
    }

    setLoading(true);

    const options = {
      key: razorpayKey || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount,                        // in paise, must match your backend order
      currency: "INR",
      name: "Queue Token",
      description: "Digital Queue Token",
      order_id: orderId,             // from your backend: razorpay.orders.create()
      prefill: {
        name: prefill.name || "",
        email: prefill.email || "",
        contact: prefill.contact || "",
      },
      method: {
    upi: true,        // ✅ ADD THIS
    card: true,
    netbanking: true,
    wallet: true,
  },

      theme: { color: "#2563eb" },
      modal: {
        ondismiss: () => {
          setLoading(false);
          // Don't close the whole modal — let user retry
        },
      },
      handler: function (response) {
        // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
        setLoading(false);
        onSuccess?.(response);
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      setLoading(false);
      setError(
        response?.error?.description ||
          "Payment failed. Please try again."
      );
    });

    rzp.open();
  }

  const displayAmount = (amount / 100).toFixed(0); // paise → rupees

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Payment Modal"
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200/70 overflow-hidden animate-scale-in">
        {/* Accent bar */}
        <div className="relative h-1 bg-gradient-to-r from-medical-600 to-blue-600" />

        <div className="p-6 sm:p-8">
          {/* Top Section */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="animate-fade-in-1">
              <div className="inline-block px-3 py-1 rounded-full bg-medical-100 text-medical-700 text-xs font-semibold">
                🎫 Digital Token
              </div>
              <div className="mt-3 text-3xl font-bold text-gray-900">
                Pay <span className="text-medical-600">₹{displayAmount}</span>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                Get instant digital queue token
              </div>
            </div>

            <button
              className="rounded-xl border border-gray-200 bg-white/80 hover:bg-white px-2.5 py-1.5 text-lg transition-all duration-300 hover:shadow-card disabled:opacity-60"
              onClick={onClose}
              disabled={loading}
              aria-label="Close payment modal"
            >
              ✕
            </button>
          </div>

          {/* Info Section */}
          <div className="rounded-2xl bg-gradient-to-br from-medical-50 to-blue-50 border border-medical-100 p-4 mb-6 animate-fade-in-2">
            <div className="flex gap-3">
              <div className="text-2xl flex-shrink-0">⚡</div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">
                  Instant Token Generation
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  Complete payment via Razorpay to get your digital queue token.
                  Join the queue immediately and track your position in
                  real-time.
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-3">
            <div className="text-center p-2">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-xs font-semibold text-gray-700">No Wait</div>
            </div>
            <div className="text-center p-2">
              <div className="text-2xl mb-1">📍</div>
              <div className="text-xs font-semibold text-gray-700">
                Live Track
              </div>
            </div>
            <div className="text-center p-2">
              <div className="text-2xl mb-1">🔔</div>
              <div className="text-xs font-semibold text-gray-700">Alerts</div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Pay Button */}
          <button
            className="w-full bg-gradient-to-r from-medical-600 to-blue-600 text-white rounded-xl px-4 py-4 font-semibold text-base transition-all duration-300 hover:shadow-card-hover active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 animate-fade-in-4"
            onClick={handlePay}
            disabled={loading || !orderId}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Opening Razorpay...
              </>
            ) : (
              <>
                <span>💳</span>
                Pay ₹{displayAmount} via Razorpay
              </>
            )}
          </button>

          {/* Security Info */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>🔒</span>
              <span>
                Secured by <strong>Razorpay</strong>. UPI, cards, netbanking
                accepted.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}