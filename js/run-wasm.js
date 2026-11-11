// runProgram('push_swap', ['3','2','1']) -> Promise<string[]> (lines printed by the program)
export function runProgram(name, args, input = '') {
  return new Promise((resolve, reject) => {
    const w = new Worker(new URL('./wasm-run-worker.js?v=a31d4b7c31' + new URL(import.meta.url).search, import.meta.url), { type: 'module' });
    w.onmessage = ({ data }) => { w.terminate(); data.error ? reject(new Error(data.error)) : resolve(data.out); };
    w.onerror = (e) => { w.terminate(); reject(e); };
    w.postMessage({ name, args, input });
  });
}
