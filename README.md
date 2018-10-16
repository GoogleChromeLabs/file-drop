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

### Only allow certain files to be dropped on the element.

The element will accept any `drop` event that has the `.dataTransfer` object
populated with _any_ file. If you want to control the types of files that 
can be dropped on to the element, use the same syntax that `<input>` elements
use when the `accept` attribute is set, that is:

* `<file-drop>` - any file
* `<file-drop accept='image/*'>` - all images
* `<file-drop accept='image/png'>` - only Images that have the MIME-type of a PNG.

### Styling

The element an `inline` display element and it can be controlled like any normal
element. The element does not use Shadow DOM so there are no internal elements
to style.

The element will add two classes `drop-valid` and `drop-invalid` to the element
depending on the mime-type of the file that is currently being dragged over the
element.

```
<style>

file-drop.drop-valid {
  background-color: green;
}

file-drop.drop-invalid {
  background-color: red;
}

</style>
```