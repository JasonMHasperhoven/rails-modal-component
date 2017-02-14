## Modal

A modal component for Ruby on Rails, to open up a confirm dialog. Allows nested modals as well.

Sets `will-change` css property before animation for optimal performance.

### Installation

Requires SCSS and CommonJS.

Simply copy the files to your project!

#### Modal parameters

The modal hash supports `id: options` whereby the options support the following parameters:

| Parameter    |	Type	 | Description	                                                      | Required |
|--------------|---------|--------------------------------------------------------------------|----------|
| html         | string  | HTML of the modal, recommended to render a partial. When this is present all the other parameters will become redundant. | no |
| close_button | boolean | The close button of the modal. Default is `true`, which shows only on small devices (mobile) | no |
| dismissable  | boolean | Determines whether the modal can be dismissed by clicking outside of the modal. Default is `true`. | no       |
| title	       | string  | The title of the modal.                                            | yes      |
| content	     | string  | The content of the modal.                                          | yes      |
| buttons	     | hash    | Properties of the buttons. See buttons options.                    | yes      |

#### `buttons` parameters

| Parameter  |	Type	  | Description	                                                     | Required |
|------------|----------|------------------------------------------------------------------|----------|
| primary    | hash     | Properties of the button. See button options.                    | yes      |
| secondary  | hash     | Properties of the button. See button options.                    | no       |

#### `button` parameters

| Parameter      |	Type	  | Description	                                                     | Required |
|----------------|----------|------------------------------------------------------------------|----------|
| href           | hash     | Properties of the tab’s label. See label parameters.             | yes      |
| value          | string   | The content of the tab component in HTML.                        | yes      |
| class_name     | string   | The class of the button element.                                 | no       |
| class_list     | array    | The class of the button element.                                 | no       |
| attributes     | hash     | The attributes of the button element.                            | no       |
| close_on_click | boolean  | When `true` clicking on this button will close the modal.        | no       |
| close_all_on_click | boolean  | When `true` clicking on this button will close all modals.   | no       |


### Examples

```
<%= render 'application/modal', modals: {
  'delete-card': {
    title: 'Delete card?',
    content:
     "<p>Do you wish to delete card:</p>
      <p>123</p>",
    buttons: {
      primary: {
        value: 'Confirm',
        attributes: {
          'data-card-id': '123'
        }
      },
      secondary: {
        value: 'Cancel',
        close_on_click: true
      }
    }
  },
  'delete-other-card': {
    title: 'Delete card?',
    content:
     "<p>Do you wish to delete card:</p>
      <p>321</p>",
    buttons: {
      primary: {
        value: 'Confirm',
        attributes: {
          'data-card-id': '321'
        }
      },
      secondary: {
        value: 'Cancel',
        close_on_click: true
      }
    }
  }
} %>
```

To toggle a modal you need to add the class `js-m-modal-toggle` and a data attribute `data-modal-id` with the value of the id of the modal which you wish to open to an element like so:

```
<a class="anchor js-m-modal-toggle" data-modal-id="delete-card">
  Toggle delete card modal
</a>
```

The class `js-m-modal-close` is available to close the active modal.
The class `js-m-modal-close-all` is available to close all the active modals.


#### Javascript

To fire a modal within javascript you will need to require/import the multi_modal file like so:

```
var modal = require('multi_modal');

// initialize after the dom element is loaded (Or inside $(document).ready() or window.onload())
modal.bootstrap();

modal.open('delete-card');

modal.close();

modal.closeAll();
```

The method `open()` allows you to leave the id parameter blank, but then it will fire up the first modal in the dom. The second parameter is a callback which fires once the animation is complete.
