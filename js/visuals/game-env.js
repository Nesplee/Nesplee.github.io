// 'play' | 'touch' (no keyboard: show the poster) | 'nowasm'
export const canPlay = ({ hasKeyboardLikely, wasm }) => (!wasm ? 'nowasm' : hasKeyboardLikely ? 'play' : 'touch');

export const detectEnv = () => ({
  hasKeyboardLikely: matchMedia('(any-pointer: fine)').matches,
  wasm: typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function',
});
