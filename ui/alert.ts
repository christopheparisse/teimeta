/**
 * alert.ts
 * display functions
 */

/* use strict */

let saveAs = require('file-saver');
let picoModal = require('picomodal');

export function alertUser(s) {
    picoModal(s).show();
    //    dialog.showErrorBox('teiEdit', s);
}

export function alertUserModal(s, fun: any) {
    picoModal(s).afterClose(() => fun()).show();
}

export function promptUserModal(s, fun) {
    picoModal({
        content: "<p>" + s + "</p>" +
            "<p><input name='picomodalprompt' id='picomodalprompt'></input></p>" +
            "<p class='footer'>" +
            "<button class='cancel'>Cancel</button> " +
            "<button class='ok'>Ok</button>" +
            "</p>"
    }).afterCreate(modal => {
        modal.modalElem().addEventListener("click", evt => {
            if (evt.target && evt.target.matches(".ok")) {
                modal.close(true);
            } else if (evt.target && evt.target.matches(".cancel")) {
                modal.close(false);
            }
        });
    }).afterClose((modal, event) => {
        if (!event.detail) {
            fun('');
            modal.destroy();
            return;
        }
        let t:any = document.getElementById('picomodalprompt');
        if (t && t.value)
            fun(t.value);
        else
            fun('');
        modal.destroy();
    }).show();
}

export function askUserModal(s, fun) {
    picoModal({
        content: "<p>" + s + "</p>" +
            "<p class='footer'>" +
            "<button class='cancel'>Cancel</button> " +
            "<button class='ok'>Ok</button>" +
            "</p>"
    }).afterCreate(modal => {
        modal.modalElem().addEventListener("click", evt => {
            if (evt.target && evt.target.matches(".ok")) {
                modal.close(true);
            } else if (evt.target && evt.target.matches(".cancel")) {
                modal.close();
            }
        });
    }).afterClose((modal, event) => {
        fun(event.detail ? true : false);
    }).show();
}

export function askUserModalYesNoCancel(s, fun) {
    picoModal({
        content: "<p>" + s + "</p>" +
            "<p class='footer'>" +
            "<button class='yes'>Sauver</button>" +
            "<button class='no'>Ne pas sauver</button>" +
            "<button class='cancel'>Annuler</button> " +
            "</p>"
    }).afterCreate(modal => {
        modal.modalElem().addEventListener("click", evt => {
            if (evt.target && evt.target.matches(".yes")) {
                modal.close('yes');
            } else if (evt.target && evt.target.matches(".cancel")) {
                modal.close('cancel');
            } else if (evt.target && evt.target.matches(".no")) {
                modal.close('no');
            }
        });
    }).afterClose((modal, event) => {
        fun(event.detail);
    }).show();
}
