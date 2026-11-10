// only this site may frame the game page
try { if (window.top !== window.self && window.top.location.origin !== location.origin) throw 0; } catch { document.documentElement.hidden = true; }
  // The owner's cub3d, unmodified, compiled to WebAssembly. Its XPM textures were converted to PNG at
  // build time (wasm/build.sh); they are decoded here before main() and served for the original .xpm paths.
  const map = 'maps/A2.cub';
  // once the game runs, its own exit() (game over, Esc) must not be reported as a load failure
  let started = false;
  const tell = (m) => { if (m === 'ready') started = true; if (m !== 'failed' || !started) parent.postMessage(m, location.origin); };
  const pngKey = (p) => (p.startsWith('./') ? p.slice(1) : p.startsWith('/') ? p : '/' + p) + '.png';

  async function decodeTextures() {
    const files = [];
    const walk = (dir) => {
      for (const n of FS.readdir(dir)) {
        if (n === '.' || n === '..') continue;
        const p = dir + '/' + n;
        if (FS.isDir(FS.stat(p).mode)) walk(p); else if (p.endsWith('.png')) files.push(p);
      }
    };
    walk('/TEXTURES');
    Module.mlxPng = {};
    await Promise.all(files.map(async (p) => {
      const bmp = await createImageBitmap(new Blob([FS.readFile(p)], { type: 'image/png' }));
      const c = new OffscreenCanvas(bmp.width, bmp.height), x = c.getContext('2d');
      x.drawImage(bmp, 0, 0);
      Module.mlxPng[p] = { w: bmp.width, h: bmp.height, data: x.getImageData(0, 0, bmp.width, bmp.height).data };
    }));
  }

  var Module = {
    canvas: document.getElementById('game'),
    locateFile: (file) => '../wasm/cub3d/' + file + (/^[0-9a-f]{10}$/.test(new URLSearchParams(location.search).get('v') || '') ? '?v=' + new URLSearchParams(location.search).get('v') : ''), // only a build hash is accepted
    mlxLoopCalls: 1,
    mlxPointerLock: true,
    mlxPngKey: pngKey,
    print: (line) => console.log(line),
    printErr: (line) => console.warn(line),
    onAbort: () => tell('failed'),
    onRuntimeInitialized: async () => {
      try { await decodeTextures(); } catch { tell('failed'); return; }
      Module.callMain([map]);
      Module.canvas.focus();
      parent.postMessage({ type: 'size', w: Module.canvas.width, h: Module.canvas.height }, location.origin);
      tell('ready');
    },
    onGameEnd: () => { if (document.pointerLockElement) document.exitPointerLock(); document.getElementById('over').hidden = false; document.getElementById('again').focus(); },
  };
  addEventListener('error', () => tell('failed'));
  addEventListener('unhandledrejection', () => tell('failed'));
  document.getElementById('again').onclick = () => location.reload();
  addEventListener('focus', () => Module.canvas.focus());
