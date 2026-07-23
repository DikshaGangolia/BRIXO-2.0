import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, ShieldAlert, Sparkles, X } from 'lucide-react';

interface PaymentHistoryModalProps {
  onClose: () => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ onClose }) => {
  const { session, paymentHistory, subscriptionStatus, fetchPaymentHistory, fetchSubscriptionStatus } = useAuthStore();

  useEffect(() => {
    fetchPaymentHistory();
    fetchSubscriptionStatus();
  }, [fetchPaymentHistory, fetchSubscriptionStatus]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg space-y-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-sm text-slate-200">Billing & Payment History</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Summary Card */}
        <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-3xs uppercase font-bold text-slate-500 tracking-wider">Active Plan Tier</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold text-blue-400 capitalize">{session?.plan || 'free'} Plan</span>
              {['pro', 'max', 'premium'].includes(session?.plan || '') && (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
            </div>
          </div>
          {subscriptionStatus && (
            <div className="text-right space-y-1">
              <span className="text-3xs uppercase font-bold text-slate-500 tracking-wider">Expires On</span>
              <div className="flex items-center gap-1 text-2xs text-slate-300">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(subscriptionStatus.endDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          <span className="text-3xs font-bold uppercase tracking-wider text-slate-500">Transaction Logs</span>
          {paymentHistory.length === 0 ? (
            <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-xl text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-1">
              <ShieldAlert className="w-5 h-5 text-slate-600" />
              No transaction history found on this account.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {paymentHistory.map((pay: any) => (
                <div key={pay._id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-300">Order ID: {pay.razorpayOrderId}</span>
                    <div className="text-4xs text-slate-500">
                      Paid via Razorpay: {new Date(pay.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right space-y-0.5 font-mono">
                    <span className="font-bold text-emerald-400">₹{pay.amount}</span>
                    <span className="block text-4xs uppercase font-extrabold text-emerald-500">Success</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-3xs uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
