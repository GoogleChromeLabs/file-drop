import * as FileDrop from './index';


export = FileDrop;

declare global {
  interface HTMLElementEventMap {
    'filedrop': FileDrop.FileDropEvent;
  }

  namespace JSX {
    interface IntrinsicElements {
      'file-drop': FileDropAttributes;
    }

    interface FileDropAttributes extends HTMLAttributes {
      accept?: string;
      onfiledrop?: ((this: FileDrop.FileDrop, ev: FileDrop.FileDropEvent) => any) | null;
    }
  }
}
