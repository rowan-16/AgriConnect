import { PaymentRecord } from '../types';
import { INITIAL_PAYMENTS } from './mockData';
import { loadStorage, saveStorage } from './storageUtils';

const PAYMENTS_KEY = 'payments';

export const paymentService = {
  getAllPayments(): PaymentRecord[] {
    return loadStorage<PaymentRecord[]>(PAYMENTS_KEY, INITIAL_PAYMENTS);
  },

  getPaymentById(id: string): PaymentRecord | undefined {
    return this.getAllPayments().find(p => p.id === id);
  },

  releaseEscrow(id: string): PaymentRecord | null {
    const list = this.getAllPayments();
    const item = list.find(p => p.id === id);
    if (!item) return null;

    item.payoutStatus = 'processed';
    saveStorage(PAYMENTS_KEY, list);
    return item;
  }
};
