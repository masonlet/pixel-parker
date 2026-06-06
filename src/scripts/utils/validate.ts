export function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function optBool(obj: Record<string, unknown>, key: string, ctx: string): boolean | undefined {
  const v = obj[key];
  if (v === undefined) return undefined;
  if (typeof v !== "boolean") throw new Error(`${ctx}: ${key} must be a boolean if present`);
  return v;
}

export function num(obj: Record<string, unknown>, key: string, ctx: string): number {
  const v = obj[key];
  if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(
    `${ctx}: ${key} must be a finite number`
  );
  return v;
}
export function optNum(obj: Record<string, unknown>, key: string, ctx: string): number | undefined {
  const v = obj[key];
  if (v === undefined) return undefined;
  if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(
    `${ctx}: ${key} must be a finite number if present`
  );
  return v;
}

export function str(obj: Record<string, unknown>, key: string, ctx: string): string {
  const v = obj[key];
  if (typeof v !== "string" || v.length === 0) throw new Error(
    `${ctx}: ${key} must be a non-empty string`
  );
  return v;
}
export function optStr(obj: Record<string, unknown>, key: string, ctx: string): string | undefined {
  const v = obj[key];
  if (v === undefined) return undefined;
  if (typeof v !== "string" || v.length === 0) throw new Error(
    `${ctx}: ${key} must be a non-empty string if present`
  );
  return v;
}

export function arr(obj: Record<string, unknown>, key: string, ctx: string): unknown[] {
  const v = obj[key];
  if (!Array.isArray(v)) throw new Error(`${ctx}: ${key} must be an array`);
  return v;
}

export function makeCollector() {
  const errors: string[] = [];
  return {
    errors,
    tryGet: <T>(fn: () => T): T | undefined => {
      try { return fn(); } catch (e) { errors.push((e as Error).message); return undefined; }
    },
  };
}

export type Collector = ReturnType<typeof makeCollector>;
