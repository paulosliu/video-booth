
(function () {
    for (el of document.querySelectorAll('.mdc-text-field'))
        new mdc.textField.MDCTextField(el);

    for (el of document.querySelectorAll('.mdc-select')) {
        new mdc.select.MDCSelect(el);
    }
})();