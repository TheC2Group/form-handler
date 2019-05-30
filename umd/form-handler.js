/*!
 * form-handler
 * https://github.com/TheC2Group/form-handler
 * @version 2.2.1
 * @license MIT (c) The C2 Group (c2experience.com)
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('c2-event-handler')) :
    typeof define === 'function' && define.amd ? define(['jquery', 'c2-event-handler'], factory) :
    (global = global || self, global.FormFields = factory(global.jQuery, global.c2EventHandler));
}(this, function ($, eventHandler) { 'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    eventHandler = eventHandler && eventHandler.hasOwnProperty('default') ? eventHandler['default'] : eventHandler;

    var attrs = {
      status: 'data-status',
      validation: 'data-validation',
      regex: 'data-regex',
      regexFlags: 'data-regex-flags',
      match: 'data-match'
    };
    var fieldNumber = 0;
    var emailRE = /^\S+@\S+\.\S+$/;

    var isBlank = function isBlank(val) {
      return val === '';
    };

    var isNotBlank = function isNotBlank(val) {
      return !isBlank(val);
    };

    var validation = {
      required: isNotBlank,
      blank: isBlank,
      email: function email(val) {
        if (typeof val !== 'string' || val.length === 0) return true;
        return emailRE.test(val);
      },
      checked: isNotBlank,
      unchecked: isBlank
    };

    var validate = function validate() {
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
      this.isValid = fails.length === 0;
    };

    var update = function update() {
      var status = 'pristine';

      if (!this.isPristine) {
        status = this.isValid ? 'valid' : 'invalid ' + this.fails.join(' ');
      }

      if (status !== this.status) {
        this.status = status;
        this.$el.attr(attrs.status, status);
      }
    };

    var refreshField = function refreshField() {
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

    var validateField = function validateField(dirty) {
      if (dirty) {
        this.isPristine = false;
      }

      validate.call(this);
      update.call(this);
    };

    var getFieldValue = function getFieldValue(refresh) {
      if (this.disabled) return '';

      if (refresh) {
        refreshField.call(this);
      }

      return this.value;
    };

    var setFieldValue = function setFieldValue(value) {
      if (this.value === value) return;

      if (this.type === 'checkbox') {
        this.$el.prop('checked', value);
      } else if (this.type === 'radio') {
        this.els.forEach(function (el) {
          el.checked = el.value === value;
        }, this);
      } else {
        this.$el.val(value);
      }

      this.value = value;
      this.form.emit('change:' + this.name, this.value);
    };

    var disableField = function disableField() {
      this.$el.prop('disabled', true);
      this.disabled = true;
      validate.call(this);
      update.call(this);
    };

    var enableField = function enableField() {
      this.$el.prop('disabled', false);
      this.disabled = false;
    };

    var readonlyField = function readonlyField() {
      this.isReadonly = true;

      if (this.type === 'select' || this.type === 'radio') {
        this.$el.attr('readonly', 'true');
        return;
      }

      this.$el.prop('readonly', true);
      validate.call(this);
      update.call(this);
    };

    var editableField = function editableField() {
      this.isReadonly = false;

      if (this.type === 'select' || this.type === 'radio') {
        this.$el.removeAttr('readonly');
        return;
      }

      this.$el.prop('readonly', false);
    };

    var fieldMixin = function fieldMixin(field, form) {
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
      this.regex = regex ? new RegExp(regex, regexFlags) : null;
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
    var ignoreKeys = [16, // shift
    17, // control
    18, // alt
    19, // pause/break
    20, // caps lock
    33, // page up
    34, // page down
    35, // end
    36, // home
    37, // left arrow
    39 // right arrow
    ];

    var textKeyup = function textKeyup(e) {
      if (ignoreKeys.indexOf(e.which) > -1) return;
      this.value = this.$el.val();
      validate.call(this);
      update.call(this);
      this.form.emit('change:' + this.name, this.value);
    };

    var textBlur = function textBlur() {
      this.value = this.$el.val();

      if (this.original !== this.value) {
        this.isPristine = false;
      }

      validate.call(this);
      update.call(this);
      this.form.emit('change:' + this.name, this.value);
    };

    var TextField = function TextField(field, form) {
      this.type = 'input';
      fieldMixin.call(this, field, form);
      this.$el.on('keyup', textKeyup.bind(this));
      this.$el.on('blur', textBlur.bind(this));
    };

    $.extend(TextField.prototype, fieldProto);

    var onChange = function onChange() {
      if (this.disabled || this.isReadonly) return;
      this.value = getFieldValue.call(this, true);
      this.isPristine = false;
      validate.call(this);
      update.call(this);
      this.form.emit('change:' + this.name, this.value);
    };

    var Select = function Select(field, form) {
      this.type = 'select';
      fieldMixin.call(this, field, form);
      this.$el.on('change', onChange.bind(this));
    };

    $.extend(Select.prototype, fieldProto);

    var Checkbox = function Checkbox(field, form) {
      this.type = 'checkbox';
      fieldMixin.call(this, field, form);
      this.$el.on('change', onChange.bind(this));
    };

    $.extend(Checkbox.prototype, fieldProto);

    var Radio = function Radio(fields, form) {
      this.type = 'radio';
      fieldMixin.call(this, fields, form);
      this.$el.on('change', onChange.bind(this));
    };

    $.extend(Radio.prototype, fieldProto);

    var getValue = function getValue(name, refresh) {
      var field = this.field[name];

      if (!field) {
        return null;
      }

      return field.getValue(refresh);
    };

    var createTextField = function createTextField(el) {
      var field = new TextField(el, this);
      this.texts.push(field);
      this.fields.push(field);
      this.field[field.name] = field;
    };

    var createSelect = function createSelect(el) {
      var field = new Select(el, this);
      this.selects.push(field);
      this.fields.push(field);
      this.field[field.name] = field;
    };

    var createCheckbox = function createCheckbox(el) {
      var field = new Checkbox(el, this);
      this.checkboxes.push(field);
      this.fields.push(field);
      this.field[field.name] = field;
    };

    var createRadio = function createRadio(el) {
      var name = el.name;
      if (!name.length) return;

      if (!this.radioElements[name]) {
        this.radioElements[name] = [];
      }

      this.radioElements[name].push(el);
    };

    var createRadioGroups = function createRadioGroups() {
      Object.keys(this.radioElements).forEach(function (name) {
        var field = new Radio(this.radioElements[name], this);
        this.radioGroups.push(field);
        this.fields.push(field);
        this.field[name] = field;
      }, this);
    };

    var categorize = function categorize(field) {
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

    var Fields = function Fields(fields) {
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

    return Fields;

}));
