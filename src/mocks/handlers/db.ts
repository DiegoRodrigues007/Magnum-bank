function makeStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear() {
      m.clear();
    },
    getItem(key: string) {
      return m.has(key) ? m.get(key)! : null;
    },
    key(index: number) {
      return Array.from(m.keys())[index] ?? null;
    },
    removeItem(key: string) {
      m.delete(key);
    },
    setItem(key: string, value: string) {
      m.set(key, String(value));
    },
  } as unknown as Storage;
}

if (typeof (globalThis as any).localStorage === "undefined") {
  (globalThis as any).localStorage = makeStorage();
}

type User = { id: number; name: string; email: string; password: string };
type Account = {
  id: number;
  userId: number;
  agency: string;
  number: string;
  balance: number;
};
type Transaction = {
  id: number;
  userId: number;
  type: "PIX" | "TED" | string;
  beneficiary: string;
  document: string;
  amount: number;
  date: string;
  balanceAfter: number;
};

const USERS_KEY = "mock_users";
const ACCOUNTS_KEY = "mock_accounts";
const TX_KEY = "mock_transactions";
const SESSION_KEY = "mock_session_email";

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const genId = (list: { id: number }[]) =>
  list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;

export const ensureSeed = () => {
  const users = readJson<User[]>(USERS_KEY, []);
  if (!users.some((u) => u.email === "diego@teste.com")) {
    const user: User = {
      id: 1,
      name: "Diego",
      email: "diego@teste.com",
      password: "123456",
    };
    writeJson(USERS_KEY, [...users, user]);

    const accounts = readJson<Account[]>(ACCOUNTS_KEY, []);
    const acc: Account = {
      id: 1,
      userId: 1,
      agency: "0001",
      number: "123456-7",
      balance: 1000,
    };
    writeJson(ACCOUNTS_KEY, [...accounts, acc]);

    const txs = readJson<Transaction[]>(TX_KEY, []);
    writeJson(TX_KEY, txs);
  }
};

export const db = {
  getSessionEmail(): string | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw === "null") return null;
      return raw;
    } catch {
      return null;
    }
  },
  setSessionEmail(email: string | null) {
    localStorage.setItem(SESSION_KEY, email ?? "null");
  },

  getUsers(): User[] {
    return readJson<User[]>(USERS_KEY, []);
  },
  saveUsers(users: User[]) {
    writeJson(USERS_KEY, users);
  },
  upsertUser(u: Omit<User, "id"> & Partial<Pick<User, "id">>) {
    const users = db.getUsers();
    if (u.id) {
      const idx = users.findIndex((x) => x.id === u.id);
      if (idx >= 0) {
        users[idx] = { ...(users[idx] as User), ...(u as User) };
        db.saveUsers(users);
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
    db.saveUsers([...users, nu]);
    return nu;
  },

  getAccounts(): Account[] {
    return readJson<Account[]>(ACCOUNTS_KEY, []);
  },
  saveAccounts(list: Account[]) {
    writeJson(ACCOUNTS_KEY, list);
  },
  ensureAccountForUser(userId: number) {
    const accs = db.getAccounts();
    let acc = accs.find((a) => a.userId === userId);
    if (!acc) {
      acc = {
        id: genId(accs),
        userId,
        agency: "0001",
        number: (100000 + Math.floor(Math.random() * 899999)).toString(),
        balance: 1000,
      };
      db.saveAccounts([...accs, acc]);
    }
    return acc;
  },

  getTxs(): Transaction[] {
    return readJson<Transaction[]>(TX_KEY, []);
  },
  saveTxs(list: Transaction[]) {
    writeJson(TX_KEY, list);
  },
  createTx(tx: Omit<Transaction, "id">) {
    const all = db.getTxs();
    const id = genId(all);
    const created: Transaction = { id, ...tx };
    db.saveTxs([created, ...all]);
    return created;
  },
};

ensureSeed();

export type { User, Account, Transaction };
