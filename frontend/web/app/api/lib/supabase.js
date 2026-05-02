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

  function buildRecord(row) {
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

  function makeSelectReturn(data) {
    const dataArr = Array.isArray(data) ? data : [data];
    return {
      single() {
        const item = dataArr[0] || null;
        if (!item) return { data: null, error: { message: "Not found" } };
        return { data: item, error: null };
      },
      order() {
        return this;
      },
      range(_, __) {
        return { data: dataArr, count: dataArr.length, error: null };
      },
    };
  }

  function makeFilterable(dataArr, filters) {
    let filtered = [...dataArr];
    if (filters?.eq) {
      filtered = filtered.filter((r) => r[filters.eq[0]] === filters.eq[1]);
    }
    return {
      eq(key, value) {
        return makeFilterable(dataArr, { eq: [key, value] });
      },
      select(columns) {
        return {
          ...makeSelectReturn(filtered),
          order(col, { ascending }) {
            return this;
          },
          range(_, __) {
            return { data: filtered, count: filtered.length, error: null };
          },
        };
      },
      order(col, { ascending }) {
        return this;
      },
      single() {
        return filtered.length
          ? { data: filtered[0], error: null }
          : { data: null, error: { message: "Not found" } };
      },
    };
  }

  return {
    from(table) {
      return {
        insert(row) {
          const record = buildRecord(row);
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

        select(columns) {
          const filtered = [...roasts];
          return {
            eq(key, value) {
              const eqFiltered = filtered.filter((r) => r[key] === value);
              return {
                ...makeSelectReturn(eqFiltered),
                order(col, opts) {
                  return this;
                },
                range(_, __) {
                  return { data: eqFiltered, count: eqFiltered.length, error: null };
                },
              };
            },
            order(col, opts) {
              return this;
            },
            single() {
              return { data: null, error: { message: "Not found" } };
            },
          };
        },
      };
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
