// tslint:disable-next-line:max-line-length
function firstMatchingItem(list: DataTransferItemList, acceptVal: string): DataTransferItem | undefined {
  // Return the first item (or undefined) if our filter is for all files
  if (acceptVal === '') {
    return Array.from(list).find(item => item.kind === 'file');
  }

  // Split accepts values by ',' then by '/'. Trim everything & lowercase.
  const accepts = acceptVal.toLowerCase().split(',').map((accept) => {
    return accept.split('/').map(part => part.trim());
  }).filter(acceptParts => acceptParts.length === 2); // Filter invalid values

  return Array.from(list).find((item) => {
    if (item.kind !== 'file') return false;

    // 'Parse' the type.
    const [typeMain, typeSub] = item.type.toLowerCase().split('/').map(s => s.trim());

    for (const [acceptMain, acceptSub] of accepts) {
      // Look for an exact match, or a partial match if * is accepted, eg image/*.
      if (typeMain === acceptMain && (acceptSub === '*' || typeSub === acceptSub)) {
        return true;
      }
    }
    return false;
  });
}

function getFileData(data: DataTransfer, accept: string): File | undefined {
  const dragDataItem = firstMatchingItem(data.items, accept);
  if (!dragDataItem) return;

  return dragDataItem.getAsFile() || undefined;
}

// Safari and Edge don't quite support extending Event, this works around it.
function fixExtendedEvent(instance: Event, type: Function) {
  if (!(instance instanceof type)) {
    Object.setPrototypeOf(instance, type.prototype);
  }
}

interface FileDropEventInit extends EventInit {
  action: FileDropAccept;
  file: File;
}

type FileDropAccept = 'drop' | 'paste';

export class FileDropEvent extends Event {
  private _action: FileDropAccept;
  private _file: File;
  constructor(typeArg: string, eventInitDict: FileDropEventInit) {
    super(typeArg, eventInitDict);
    fixExtendedEvent(this, FileDropEvent);
    this._file = eventInitDict.file;
    this._action = eventInitDict.action;
  }

  get action() {
    return this._action;
  }

  get file() {
    return this._file;
  }
}

/*
  Example Usage.
  <file-drop
    accept='image/*'
    class='drop-valid|drop-invalid'
  >
  [everything in here is a drop target.]
  </file-drop>

  dropElement.addEventListner('filedrop', (event) => console.log(event.detail))
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

  private _onDragEnter(event: DragEvent) {
    this._dragEnterCount += 1;
    if (this._dragEnterCount > 1) return;

    // We don't have data, attempt to get it and if it matches, set the correct state.
    const validDrop: boolean = event.dataTransfer.items.length ?
      !!firstMatchingItem(event.dataTransfer.items, this.accept) :
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
    this._reset();
    const action = 'drop';
    const file = getFileData(event.dataTransfer, this.accept);
    if (file === undefined) return;

    this.dispatchEvent(new FileDropEvent('filedrop', { action, file }));
  }

  private _onPaste(event: ClipboardEvent) {
    const action = 'paste';
    const file = getFileData(event.clipboardData, this.accept);
    if (file === undefined) return;

    this.dispatchEvent(new FileDropEvent('filedrop', { action, file }));
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
