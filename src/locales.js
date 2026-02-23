/**
 * Translation helper t(key) and updateI18n().
 * DANCE_LOCALES is provided by legacy until we move it here.
 * Add or edit UI strings / languages in the object passed to setLocalesDict (or in legacy).
 */

import { state } from './state.js';

let _localesDict = { en: {} };

export function setLocalesDict(d) {
    _localesDict = d || _localesDict;
}

export function t(key) {
    const lang = state.language || 'en';
    const dict = _localesDict[lang] || _localesDict.en;
    const val = dict[key] || _localesDict.en[key] || `[${key}]`;
    return val;
}

export function updateI18n() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    const langIndicator = document.getElementById('lang-text');
    if (langIndicator) langIndicator.textContent = (state.language || 'EN').toUpperCase();
}
