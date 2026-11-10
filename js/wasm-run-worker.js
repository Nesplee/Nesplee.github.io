// Runs one execution of one of the owner's programs (compiled to WebAssembly) and posts its output.
// One worker per run: several instances in the same realm interfere (see tests/helpers/wasm-worker.mjs).
self.onmessage = async ({ data: { name, args, input } }) => {
  try {
    const v = new URL(import.meta.url).searchParams.get('v');
    const q = v ? `?v=${v}` : '';
    const base = new URL(`../wasm/${name}/`, import.meta.url);
    const factory = (await import(new URL(`${name}.js${q}`, base).href)).default;
    const out = [];
    let i = 0;
    const bytes = new TextEncoder().encode(input ?? '');
    const mod = await factory({ locateFile: (f) => new URL(f + q, base).href, print: (l) => out.push(l), printErr: (l) => out.push(l), stdin: () => (i < bytes.length ? bytes[i++] : null) });
    try { mod.callMain(args); } catch (e) { if (e?.name !== 'ExitStatus') throw e; }
    self.postMessage({ out });
  } catch (e) {
    self.postMessage({ error: String(e) });
  }
};
