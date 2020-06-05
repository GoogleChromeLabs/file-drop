# file-drop Custom Element

The file drop custom element is a simple Custom Element that accepts `File` objects being
dropped on it and fires a dedicated event `onfiledrop` when a successful drop occurs.

## Installation

`npm i file-drop-element`

## Demo

You can try a quick demo of this element on [glitch](https://file-drop-element.glitch.me/).

## Usage

### Directly as a module

Copy from `node_modules` in to a local directory.

```HTML
<script src='file-drop.mjs' type='module'></script>

<file-drop>

  Drop file here

</file-drop>
```

### Directly as a UMD, for non-ES6 Module supporting browsers

```HTML
<script src='file-drop.umd.js'></script>

<file-drop>

  Drop file here

</file-drop>
```

### Respond to when a file is dropped on the element

When a user has succesfully dropped a file on to the element, the 
element will emit a `filedrop` event. The `filedrop` event
contains a `file` property which is a direct reference to the `File`
that was dropped.

```HTML
<file-drop id="dropTarget">Drop a file here</file-drop>

<script>
dropTarget.addEventListener('filedrop', (e) => {
  dropTarget.textContent = e.file.name;
});
</script>
```

Note: if more than one file is dropped on the element, only the first file
will be included on the event.

### Only allow certain files to be dropped on the element.

The element will accept any `drop` event that has the `.dataTransfer` object
populated with _any_ file. If you want to control the types of files that 
can be dropped on to the element, use the same syntax that `<input>` elements
use when the `accept` attribute is set, that is:

* `<file-drop>` - any file
* `<file-drop accept='image/*'>` - all images
* `<file-drop accept='image/png'>` - only Images that have the MIME-type of a PNG.

### Allow multiple files to be dropped

The element can accept multiple files being dropped or pasted on to the element.
By default the element will only accept return the first file if the user drops
multiple files on it. If you want to receive multiple files in the event you can
add the `multiple` attribute to the element.

```HTML
<file-drop multiple>

  Drop file here

</file-drop>
```

If you add an `accept` attribute alongside the `multiple` element, the
`onfiledrop` event will only trigger if there is at least one file that matches
the criteria. It will return a filtered list of files where each file will match
the value in the `accept` attribute.

```HTML
<file-drop multiple accept='image/*'>

  Drop file here

</file-drop>
```

### Styling

The element is an `inline` display element and it can be controlled like any normal
element. The element does not use Shadow DOM so there are no internal elements
to style.

The element will add two classes `drop-valid` and `drop-invalid` to the element
depending on the mime-type of the file that is currently being dragged over the
element.

```HTML
<style>

file-drop.drop-valid {
  background-color: green;
}

file-drop.drop-invalid {
  background-color: red;
}

</style>
```
