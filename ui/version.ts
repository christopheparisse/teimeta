/**
 * version.ts
 */

import * as alert from '../teiedit/alert';
import * as msg from '../msg/messages';

export let version = '0.6.9';
export let date = '03-03-2020';

export function about() {
    var s = msg.msg('versionname') + version + " - " + date + "</br></br>";
    s += msg.msg('shorthelp');
    alert.alertUser(s);
};
