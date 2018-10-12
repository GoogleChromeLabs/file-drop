/**
 * A decorator that binds values to their class instance.
 * @example
 * class C {
 *   @bind
 *   foo () {
 *     return this;
 *   }
 * }
 * let f = new C().foo;
 * f() instanceof C;    // true
 */
export declare function bind(target: any, propertyKey: string, descriptor: PropertyDescriptor): {
    get(): any;
};
interface FileDropEventInit extends EventInit {
    action: FileDropAccept;
    file: File;
}
declare type FileDropAccept = 'drop' | 'paste';
export declare class FileDropEvent extends Event {
    private _action;
    private _file;
    constructor(typeArg: string, eventInitDict: FileDropEventInit);
    readonly action: FileDropAccept;
    readonly file: File;
}
export declare class FileDrop extends HTMLElement {
    private _dragEnterCount;
    constructor();
    accept: string;
    private _onDragEnter;
    private _onDragLeave;
    private _onDrop;
    private _onPaste;
    private _reset;
}
export {};
