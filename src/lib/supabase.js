/**
 * ─────────────────────────────────────────────
 *  MOCK SUPABASE — Veritabanı Bağlantısız Mod
 *  Demo Giriş: demo@habitflow.app / habitflow2025
 * ─────────────────────────────────────────────
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Demo kullanıcı bilgileri ───
const DEMO_EMAIL = "demo@habitflow.app";
const DEMO_PASSWORD = "habitflow2025";
const DEMO_USER = {
  id: "mock-user-001",
  email: DEMO_EMAIL,
  created_at: new Date("2024-01-01").toISOString(),
  user_metadata: {
    username: "HabitUser",
    avatar_emoji: "⚡",
    energy: 0,
    freezes: 0,
  },
};

// ─── AsyncStorage anahtarları ───
const KEY_SESSION = "mock_session";
const KEY_HABITS = "mock_habits";
const KEY_LOGS = "mock_logs";
const KEY_BADGES = "mock_badges";

// ─── Yardımcı: JSON kaydet/oku ───
async function store(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
async function load(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// ─── Mock Auth ───
const mockAuth = {
  _listeners: [],

  async getSession() {
    const session = await load(KEY_SESSION);
    return { data: { session }, error: null };
  },

  async signInWithPassword({ email, password }) {
    if (
      email.toLowerCase() === DEMO_EMAIL &&
      password === DEMO_PASSWORD
    ) {
      const session = { user: { ...DEMO_USER } };
      await store(KEY_SESSION, session);
      mockAuth._listeners.forEach((cb) => cb("SIGNED_IN", session));
      return { data: { session }, error: null };
    }
    return {
      data: null,
      error: {
        message:
          "Hatalı e-posta veya şifre.\n\n📧 demo@habitflow.app\n🔑 habitflow2025",
      },
    };
  },

  async signOut() {
    await AsyncStorage.removeItem(KEY_SESSION);
    mockAuth._listeners.forEach((cb) => cb("SIGNED_OUT", null));
    return { error: null };
  },

  async updateUser({ data: metaUpdate }) {
    const session = await load(KEY_SESSION);
    if (session?.user) {
      session.user.user_metadata = {
        ...session.user.user_metadata,
        ...metaUpdate,
      };
      await store(KEY_SESSION, session);
    }
    const updated = await load(KEY_SESSION);
    return { data: { session: updated }, error: null };
  },

  async requestPasswordReset() {
    return { error: null };
  },

  onAuthStateChange(callback) {
    mockAuth._listeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            mockAuth._listeners = mockAuth._listeners.filter(
              (cb) => cb !== callback
            );
          },
        },
      },
    };
  },
};

// ─── Mock Database (from) ───
function mockFrom(table) {
  const keyMap = {
    habits: KEY_HABITS,
    habit_logs: KEY_LOGS,
    user_badges: KEY_BADGES,
  };
  const key = keyMap[table] || `mock_${table}`;

  let _filters = [];
  let _selectFields = "*";
  let _orderBy = null;
  let _isCount = false;
  let _isHead = false;
  let _isSingle = false;
  let _gteFilter = null;
  let _data = null;
  let _method = null; // insert | update | delete | select

  function applyFilters(rows) {
    let result = [...rows];
    _filters.forEach(({ col, val }) => {
      result = result.filter((r) => r[col] === val);
    });
    if (_gteFilter) {
      result = result.filter(
        (r) => r[_gteFilter.col] >= _gteFilter.val
      );
    }
    if (_orderBy) {
      result.sort((a, b) => {
        if (_orderBy.ascending) return a[_orderBy.col] > b[_orderBy.col] ? 1 : -1;
        return a[_orderBy.col] < b[_orderBy.col] ? 1 : -1;
      });
    }
    return result;
  }

  const chain = {
    select(fields, opts = {}) {
      _method = "select";
      _selectFields = fields || "*";
      _isCount = !!opts.count;
      _isHead = !!opts.head;
      return chain;
    },
    eq(col, val) {
      _filters.push({ col, val });
      return chain;
    },
    gte(col, val) {
      _gteFilter = { col, val };
      return chain;
    },
    order(col, opts = {}) {
      _orderBy = { col, ascending: opts.ascending !== false };
      return chain;
    },
    single() {
      _isSingle = true;
      return chain;
    },
    insert(rowData) {
      _method = "insert";
      _data = Array.isArray(rowData) ? rowData : [rowData];
      return chain;
    },
    update(rowData) {
      _method = "update";
      _data = rowData;
      return chain;
    },
    delete() {
      _method = "delete";
      return chain;
    },
    upsert(rowData) {
      _method = "insert";
      _data = Array.isArray(rowData) ? rowData : [rowData];
      return chain;
    },

    // Thenable: await chain
    then(resolve, reject) {
      return execute().then(resolve, reject);
    },
    catch(reject) {
      return execute().catch(reject);
    },
  };

  async function execute() {
    try {
      const rows = (await load(key, [])) || [];

      if (_method === "select" || _method === null) {
        const filtered = applyFilters(rows);
        if (_isCount && _isHead)
          return { count: filtered.length, error: null };

        // user_badges join simulation
        if (table === "user_badges") {
          const badgeData = filtered.map((r) => ({
            earned_at: r.earned_at,
            badges: r.badges || {
              id: r.badge_id,
              title: r.badge_id,
              description: "",
              icon: "🏅",
              color: "#F5A623",
            },
          }));
          if (_isSingle) return { data: badgeData[0] || null, error: null };
          return { data: badgeData, error: null };
        }

        if (_isSingle) return { data: filtered[0] || null, error: null };
        return { data: filtered, error: null };
      }

      if (_method === "insert") {
        const newRows = _data.map((r) => ({
          id: `${table}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          created_at: new Date().toISOString(),
          ...r,
        }));
        const updated = [...rows, ...newRows];
        await store(key, updated);
        if (_isSingle) return { data: newRows[0], error: null };
        return { data: newRows, error: null };
      }

      if (_method === "update") {
        const updated = rows.map((r) => {
          const match = _filters.every((f) => r[f.col] === f.val);
          return match ? { ...r, ..._data } : r;
        });
        await store(key, updated);
        return { data: updated, error: null };
      }

      if (_method === "delete") {
        const updated = rows.filter((r) =>
          !_filters.every((f) => r[f.col] === f.val)
        );
        await store(key, updated);
        return { data: null, error: null };
      }

      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }

  return chain;
}

// ─── Mock RPC ───
async function mockRpc(fnName) {
  if (fnName === "delete_user_account") {
    await AsyncStorage.multiRemove([
      KEY_SESSION,
      KEY_HABITS,
      KEY_LOGS,
      KEY_BADGES,
    ]);
  }
  return { error: null };
}

// ─── Ana export ───
export const supabase = {
  auth: mockAuth,
  from: (table) => mockFrom(table),
  rpc: mockRpc,
};
