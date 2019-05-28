/* This is not included in the bundle; not sure if it is needed */
var formListener = (function ($) {
    'use strict';

    var attrs = {
        show: 'data-show',
        toggleShow: 'data-toggle-show',
        toggleEnable: 'data-toggle-enable'
    };

    var toggleShow = function ($el, actual, expected) {
        if (actual === expected) {
            $el.attr(attrs.show, 'true');
        } else {
            $el.attr(attrs.show, 'false');
        }
    };

    var toggleEnable = function (field, actual, expected) {
        if (actual === expected) {
            field.enable();
        } else {
            field.disable();
        }
    };

    return function (context, form) {
        var $context = $(context);

        $context.find('[' + attrs.toggleShow + ']').each(function () {
            var $el = $(this);
            var attr = $el.attr(attrs.toggleShow).split(':');
            var inputName = attr[0];
            var expectedValue = attr[1];

            toggleShow($el, form.getValue(inputName), expectedValue);

            form.on('change:' + inputName, function (val) {
                toggleShow($el, val, expectedValue);
            });
        });

        $context.find('[' + attrs.toggleEnable + ']').each(function () {
            var $el = $(this);
            var attr = $el.attr(attrs.toggleEnable).split(':');
            var inputName = attr[0];
            var expectedValue = attr[1];

            toggleEnable(form.field[$el.attr('name')], form.getValue(inputName), expectedValue);

            form.on('change:' + inputName, function (val) {
                toggleEnable(form.field[$el.attr('name')], val, expectedValue);
            });
        });
    };
}(window.jQuery || require('jquery')));

// export commonjs
if (typeof module !== 'undefined' && ('exports' in module)) {
    module.exports = formListener;
}
