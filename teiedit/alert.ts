/**
 * @module alert.ts
 * @author Christophe Parisse
 * display functions
 */

let picoModal = require('picomodal');

/**
 * simple display of a blocking message without using window.alert()
 * @param {string} s text message
 */
export function alertUser(s) {
    picoModal(s).show();
}

/**
 * no parameter callback
 * @callback VoidCallback
 */

/**
 * simple display of a non-blocking message
 * @param {string} s text message
 * @param {VoidCallback} fun executed after closing the message
 */
export function alertUserModal(s, fun: any) {
    if (fun)
        picoModal(s).afterClose(fun).show();
    else
        picoModal(s).show();
}

/**
 * ok vs. cancel parameter callback
 * @callback OkCancelCallback
 * @param {string} s - ok / cancel provided to the callback
 */

/**
 * ask user for a yes / no answer and display a non-blocking message
 * @param {string} s text message
 * @param {OkCancelCallback} fun executed after closing the message - fun parameter contains response value
 */
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
        modal.modalElem().addEventListener("keydown", evt => {
            if (evt.key === "Enter" && !evt.target.matches(".cancel")) {
                modal.close(true);
            }
        });
    }).afterClose((modal, event) => {
        if (!event.detail) {
            fun('');
            modal.destroy();
            return;
        }
        let t:any = document.getElementById('picomodalprompt');
        if (t && t.value) {
            fun(t.value);
        } else {
            fun('');
        }
        modal.destroy();
    }).show();
}

/**
 * one open parameter callback
 * @callback TextCallback
 * @param {string} s - open text value provided to the callback
 */

/**
 * ask user for a text value and display a non-blocking message
 * @param {string} s text message
 * @param {TextCallback} fun executed after closing the message - fun parameter contains response value
 */
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
        modal.modalElem().addEventListener("keydown", evt => {
            if (evt.key === "Enter" && !evt.target.matches(".cancel")) {
                modal.close(true);
            }
        });
    }).afterClose((modal, event) => {
        fun(event.detail ? true : false);
    }).show();
}
