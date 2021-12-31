export type EntryType<Array extends readonly unknown[]> = Array extends readonly (infer Element)[] ? Element : never;
