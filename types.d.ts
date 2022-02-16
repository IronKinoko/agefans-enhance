declare const unsafeWindow: Window & { [x: string]: any }
declare function GM_getValue<T>(key: string): T | undefined
declare function GM_getValue<T>(key: string, defaultValue: T): T
declare function GM_setValue(key: string, value: any): void
