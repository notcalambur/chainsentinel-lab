import type { Investigation } from "@/lib/domain/types";

// ponytail: vanilla IndexedDB via the global indexedDB. No `idb` dep, just
// enough IndexedDB Promise wrappers for the four operations the MVP needs.
// ponytail: single object store keyed by investigation.id; MVP has at most
// dozens of saved cases per user, no need for indexes beyond the primary key.

const DB_NAME = "chainsentinel-lab";
const DB_VERSION = 1;
const STORE = "cases";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
  });
}

function tx(db: IDBDatabase, mode: IDBTransactionMode) {
  return db.transaction(STORE, mode).objectStore(STORE);
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error ?? new Error("IDB request failed"));
  });
}

export async function saveCase(inv: Investigation): Promise<void> {
  const db = await open();
  try {
    await req(tx(db, "readwrite").put(inv));
  } finally {
    db.close();
  }
}

export async function loadAllCases(): Promise<Investigation[]> {
  const db = await open();
  try {
    return await req(tx(db, "readonly").getAll() as IDBRequest<Investigation[]>);
  } finally {
    db.close();
  }
}

export async function loadCase(id: string): Promise<Investigation | undefined> {
  const db = await open();
  try {
    const v = await req(tx(db, "readonly").get(id) as IDBRequest<Investigation | undefined>);
    return v ?? undefined;
  } finally {
    db.close();
  }
}

export async function deleteCase(id: string): Promise<void> {
  const db = await open();
  try {
    await req(tx(db, "readwrite").delete(id));
  } finally {
    db.close();
  }
}

export async function clearCases(): Promise<void> {
  const db = await open();
  try {
    await req(tx(db, "readwrite").clear());
  } finally {
    db.close();
  }
}