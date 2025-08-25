export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};
export type Account = {
  id: number;
  userId: number;
  agency: string;
  number: string;
  balance: number;
};
export type Transaction = {
  id: number;
  userId: number;
  type: "PIX" | "TED" | string;
  beneficiary: string;
  document: string;
  amount: number;
  date: string;
  balanceAfter: number;
};

const DB_NAME = "magnum-msw";
const STORE = "kv";

const USERS_KEY = "mock_users";
const ACCOUNTS_KEY = "mock_accounts";
const TX_KEY = "mock_transactions";
const SESSION_KEY = "mock_session_email";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as string) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDel(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbClear(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const mem = new Map<string, string>();
const hasIDB = typeof indexedDB !== "undefined";

const storage = {
  async getItem(key: string) {
    if (hasIDB) return await idbGet(key);
    return mem.has(key) ? mem.get(key)! : null;
  },
  async setItem(key: string, value: string) {
    if (hasIDB) return await idbSet(key, value);
    mem.set(key, value);
  },
  async removeItem(key: string) {
    if (hasIDB) return await idbDel(key);
    mem.delete(key);
  },
  async clear() {
    if (hasIDB) return await idbClear();
    mem.clear();
  },
};

const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeJson = async (key: string, value: unknown) =>
  storage.setItem(key, JSON.stringify(value));

const genId = (list: { id: number }[]) =>
  list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;

export const db = {
  async reset() {
    await storage.clear();
  },

  async getSessionEmail(): Promise<string | null> {
    try {
      const raw = await storage.getItem(SESSION_KEY);
      if (raw === "null" || raw === null) return null;
      return raw;
    } catch {
      return null;
    }
  },

  async setSessionEmail(email: string | null) {
    await storage.setItem(SESSION_KEY, email ?? "null");
  },

  async getUsers(): Promise<User[]> {
    return await readJson<User[]>(USERS_KEY, []);
  },

  async saveUsers(users: User[]) {
    await writeJson(USERS_KEY, users);
  },

  async upsertUser(
    u: Omit<User, "id"> & Partial<Pick<User, "id">>
  ): Promise<User> {
    const users = await this.getUsers();
    if (u.id) {
      const idx = users.findIndex((x) => x.id === u.id);
      if (idx >= 0) {
        users[idx] = { ...(users[idx] as User), ...(u as User) };
        await this.saveUsers(users);
        return users[idx];
      }
    }
    const id = genId(users);
    const nu: User = {
      id,
      name: u.name!,
      email: u.email!,
      password: u.password!,
    };
    await this.saveUsers([...users, nu]);
    return nu;
  },

  async getAccounts(): Promise<Account[]> {
    return await readJson<Account[]>(ACCOUNTS_KEY, []);
  },

  async saveAccounts(list: Account[]) {
    await writeJson(ACCOUNTS_KEY, list);
  },

  async ensureAccountForUser(userId: number): Promise<Account> {
    const accs = await this.getAccounts();
    let acc = accs.find((a) => a.userId === userId);
    if (!acc) {
      acc = {
        id: genId(accs),
        userId,
        agency: "0001",
        number: (100000 + Math.floor(Math.random() * 899999)).toString(),
        balance: 1000,
      };
      await this.saveAccounts([...accs, acc]);
    }
    return acc;
  },

  async getTxs(): Promise<Transaction[]> {
    return await readJson<Transaction[]>(TX_KEY, []);
  },

  async saveTxs(list: Transaction[]) {
    await writeJson(TX_KEY, list);
  },

  async createTx(tx: Omit<Transaction, "id">): Promise<Transaction> {
    const all = await this.getTxs();
    const id = genId(all);
    const created: Transaction = { id, ...tx };
    await this.saveTxs([created, ...all]);
    return created;
  },
};

(async () => {
  const [users, accounts, txs] = await Promise.all([
    storage.getItem(USERS_KEY),
    storage.getItem(ACCOUNTS_KEY),
    storage.getItem(TX_KEY),
  ]);
  if (users == null) await writeJson(USERS_KEY, []);
  if (accounts == null) await writeJson(ACCOUNTS_KEY, []);
  if (txs == null) await writeJson(TX_KEY, []);
})();
