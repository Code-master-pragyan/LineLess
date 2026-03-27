import React, { useState } from "react";

export default function PaymentModal({ open, onClose, onSuccess, amount = 1 }) {
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  async function handlePay() {
    setLoading(true);
    // Mock payment delay
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSuccess?.({ mockPayment: true, amount });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Payment Modal"
    >
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200/70 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative h-1 bg-gradient-to-r from-medical-600 to-blue-600" />

        <div className="p-6 sm:p-8">
          {/* Top Section */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="animate-fade-in-1">
              <div className="inline-block px-3 py-1 rounded-full bg-medical-100 text-medical-700 text-xs font-semibold">
                🎫 Digital Token
              </div>
              <div className="mt-3 text-3xl font-bold text-gray-900">
                Pay <span className="text-medical-600">₹{amount}</span>
              </div>
              <div className="mt-1 text-sm text-gray-600">Get instant digital queue token</div>
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
                <div className="font-semibold text-gray-900 mb-1">Instant Token Generation</div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  Complete this mock payment to generate your digital queue token. Join the queue immediately and track your position in real-time.
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
              <div className="text-xs font-semibold text-gray-700">Live Track</div>
            </div>
            <div className="text-center p-2">
              <div className="text-2xl mb-1">🔔</div>
              <div className="text-xs font-semibold text-gray-700">Alerts</div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            className="w-full bg-gradient-to-r from-medical-600 to-blue-600 text-white rounded-xl px-4 py-4 font-semibold text-base transition-all duration-300 hover:shadow-card-hover active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 animate-fade-in-4"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <span>💳</span>
                Pay ₹{amount}
              </>
            )}
          </button>

          {/* Security Info */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>🔒</span>
              <span>This is a <strong>demo payment</strong>. Token generated immediately after submission.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

//         <div className="mt-4 flex items-center justify-between gap-3">
//           <div className="text-xs text-gray-500">
//             Amount is fixed at ₹{amount}. No real payment.
//           </div>
//           {loading ? (
//             <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700">
//               <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-indigo-700" />
//               Processing…
//             </div>
//           ) : null}
//         </div>

//         <div className="mt-5 flex gap-2">
//           <button
//             className="flex-1 rounded-2xl border px-3 py-2.5 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
//             onClick={onClose}
//             disabled={loading}
//           >
//             Cancel
//           </button>
//           <button
//             className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-3 py-2.5 text-sm font-semibold hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
//             onClick={handlePay}
//             disabled={loading}
//           >
//             {loading ? "Generating Token..." : "Confirm Payment"}
//           </button>
//         </div>

//         <div className="mt-3 text-[11px] text-gray-500">
//           Tip: After you get the token, open the same queue using the QR code.
//         </div>
//       </div>
//     </div>
//   );
// }

