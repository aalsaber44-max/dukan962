import { deleteField } from 'firebase/firestore';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype;

export const stripUndefined = <T,>(value: T): T => {
  // داخل المصفوفات: عناصر undefined تُزال (Firestore يرفض undefined في أي موضع،
  // والمواضع الفارغة في مصفوفات مثل الصور لا معنى لها أصلاً)
  if (Array.isArray(value)) {
    return value
      .filter((v) => v !== undefined)
      .map((v) => stripUndefined(v)) as unknown as T;
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    ) as T;
  }
  return value;
};

export const toUpdateData = (data: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      v === undefined ? deleteField() : stripUndefined(v),
    ])
  );
