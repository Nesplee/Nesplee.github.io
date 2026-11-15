// JSON of the site's own data and recordings; throws on an HTTP error so the caller shows the error state.
export async function getJson(path, base) {
  const res = await fetch(new URL(path, base));
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}
