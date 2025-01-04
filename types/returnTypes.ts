export type Option<T> = T | undefined;

export type Result<T, E> = { success: true; value: T } | {
  success: false;
  error: E;
};

export function ResultOk<T>(value: T): Result<T, never> {
  return { success: true as const, value };
}

export function ResultErr<E>(error: E): Result<never, E> {
  return { success: false as const, error };
}
