declare const unsafeWindow: Window & { [x: string]: any }
declare function GM_getValue<T>(key: string, defaultValue: T): T | null
declare function GM_setValue(key: string, value: any): void
