import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id?: number;
  type: 'pemasukan' | 'pengeluaran';
  category: 'sandang' | 'pangan' | 'papan' | 'ortu' | 'pasangan' | 'sedekah' | 'keinginan' | 'lain-lain';
  amount: number;
  sourceOfFunds?: string;
  dateTime: Date;
  receiptImage?: Blob;
}

export class FinanceDB extends Dexie {
  transactions!: Table<Transaction>;

  constructor() {
    super('KonservaDB');
    this.version(1).stores({
      transactions: '++id, type, category, dateTime' 
    });
  }
}

export const db = new FinanceDB();
