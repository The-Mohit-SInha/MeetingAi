// This file has been disabled
// All KV store functionality has been removed

export function get(_key: string): Promise<any> {
  return Promise.resolve(null);
}

export function set(_key: string, _value: any): Promise<void> {
  return Promise.resolve();
}

export function del(_key: string): Promise<void> {
  return Promise.resolve();
}
