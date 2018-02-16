form-handler
============

Give this constructor a set of form field elements and it will allow you to run valiadation, read the values, enable, disable, reset, and more.


To get started
--------------

### CommonJS

```
$ npm install form-handler
```

```js
var FormFields = require('form-handler');
```

### Browser Global

```html
<script src="https://code.jquery.com/jquery-3.0.0.min.js"></script>
<script src="TheC2Group/event-handler.js"></script>
<script src="iife/form-handler.js"></script>
```

### Initialize

```js
var fields = new FormFields($(':input').toArray());
```


Customizing
-----------

Data attributes on the form fields do all the work of customizing the validation per item.

```html
// required name
<input name="name" type="text" data-validation="required">

// required and valid email
<input name="email" type="text" data-validation="required email">
```

List of validation options:

* required
* blank
* email
* checked
* unchecked

*required and blank are essentially the same thing as checked and unchecked. a checkbox's values can only be 'on' and ''.

Use the regex attribute for more control.

```html
// limit to only numbers
<input name="age" type="text" data-regex="^[0-9]*$">

// must contain a weekday (of course, this should be a `select`)
<input name="weekday" type="text" data-regex="^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$" data-regex-flags="i">
```

Force an input to match another.

```html
<input name="email" type="text">
<input name="confirm-email" type="text" data-match="email">
```

Works on `select`, `type="checkbox"`, and `type="radio"`. For radio groups, apply the data attributes to the first radio element.


API
---

All variables in code examples continue from previous examples.

```js
// get any field instance by name
var email = fields.field['email'];

// get an array of fields
console.log(fields.fields.length); // 6
```

List of arrays on `fields`:

* texts
* selects
* checkboxes
* radioGroups
* fields

List of methods on `fields`:

* getValue(name, refresh)
* refresh() // "refresh" always refers to reseting the value property from the DOM element `value`.
* disable()
* enable()
* readonly()
* editable()
* validate(refresh, dirty) // returns array of invalid fields
* reset()
* read(refresh)
* changes(refresh)
* startOver(reset) // all fields are back to pristine and `value` equals `original`.

List of properties on field instance `email`:

* type
* $el
* els
* el
* form
* name
* disabled
* isReadonly
* value
* original
* isPristine
* status
* fails
* isValid

List of methods on field instance `email`:

* refresh()
* validate(dirty)
* getValue(refresh)
* setValue(value)
* disable()
* enable()
* readonly()
* editable()


Validation
----------

All validation is reflected on the field element on the `data-status` attribute.

Before the user has changed any values.

```html
<input name="name" type="text" data-validation="required" data-status="pristine">
```

After the user has updated the field.

```html
<input name="name" type="text" data-validation="required" value="Brian" data-status="valid">
```

If "Brian" is removed or `validation(true)` is called before user input...

```html
<input name="name" type="text" data-validation="required" value="" data-status="invalid required">
```

The types of validation errors are always listed after "invalid".

```html
<input name="confirm-email" type="text" data-validation="required email" data-match="email" data-regex="^{5,30}$" value="" data-status="invalid required email match regex">
```

Use `data-status` to style the input. An easy way to add error messages is to use this CSS:

```css
[data-status~="invalid"] ~ .errorMessage.all,
[data-status~="required"] ~ .errorMessage.required,
[data-status~="email"] ~ .errorMessage.email,
[data-status~="regex"] ~ .errorMessage.regex,
[data-status~="match"] ~ .errorMessage.match {
    visibility: visible;
}
```


License
-------

MIT © [The C2 Group](https://c2experience.com)
