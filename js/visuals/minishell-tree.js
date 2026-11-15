// Processes created by the owner's minishell during one command, from the recorded trace (t0 <= t < t1).
export function treeFor(proc, t0, t1) {
  const win = proc.filter((e) => e.t >= t0 && e.t < t1);
  const forks = win.filter((e) => e.call === 'fork');
  const children = forks.map((f) => {
    const exec = win.filter((e) => e.call === 'execve' && e.pid === f.ret).at(-1);
    return { pid: f.ret, parent: f.pid, cmd: exec ? exec.args.join(' ') : null };
  });
  const shell = forks.length ? Math.min(...forks.map((f) => f.pid)) : null;
  return { shell, children, pipes: win.filter((e) => e.call === 'pipe').length, dup2: win.filter((e) => e.call === 'dup2').length };
}
