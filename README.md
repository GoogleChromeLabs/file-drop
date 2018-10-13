# file-drop Custom Element

The file drop custom element is a simple Custom Element that accepts `File` objects being
dropped on it and fires a dedicated event `onfiledrop` when a successful drop occurs.

## Installation

`npm i file-drop-element`

## Usage

### Directly as a module

Copy from `node_modules` in to a local directory.

```
<script src='file-drop.mjs' type='module'></script>

<file-drop>

  Drop file here

</file-drop>
```

### Directly as a UMD, for non-ES6 Module supporting browsers

```
<script src='file-drop.umd.js'></script>

<file-drop>

  Drop file here

</file-drop>
```