var $ = require('jquery');
var FormFields = require('../../cjs/form-handler.js');

var $inputs = $(':input');

var fields = new FormFields($inputs.toArray());

function submit() {
    var errorFields = fields.validate(true, true);

    console.log(errorFields);

    if (errorFields.length === 0) {
        fields.startOver(true);
        return;
    }

    errorFields[0].el.focus();
}

$inputs.on('keypress', function (e) {
    if (e.which === 13) {
        e.preventDefault();
        submit();
    }
});

$('.Button').on('click', function (e) {
    e.preventDefault();
});

$('.Submit').on('click', submit);

$('.StartOver').on('click', function () {
    fields.startOver();
});

$('.Reset').on('click', function () {
    fields.startOver(true);
});

$('.LogValues').on('click', function () {
    console.log(fields.read());
});

$('.LogChanges').on('click', function () {
    console.log(fields.changes());
});

$('.Enable').on('click', function () {
    fields.enable();
});

$('.Disable').on('click', function () {
    fields.disable();
});

$('.ReadOnly').on('click', function () {
    fields.readonly();
});

$('.Editable').on('click', function () {
    fields.editable();
});

//formListener('.Wrap', fields);
