const LOCATION_LEVELS = [
  { field: 'country', level: 'country', sequence: 'account_country_code_seq', width: 3 },
  { field: 'state', level: 'state', sequence: 'account_state_code_seq', width: 2 },
  { field: 'district', level: 'district', sequence: 'account_district_code_seq', width: 2 },
  { field: 'city', level: 'city', sequence: 'account_city_code_seq', width: 2 }
];

export function normalizeLocation(value) {
  const location = {};
  for (const { field } of LOCATION_LEVELS) {
    const name = typeof value?.[field] === 'string'
      ? value[field].trim().replace(/\s+/g, ' ')
      : '';
    if (!name || name.length > 120) {
      return { error: `${field[0].toUpperCase()}${field.slice(1)} is required and must be 120 characters or fewer.` };
    }
    location[field] = name;
  }
  return { location };
}

async function getOrCreateLocationCode(queryable, { level, parentId, parentScope, name, sequence, width }) {
  const normalizedName = name.toLocaleLowerCase('en');
  const existing = await queryable.query(
    `SELECT id, code FROM account_geo_codes
     WHERE level = $1 AND parent_scope = $2 AND normalized_name = $3`,
    [level, parentScope, normalizedName]
  );
  if (existing.rowCount) return existing.rows[0];

  // Sequence names come only from the fixed level definitions above.
  const inserted = await queryable.query(
    `INSERT INTO account_geo_codes (level, parent_id, parent_scope, name, normalized_name, code)
     VALUES ($1, $2, $3, $4, $5, lpad(nextval('${sequence}')::text, ${width}, '0'))
     ON CONFLICT (level, parent_scope, normalized_name) DO NOTHING
     RETURNING id, code`,
    [level, parentId, parentScope, name, normalizedName]
  );
  if (inserted.rowCount) return inserted.rows[0];

  // A concurrent signup may have registered the same location first.
  const raced = await queryable.query(
    `SELECT id, code FROM account_geo_codes
     WHERE level = $1 AND parent_scope = $2 AND normalized_name = $3`,
    [level, parentScope, normalizedName]
  );
  return raced.rows[0];
}

export async function createLocationCodes(queryable, location) {
  const codes = {};
  let parentId = null;
  let parentScope = 0;

  for (const definition of LOCATION_LEVELS) {
    const region = await getOrCreateLocationCode(queryable, {
      ...definition,
      parentId,
      parentScope,
      name: location[definition.field]
    });
    codes[`${definition.field}Code`] = region.code;
    parentId = region.id;
    parentScope = region.id;
  }

  return codes;
}

export async function createPublicUserId(queryable, locationCodes) {
  const result = await queryable.query("SELECT nextval('account_dealer_code_seq') AS dealer_code");
  const dealerCode = String(result.rows[0].dealer_code).padStart(3, '0');
  return `${locationCodes.countryCode}-${locationCodes.stateCode}-${locationCodes.districtCode}-${locationCodes.cityCode}-${dealerCode}`;
}

export async function ensureAccountPublicId(pool, accountId, locationInput) {
  const normalized = normalizeLocation(locationInput);
  if (normalized.error) return { error: normalized.error };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const accountResult = await client.query(
      'SELECT public_id, identity_codes, profile_data FROM app_users WHERE id = $1 FOR UPDATE',
      [accountId]
    );
    if (!accountResult.rowCount) {
      await client.query('ROLLBACK');
      return { error: 'Account not found.' };
    }

    const account = accountResult.rows[0];
    if (account.public_id) {
      await client.query('COMMIT');
      return { publicId: account.public_id, identityCodes: account.identity_codes };
    }

    const identityCodes = await createLocationCodes(client, normalized.location);
    const publicId = await createPublicUserId(client, identityCodes);
    const profileData = { ...account.profile_data, location: normalized.location };
    await client.query(
      `UPDATE app_users SET public_id = $2, identity_codes = $3, profile_data = $4, updated_at = now()
       WHERE id = $1`,
      [accountId, publicId, JSON.stringify(identityCodes), JSON.stringify(profileData)]
    );
    await client.query('COMMIT');
    return { publicId, identityCodes, location: normalized.location };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
