/**
 * Append a date-range filter to URLSearchParams in the nested form the
 * backend's ApiFeatures understands: `?field[gte]=...&field[lte]=...`.
 *
 * The bare `dateFrom` / `dateTo` strings the UI used previously were dumped
 * into the Mongo query as literal field names, so they matched nothing.
 *
 * `from` and `to` are `YYYY-MM-DD` strings from a <input type="date">.
 * We expand them to start-of-day / end-of-day ISO timestamps so the `to`
 * date is inclusive of events later that same day.
 */
export const appendDateRange = (params, field, from, to) => {
  if (from) {
    params.set(`${field}[gte]`, new Date(`${from}T00:00:00.000`).toISOString());
  }
  if (to) {
    params.set(`${field}[lte]`, new Date(`${to}T23:59:59.999`).toISOString());
  }
};
