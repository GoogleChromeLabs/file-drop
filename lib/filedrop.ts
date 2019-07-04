// tslint:disable-next-line:max-line-length
function getMatchingItems(list: DataTransferItemList, acceptVal: string, multiple: boolean): DataTransferItem[] {
  const dataItems = Array.from(list);
  let results: DataTransferItem[];

  // Return the first item (or undefined) if our filter is for all files
  if (acceptVal === '') {
    results = dataItems.filter(item => item.kind === 'file');
    return (multiple) ? results : [results[0]];
  }

  const acceptsVals = acceptVal.toLowerCase().split(',');
  // Split accepts values by ',' then by '/'. Trim everything & lowercase.
  const acceptsMime = acceptsVals.map((accept) => {
    return accept.split('/').map(part => part.trim());
  }).filter(acceptParts => acceptParts.length === 2); // Filter invalid values

  const acceptsExtension = acceptsVals.filter((accept) => accept.startsWith('.'));

  const predicate = (item:DataTransferItem) => {
    if (item.kind !== 'file') return false;

    // 'Parse' the type.
    const [typeMain, typeSub] = item.type.toLowerCase().split('/').map(s => s.trim());

    for (const [acceptMain, acceptSub] of acceptsMime) {
      // Look for an exact match, or a partial match if * is accepted, eg image/*.
      if (typeMain === acceptMain && (acceptSub === '*' || typeSub === acceptSub)) {
        return true;
      }
    }

    const file = item.getAsFile();

    // Skip if we can't check the extension
    if (file === null) return false;

    for (const extension of acceptsExtension) {
      if (file.name.endsWith(extension)) return true;
    }

    return false;
  };

  results = dataItems.filter(predicate);
  if (!multiple) {
    results = [results[0]];
  }

  return results;
}

function getFileData(data: DataTransfer, accept: string, multiple: boolean): File[] {
  const dragDataItems = getMatchingItems(data.items, accept, multiple);
  const files: File[] = [];

  // This is because Map doesn't like the null type returned by getAsFile
  dragDataItems.forEach((item) => {
    const file = item.getAsFile();
    if (file === null) return;
    files.push(file);
  });

  return files;
}

// Safari and Edge don't quite support extending Event, this works around it.
function fixExtendedEvent(instance: Event, type: Function) {
  if (!(instance instanceof type)) {
    Object.setPrototypeOf(instance, type.prototype);
  }
}

interface FileDropEventInit extends EventInit {
  action: FileDropAccept;
  files: File[];
}

type FileDropAccept = 'drop' | 'paste';

export class FileDropEvent extends Event {
  private _action: FileDropAccept;
  private _files: File[];
  constructor(typeArg: string, eventInitDict: FileDropEventInit) {
    super(typeArg, eventInitDict);
    fixExtendedEvent(this, FileDropEvent);
    this._files = eventInitDict.files;
    this._action = eventInitDict.action;
  }

  get action() {
    return this._action;
  }

  get files() {
    return this._files;
  }
}

/*
  Example Usage.
  <file-drop
    accept='image/*'
    multiple | undefined
    class='drop-valid|drop-invalid'
  >
  [everything in here is a drop target.]
  </file-drop>

  dropElement.addEventListener('filedrop', (event) => console.log(event.detail))
*/
export class FileDropElement extends HTMLElement {

  private _dragEnterCount = 0;

  constructor() {
    super();

    // Bind
    this._onDragEnter = this._onDragEnter.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDrop = this._onDrop.bind(this);
    this._onPaste = this._onPaste.bind(this);

    this.addEventListener('dragover', event => event.preventDefault());
    this.addEventListener('drop', this._onDrop);
    this.addEventListener('dragenter', this._onDragEnter);
    this.addEventListener('dragend', () => this._reset());
    this.addEventListener('dragleave', this._onDragLeave);
    this.addEventListener('paste', this._onPaste);
  }

  get accept() {
    return this.getAttribute('accept') || '';
  }

  set accept(val: string) {
    this.setAttribute('accept', val);
  }

  get multiple() : string | null {
    return this.getAttribute('multiple');
  }

  set multiple(val: string | null) {
    this.setAttribute('multiple', val || '');
  }

  private _onDragEnter(event: DragEvent) {
    this._dragEnterCount += 1;
    if (this._dragEnterCount > 1) return;
    if (event.dataTransfer === null) {
      this.classList.add('drop-invalid');
      return;
    }

    // We don't have data, attempt to get it and if it matches, set the correct state.
    const items = event.dataTransfer.items;
    const matchingFiles = getMatchingItems(items, this.accept, (this.multiple !== null));
    const validDrop: boolean = event.dataTransfer && event.dataTransfer.items.length ?
      (matchingFiles[0] !== undefined) :
      // Safari doesn't give file information on drag enter, so the best we
      // can do is return valid.
      true;

    if (validDrop) {
      this.classList.add('drop-valid');
    } else {
      this.classList.add('drop-invalid');
    }
  }

  private _onDragLeave() {
    this._dragEnterCount -= 1;
    if (this._dragEnterCount === 0) {
      this._reset();
    }
  }

  private _onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer === null) return;
    this._reset();
    const action = 'drop';
    const files = getFileData(event.dataTransfer, this.accept, (this.multiple !== null));
    if (files === undefined) return;

    this.dispatchEvent(new FileDropEvent('filedrop', { action, files }));
  }

  private _onPaste(event: ClipboardEvent) {
    const action = 'paste';
    const files = getFileData(event.clipboardData, this.accept, (this.multiple !== undefined));
    if (files === undefined) return;

    this.dispatchEvent(new FileDropEvent('filedrop', { action, files }));
  }

  private _reset() {
    this._dragEnterCount = 0;
    this.classList.remove('drop-valid');
    this.classList.remove('drop-invalid');
  }
}

customElements.define('file-drop', FileDropElement);

// Keeping JSX happy
declare global {
  interface HTMLElementEventMap {
    'filedrop': FileDropEvent;
  }

  namespace JSX {
    interface IntrinsicElements {
      'file-drop': FileDropAttributes;
    }

    interface FileDropAttributes extends HTMLAttributes {
      accept?: string;
      onfiledrop?: ((this: FileDropElement, ev: FileDropEvent) => any) | null;
    }
  }
}
