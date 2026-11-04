import { deleteField } from 'firebase/firestore';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype;

/** يحذف كل قيمة undefined (بعمق) لأن Firestore يرفضها في addDoc / updateDoc */
export const stripUndefined = <T,>(value: T): T => {
  if (Array.isArray(value)) return value.map((v) => stripUndefined(v)) as unknown as T;
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    ) as T;
  }
  return value;
};

/** للتعديل: الحقل الذي صار undefined على المستوى الأول يُحذف من المستند فعلاً (deleteField)، والباقي يُنظَّف */
export const toUpdateData = (data: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === undefined ? deleteField() : stripUndefined(v)])
  );
