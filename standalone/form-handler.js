(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FormFields = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * Event Handler - create event emitters
 * https://github.com/TheC2Group/event-handler
 * @version 2.3.1
 * @license MIT (c) The C2 Group (c2experience.com)
 */

var eventHandler = (function () {
    'use strict';

    var on = function (event, fn) {
        if (typeof event !== 'string' || !event.length || typeof fn === 'undefined') return;

        if (event.indexOf(' ') > -1) {
            event.split(' ').forEach(function (eventName) {
                on.call(this, eventName, fn);
            }, this);
            return;
        }

        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(fn);
    };

    var off = function (event, fn) {
        if (typeof event !== 'string' || !event.length) return;

        if (event.indexOf(' ') > -1) {
            event.split(' ').forEach(function (eventName) {
                off.call(this, eventName, fn);
            }, this);
            return;
        }

        this._events = this._events || {};

        if (event in this._events === false) return;

        if (typeof fn === 'undefined') {
            delete this._events[event];
            return;
        }

        var index = this._events[event].indexOf(fn);
        if (index > -1) {
            if (this._events[event].length === 1) {
                delete this._events[event];
            } else {
                this._events[event].splice(index, 1);
            }
        }
    };

    var emit = function (event /* , args... */) {
        var args = Array.prototype.slice.call(arguments, 1);

        var lastIndex = event.lastIndexOf(':');
        if (lastIndex > -1) {
            emit.call(this, event.substring(0, lastIndex), args);
        }

        this._events = this._events || {};

        if (event in this._events === false) return;

        this._events[event].forEach(function (fn) {
            fn.apply(this, args);
        }, this);
    };

    var EventConstructor = function () {};

    var proto = EventConstructor.prototype;
    proto.on = on;
    proto.off = off;
    proto.emit = emit;

    // legacy extensions
    proto.bind = on;
    proto.unbind = off;
    proto.trigger = emit;

    var handler = function (_class) {

        // constructor
        if (arguments.length === 0) {
            return new EventConstructor();
        }

        // mixin
        if (typeof _class === 'function') {
            _class.prototype.on = on;
            _class.prototype.off = off;
            _class.prototype.emit = emit;
        }

        if (typeof _class === 'object') {
            _class.on = on;
            _class.off = off;
            _class.emit = emit;
        }

        return _class;
    };

    return handler;
}());

// export commonjs
if (typeof module !== 'undefined' && ('exports' in module)) {
    module.exports = eventHandler;
}

},{}],2:[function(require,module,exports){
/*!
 * Form Handler
 * https://github.com/TheC2Group/form-handler
 * @version 2.0.0
 * @license MIT (c) The C2 Group (c2experience.com)
 */

'use strict';

var $ = jQuery || require('jquery');
var eventHandler = require('c2-event-handler');

var attrs = {
    status: 'data-status',
    validation: 'data-validation',
    regex: 'data-regex',
    regexFlags: 'data-regex-flags',
    match: 'data-match'
};

var fieldNumber = 0;
var emailRE = /^\S+@\S+\.\S+$/;

var isBlank = function (val) {
    return val === '';
};

var isNotBlank = function (val) {
    return !isBlank(val);
};

var validation = {
    required: isNotBlank,
    blank: isBlank,
    email: function (val) {
        if (typeof val !== 'string' || val.length === 0) return true;
        return emailRE.test(val);
    },
    checked: isNotBlank,
    unchecked: isBlank
};

var validate = function () {
    if (this.disabled || this.isReadonly) {
        this.fails = [];
        this.isValid = true;
        return;
    }
    var val = this.value;
    var fails = [];
    this.validation.forEach(function (test) {
        if (!validation[test](val)) {
            fails.push(test);
        }
    });
    if (typeof val === 'string' && val.length > 0 && this.regex !== null && !this.regex.test(val)) {
        fails.push('regex');
    }
    if (this.match && getValue.call(this.form, this.match) !== val) {
        fails.push('match');
    }
    this.fails = fails;
    this.isValid = (fails.length === 0);
};

var update = function () {
    var status = 'pristine';
    if (!this.isPristine) {
        status = (this.isValid) ? 'valid' : 'invalid ' + this.fails.join(' ');
    }

    if (status !== this.status) {
        this.status = status;
        this.$el.attr(attrs.status, status);
    }
};

var refreshField = function () {
    if (this.type === 'checkbox') {
        this.value = this.$el.prop('checked') ? 'on' : '';
        return;
    }
    if (this.type === 'radio') {
        this.els.forEach(function (el) {
            if (el.checked) {
                this.value = el.value;
            }
        }, this);
        return;
    }
    this.value = this.$el.val();
};

var validateField = function (dirty) {
    if (dirty) {
        this.isPristine = false;
    }
    validate.call(this);
    update.call(this);
};

var getFieldValue = function (refresh) {
    if (this.disabled) return '';
    if (refresh) {
        refreshField.call(this);
    }
    return this.value;
};

var setFieldValue = function (value) {
    if (this.value === value) return;
    if (this.type === 'checkbox') {
        this.$el.prop('checked', value);
    } else if(this.type === 'radio') {
        this.els.forEach(function (el) {
            el.checked = (el.value === value);
        }, this);
    } else {
        this.$el.val(value);
    }
    this.value = value;
    this.form.emit('change:' + this.name, this.value);
};

var disableField = function () {
    this.$el.prop('disabled', true);
    this.disabled = true;
    validate.call(this);
    update.call(this);
};

var enableField = function () {
    this.$el.prop('disabled', false);
    this.disabled = false;
};

var readonlyField = function () {
    this.isReadonly = true;
    if (this.type === 'select' || this.type === 'radio') {
        this.$el.attr('readonly', 'true');
        return;
    }
    this.$el.prop('readonly', true);
    validate.call(this);
    update.call(this);
};

var editableField = function () {
    this.isReadonly = false;
    if (this.type === 'select' || this.type === 'radio') {
        this.$el.removeAttr('readonly');
        return;
    }
    this.$el.prop('readonly', false);
};

var fieldMixin = function (field, form) {
    var $el = $(field);
    var validation = $el.attr(attrs.validation);
    var regex = $el.attr(attrs.regex);
    var regexFlags = $el.attr(attrs.regexFlags);

    this.$el = $el;
    if (Array.isArray(field)) {
        this.els = field;
        this.el = field[0];
    } else {
        this.els = [field];
        this.el = field;
    }
    this.form = form;
    this.name = this.el.name || 'field_' + (fieldNumber += 1);
    this.disabled = $el.prop('disabled');
    this.isReadonly = $el.prop('readonly');
    this.value = '';
    getFieldValue.call(this, true);
    this.original = this.value;
    this.validation = validation ? validation.split(' ') : [];
    this.regex = (regex) ? new RegExp(regex, regexFlags) : null;
    this.match = $el.attr(attrs.match);
    this.isPristine = true;
    validate.call(this);
    this.status = '';
    update.call(this);
};

var fieldProto = {
    refresh: refreshField,
    validate: validateField,
    getValue: getFieldValue,
    setValue: setFieldValue,
    disable: disableField,
    enable: enableField,
    readonly: readonlyField,
    editable: editableField
};

var ignoreKeys = [
    16, // shift
    17, // control
    18, // alt
    19, // pause/break
    20, // caps lock
    33, // page up
    34, // page down
    35, // end
    36, // home
    37, // left arrow
    39  // right arrow
];

var textKeyup = function (e) {
    if (ignoreKeys.indexOf(e.which) > -1) return;
    this.value = this.$el.val();
    validate.call(this);
    update.call(this);
    this.form.emit('change:' + this.name, this.value);
};

var textBlur = function () {
    this.value = this.$el.val();
    if (this.original !== this.value) {
        this.isPristine = false;
    }
    validate.call(this);
    update.call(this);
    this.form.emit('change:' + this.name, this.value);
};

var TextField = function (field, form) {
    this.type = 'input';
    fieldMixin.call(this, field, form);
    this.$el.on('keyup', textKeyup.bind(this));
    this.$el.on('blur', textBlur.bind(this));
};

$.extend(TextField.prototype, fieldProto);

var onChange = function () {
    if (this.disabled || this.isReadonly) return;
    this.value = getFieldValue.call(this, true);
    this.isPristine = false;
    validate.call(this);
    update.call(this);
    this.form.emit('change:' + this.name, this.value);
};

var Select = function (field, form) {
    this.type = 'select';
    fieldMixin.call(this, field, form);
    this.$el.on('change', onChange.bind(this));
};

$.extend(Select.prototype, fieldProto);

var Checkbox = function (field, form) {
    this.type = 'checkbox';
    fieldMixin.call(this, field, form);
    this.$el.on('change', onChange.bind(this));
};

$.extend(Checkbox.prototype, fieldProto);

var Radio = function (fields, form) {
    this.type = 'radio';
    fieldMixin.call(this, fields, form);
    this.$el.on('change', onChange.bind(this));
};

$.extend(Radio.prototype, fieldProto);

var getValue = function (name, refresh) {
    var field = this.field[name];
    if (!field) {
        return null;
    }
    return field.getValue(refresh);
};

var createTextField = function (el) {
    var field = new TextField(el, this);

    this.texts.push(field);
    this.fields.push(field);
    this.field[field.name] = field;
};

var createSelect = function (el) {
    var field = new Select(el, this);

    this.selects.push(field);
    this.fields.push(field);
    this.field[field.name] = field;
};

var createCheckbox = function (el) {
    var field = new Checkbox(el, this);

    this.checkboxes.push(field);
    this.fields.push(field);
    this.field[field.name] = field;
};

var createRadio = function (el) {
    var name = el.name;
    if (!name.length) return;

    if (!this.radioElements[name]) {
        this.radioElements[name] = [];
    }

    this.radioElements[name].push(el);
};

var createRadioGroups = function () {
    Object.keys(this.radioElements).forEach(function (name) {
        var field = new Radio(this.radioElements[name], this);

        this.radioGroups.push(field);
        this.fields.push(field);
        this.field[name] = field;
    }, this);
};

var categorize = function (field) {

    if (field.tagName === 'INPUT') {

        if (field.type === 'button' || field.type === 'submit' || field.type === 'reset') return;

        if (field.type === 'checkbox') {
            createCheckbox.call(this, field);
            return;
        }

        if (field.type === 'radio') {
            createRadio.call(this, field);
            return;
        }

        createTextField.call(this, field);
        return;
    }

    if (field.tagName === 'TEXTAREA') {
        createTextField.call(this, field);
        return;
    }

    if (field.tagName === 'SELECT') {
        createSelect.call(this, field);
        return;
    }
};

var Fields = function (fields) {
    if (!Array.isArray(fields)) {
        console.error('The first FormFields param needs to be an array.');
        return;
    }

    this.texts = [];
    this.selects = [];
    this.checkboxes = [];
    this.radioElements = {};
    this.radioGroups = [];
    this.fields = [];
    this.field = {};

    fields.forEach(categorize, this);
    createRadioGroups.call(this);
};

eventHandler(Fields);

Fields.prototype.getValue = getValue;

Fields.prototype.refresh = function () {
    this.fields.forEach(function (field) {
        field.refresh();
    });
};

Fields.prototype.disable = function () {
    this.fields.forEach(function (field) {
        field.disable();
    });
};

Fields.prototype.enable = function () {
    this.fields.forEach(function (field) {
        field.enable();
    });
};

Fields.prototype.readonly = function () {
    this.fields.forEach(function (field) {
        field.readonly();
    });
};

Fields.prototype.editable = function () {
    this.fields.forEach(function (field) {
        field.editable();
    });
};

Fields.prototype.validate = function (refresh, dirty) {
    return this.fields.filter(function (field) {
        if (refresh) {
            field.refresh();
        }
        field.validate(dirty);
        return !field.isValid;
    });
};

Fields.prototype.reset = function () {
    this.fields.forEach(function (field) {
        field.setValue(field.original);
    });
};

Fields.prototype.read = function (refresh) {
    var values = {};
    this.fields.forEach(function (field) {
        values[field.name] = field.getValue(refresh);
    });
    return values;
};

Fields.prototype.changes = function (refresh) {
    var values = {};
    this.fields.forEach(function (field) {
        var val = field.getValue(refresh);
        if (val !== field.original) {
            values[field.name] = val;
        }
    });
    return values;
};

Fields.prototype.startOver = function (reset) {
    this.fields.forEach(function (field) {
        if (reset) {
            field.setValue(field.original);
        } else {
            field.original = field.getValue();
        }
        field.isPristine = true;
        update.call(field);
    });
};

$(document).on('focus mousedown mouseup click change', 'select[readonly], input[type="checkbox"][readonly], input[type="radio"][readonly]', function (e) {
    e.preventDefault();
});

module.exports = Fields;

},{"c2-event-handler":1,"jquery":undefined}]},{},[2])(2)
});