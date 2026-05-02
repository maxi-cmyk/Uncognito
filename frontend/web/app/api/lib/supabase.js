let _clientPromise = null;

export function getSupabase() {
  return initializeClient();
}

async function initializeClient() {
  if (_clientPromise) return _clientPromise;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Using mock client.");
    _clientPromise = Promise.resolve(createMockClient());
    return _clientPromise;
  }

  _clientPromise = (async () => {
    const { createSupabaseClient } = await import("@uncognito/storage");
    return createSupabaseClient(supabaseUrl, serviceRoleKey);
  })();

  return _clientPromise;
}

function createMockClient() {
  let nextId = 1;
  const roasts = [];
  const uploadAttempts = [];

  function buildRoastRecord(row) {
    const id = `rst_mock_${String(nextId++).padStart(8, "0")}`;
    return {
      id,
      status: "processing",
      image_bucket: null,
      image_path: null,
      image_url: null,
      caption: null,
      source_host: row.source_host || null,
      source_title: row.source_title || null,
      capture_mode: row.capture_mode || "manual",
      client_timestamp: row.client_timestamp || null,
      themes: [],
      share_status: "not_shared",
      error_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      hidden_at: null,
      deleted_at: null,
    };
  }

  function makeChain(filtered, isCountQuery) {
    return {
      eq(key, value) {
        return makeChain(
          filtered.filter((r) => r[key] === value),
          isCountQuery,
        );
      },
      gte(key, value) {
        return makeChain(
          filtered.filter((r) => r[key] >= value),
          isCountQuery,
        );
      },
      order() {
        return this;
      },
      single() {
        return filtered.length
          ? { data: filtered[0], error: null }
          : { data: null, error: { message: "Not found" } };
      },
      range(_, __) {
        if (isCountQuery) {
          return { count: filtered.length, error: null };
        }
        return { data: filtered, count: filtered.length, error: null };
      },
    };
  }

  const roastBuilder = {
    insert(row) {
      const record = buildRoastRecord(row);
      roasts.push(record);
      return {
        select() {
          return {
            single() {
              return { data: record, error: null };
            },
          };
        },
      };
    },
    update(fields) {
      return {
        eq(key, value) {
          const target = roasts.find((r) => r[key] === value);
          if (target) Object.assign(target, fields, { updated_at: new Date().toISOString() });
          return {
            select() {
              return {
                single() {
                  return target
                    ? { data: target, error: null }
                    : { data: null, error: { message: "Not found" } };
                },
              };
            },
          };
        },
      };
    },
    select(columns, opts) {
      const isCount = !!(opts?.count && opts?.head);
      return makeChain([...roasts], isCount);
    },
  };

  const uploadAttemptsBuilder = {
    insert(record) {
      uploadAttempts.push({
        ...record,
        id: `ua_${String(Date.now())}_${Math.random().toString(36).slice(2, 8)}`,
        created_at: new Date().toISOString(),
      });
      return { select() { return { single() { return { data: null, error: null }; } }; } };
    },
    select(columns, opts) {
      const isCount = !!(opts?.count && opts?.head);
      return makeChain([...uploadAttempts], isCount);
    },
  };

  const tableRegistry = {
    roasts: roastBuilder,
    upload_attempts: uploadAttemptsBuilder,
    roast_events: {
      insert() {
        return null;
      },
      select() {
        return makeChain([]);
      },
    },
  };

  return {
    from(table) {
      return tableRegistry[table] || roastBuilder;
    },
    storage: {
      from(bucket) {
        return {
          upload(path, body, opts) {
            return { error: null };
          },
          getPublicUrl(path) {
            return {
              data: { publicUrl: `https://mock.storage/${bucket}/${path}` },
            };
          },
          remove(paths) {
            return { error: null };
          },
        };
      },
    },
  };
}
