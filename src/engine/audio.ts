let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let muted = false;

type Sound = { buffer: AudioBuffer; instances: Set<AudioBufferSourceNode> };
const sounds = new Map<string, Sound>();

export function initAudio(): void {
  ctx = new AudioContext();
  gain = ctx.createGain();
  gain.connect(ctx.destination);
}

export async function registerSound(key: string, path: string): Promise<void> {
  if (!ctx) throw new Error("audio: initAudio() not called");

  const url = `${import.meta.env.BASE_URL}${path}`;
  const res = await fetch(url);
  const arr = await res.arrayBuffer();
  const buffer = await ctx.decodeAudioData(arr);

  sounds.set(key, { buffer, instances: new Set() });
}

export function playSound(key: string, opts: { loop?: boolean } = {}): void {
  if (!ctx || !gain) throw new Error("audio: initAudio() not called");
  if (ctx.state === "suspended") ctx.resume();

  const sound = sounds.get(key);
  if (!sound) throw new Error(`audio: unknown key "${key}"`);

  const src = ctx.createBufferSource();
  src.buffer = sound.buffer;
  src.loop = opts.loop ?? false;
  src.connect(gain);

  sound.instances.add(src);
  src.onended = () => sound.instances.delete(src);
  src.start();
}

export function stopSound(key: string): void {
  const sound = sounds.get(key);
  if (!sound) return;

  for (const src of sound.instances) src.stop();
  sound.instances.clear();
}

export function setMuted(value: boolean): void {
  if (!gain) throw new Error("audio: initAudio() not called");

  muted = value;
  gain.gain.value = muted ? 0 : 1;
}

export function isMuted(): boolean {
  return muted;
}
