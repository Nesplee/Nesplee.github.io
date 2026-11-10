// only this site may frame the game page
try { if (window.top !== window.self && window.top.location.origin !== location.origin) throw 0; } catch { document.documentElement.hidden = true; }
  // The owner's so_long (bonus), unmodified, compiled to WebAssembly; see wasm/mlx-web for the MiniLibX layer.
  const MAPS = ['maps/test3_bonus.ber', 'maps/test2.ber', 'maps/test.ber'];
  const asked = new URLSearchParams(location.search).get('map');
  const map = MAPS.includes(asked) ? asked : MAPS[0];
  // once the game runs, its own exit() (game over, Esc) must not be reported as a load failure
  let started = false;
  const tell = (m) => { if (m === 'ready') started = true; if (m !== 'failed' || !started) parent.postMessage(m, location.origin); };
  var Module = {
    canvas: document.getElementById('game'),
    locateFile: (file) => '../wasm/so_long/' + file + (/^[0-9a-f]{10}$/.test(new URLSearchParams(location.search).get('v') || '') ? '?v=' + new URLSearchParams(location.search).get('v') : ''), // only a build hash is accepted
    mlxLoopCalls: 1400,
    // "Moves: … | Collected: …" is left out: its ft_printf passes va_list by value, which misprints in WebAssembly.
    print: (line) => { if (!line.startsWith('Moves:')) document.getElementById('end').textContent = line; },
    printErr: (line) => console.warn(line),
    onAbort: () => tell('failed'),
    onRuntimeInitialized: () => { Module.callMain([map]); Module.canvas.focus(); parent.postMessage({ type: 'size', w: Module.canvas.width, h: Module.canvas.height }, location.origin); tell('ready'); },
    onGameEnd: () => { document.getElementById('over').hidden = false; document.getElementById('again').focus(); },
  };
  addEventListener('error', () => tell('failed'));
  addEventListener('unhandledrejection', () => tell('failed'));
  document.getElementById('again').onclick = () => location.reload();
  addEventListener('focus', () => Module.canvas.focus());
