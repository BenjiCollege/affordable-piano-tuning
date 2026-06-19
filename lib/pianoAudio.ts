/* Shared Web Audio piano engine — additive sine partials through a low-pass
   filter, matching the synthesis used elsewhere on the site. Used by the 3D
   WebGL piano; respects the global sound toggle via setSoundEnabled(). */

let actx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

export function ensureAudio() {
  if (typeof window === "undefined") return;
  if (!actx) {
    const AC =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    actx = new AC();
    master = actx.createGain();
    master.gain.value = 0.85;
    master.connect(actx.destination);
  }
  if (actx.state === "suspended") actx.resume();
}

export function playMidi(m: number, dur = 1.9) {
  if (!enabled) return;
  ensureAudio();
  if (!actx || !master) return;
  const ctx = actx,
    now = ctx.currentTime;
  const freq = 440 * Math.pow(2, (m - 69) / 12);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 4600;
  lp.Q.value = 0.3;
  lp.connect(master);
  (
    [
      [1, 1],
      [2, 0.55],
      [3, 0.3],
      [4, 0.17],
      [5, 0.1],
      [6, 0.05],
    ] as Array<[number, number]>
  ).forEach(([h, a]) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq * h;
    o.detune.value = Math.random() * 4 - 2;
    const g = ctx.createGain();
    const peak = 0.15 * a;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(peak, now + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g).connect(lp);
    o.start(now);
    o.stop(now + dur + 0.05);
  });
}
