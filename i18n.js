/**
 * Internationalization (i18n) module for Windows Disk Shrink Simulator
 * Handles language detection, switching, and applying translations
 */

(function() {
    'use strict';

    let currentLang = 'en';
    let translations = {};
    let languageMeta = {};
    let langButton = null;
    let langDropdown = null;

    function init() {
        if (typeof window.translations !== 'undefined') {
            translations = window.translations;
        }
        if (typeof window.languageMeta !== 'undefined') {
            languageMeta = window.languageMeta;
        }

        currentLang = detectLanguage();
        applyTranslations(currentLang);
        setupLanguageSelector();
    }

    function detectLanguage() {
        const savedLang = localStorage.getItem('preferredLanguage');
        if (savedLang && translations[savedLang]) {
            return savedLang;
        }

        const browserLang = navigator.language || navigator.userLanguage || 'en';
        const langCode = browserLang.split('-')[0].toLowerCase();

        const langMap = {
            'en': 'en', 'es': 'es', 'pt': 'pt', 'ru': 'ru',
            'ja': 'ja', 'zh': 'zh-CN', 'fr': 'fr', 'de': 'de',
            'it': 'it', 'ko': 'ko', 'ar': 'ar', 'hi': 'hi', 'nl': 'nl'
        };

        const mappedLang = langMap[langCode] || 'en';
        if (translations[mappedLang]) {
            return mappedLang;
        }

        const htmlLang = document.documentElement.lang;
        if (htmlLang && translations[htmlLang]) {
            return htmlLang;
        }

        return 'en';
    }

    function applyTranslations(lang) {
        if (!translations[lang]) {
            console.warn('Translations not available for language: ' + lang);
            return;
        }

        currentLang = lang;
        const t = translations[lang];
        const meta = languageMeta[lang] || { dir: 'ltr' };

        document.documentElement.dir = meta.dir;
        document.documentElement.lang = lang;

        if (t['page.title']) {
            document.title = t['page.title'];
        }

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && t['page.description']) {
            metaDesc.setAttribute('content', t['page.description']);
        }

        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            const key = el.getAttribute('data-i18n');
            let translation = t[key];
            
            // Handle array-style keys (e.g., edu.details.list.0 -> t[edu.details.list][0])
            if (!translation && key.includes('.')) {
                const parts = key.split('.');
                if (parts.length >= 3 && !isNaN(parts[parts.length - 1])) {
                    const arrayKey = parts.slice(0, -1).join('.');
                    const index = parseInt(parts[parts.length - 1], 10);
                    if (t[arrayKey] && Array.isArray(t[arrayKey]) && t[arrayKey][index] !== undefined) {
                        translation = t[arrayKey][index];
                    }
                }
            }
            
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.type === 'button' || el.type === 'submit') {
                        el.value = translation;
                    } else {
                        el.placeholder = translation;
                    }
                } else {
                    el.innerHTML = translation;
                }
            }
        });

        document.querySelectorAll('[data-i18n-attr]').forEach(function(el) {
            const attrs = el.getAttribute('data-i18n-attr').split(',');
            attrs.forEach(function(attr) {
                const parts = attr.split(':');
                if (parts.length === 2 && t[parts[1].trim()]) {
                    el.setAttribute(parts[0].trim(), t[parts[1].trim()]);
                }
            });
        });

        updateStatusMessages(t);
        updateLanguageSelectorButton(lang);
        localStorage.setItem('preferredLanguage', lang);
        window.dispatchEvent(new CustomEvent('languageApplied', { detail: { lang: lang } }));
    }

    function updateStatusMessages(t) {
        window.i18nMessages = {
            enterValues: t['msg.enterValues'],
            invalidTotal: t['msg.invalidTotal'],
            invalidAvailable: t['msg.invalidAvailable'],
            desiredExceeds: t['msg.desiredExceeds'],
            copied: t['msg.copied'],
            copyFailed: t['msg.copyFailed'],
            nothingToCopy: t['msg.nothingToCopy']
        };
    }

    function setupLanguageSelector() {
        const topbar = document.querySelector('.topbar');
        if (!topbar) return;

        const langContainer = document.createElement('div');
        langContainer.className = 'lang-selector';
        langContainer.style.cssText = 'position: relative; margin-left: auto;';

        langButton = document.createElement('button');
        langButton.className = 'lang-btn';
        langButton.setAttribute('aria-label', 'Select language');
        langButton.setAttribute('aria-haspopup', 'listbox');
        langButton.setAttribute('aria-expanded', 'false');
        langButton.type = 'button';
        langButton.style.cssText = 'background: var(--panel); border: 1px solid var(--line); border-radius: 999px; padding: 8px 12px; font-size: 13px; color: var(--text); cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,.08); transition: box-shadow 0.15s ease, border-color 0.15s ease;';

        langDropdown = document.createElement('div');
        langDropdown.className = 'lang-dropdown';
        langDropdown.setAttribute('role', 'listbox');
        langDropdown.setAttribute('aria-label', 'Available languages');
        langDropdown.style.cssText = 'position: absolute; top: 100%; right: 0; margin-top: 8px; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow); min-width: 200px; max-height: 300px; overflow-y: auto; z-index: 1000; display: none; opacity: 0; transform: translateY(-8px); transition: opacity 0.15s ease, transform 0.15s ease;';

        const langList = document.createElement('ul');
        langList.style.cssText = 'list-style: none; margin: 0; padding: 4px;';

        Object.entries(languageMeta).forEach(function(entry) {
            var code = entry[0];
            var meta = entry[1];
            var li = document.createElement('li');
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('role', 'option');
            btn.setAttribute('data-lang', code);
            btn.setAttribute('aria-selected', code === currentLang ? 'true' : 'false');
            btn.textContent = meta.nativeName + ' (' + meta.name + ')';
            btn.style.cssText = 'width: 100%; text-align: left; padding: 10px 12px; border: none; background: ' + (code === currentLang ? 'var(--winSeg)' : 'transparent') + '; color: ' + (code === currentLang ? '#fff' : 'var(--text)') + '; font-size: 13px; border-radius: 8px; cursor: pointer; transition: background 0.1s ease;';

            btn.addEventListener('mouseenter', function() {
                if (code !== currentLang) btn.style.background = 'var(--panel2)';
            });
            btn.addEventListener('mouseleave', function() {
                if (code !== currentLang) btn.style.background = 'transparent';
            });
            btn.addEventListener('click', function() {
                setLanguage(code);
                closeDropdown();
            });

            li.appendChild(btn);
            langList.appendChild(li);
        });

        langDropdown.appendChild(langList);
        langContainer.appendChild(langButton);
        langContainer.appendChild(langDropdown);

        var badge = topbar.querySelector('.badge');
        if (badge) {
            topbar.insertBefore(langContainer, badge);
        } else {
            topbar.appendChild(langContainer);
        }

        langButton.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDropdown();
        });

        document.addEventListener('click', function(e) {
            if (!langContainer.contains(e.target)) closeDropdown();
        });

        langButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDropdown();
            } else if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        langDropdown.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDropdown();
                langButton.focus();
            }
        });

        // FIX: populate the button (globe icon + native name + chevron).
        // applyTranslations() runs BEFORE the button exists, so it silently
        // skipped this step. Without this call the button stays empty.
        updateLanguageSelectorButton(currentLang);
    }

    function toggleDropdown() {
        var isOpen = langDropdown.style.display !== 'none';
        if (isOpen) closeDropdown(); else openDropdown();
    }

    function openDropdown() {
        langDropdown.style.display = 'block';
        langDropdown.offsetHeight;
        langDropdown.style.opacity = '1';
        langDropdown.style.transform = 'translateY(0)';
        langButton.setAttribute('aria-expanded', 'true');
        var arrow = langButton.querySelector('.lang-btn-arrow');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    }

    function closeDropdown() {
        langDropdown.style.opacity = '0';
        langDropdown.style.transform = 'translateY(-8px)';
        setTimeout(function() { langDropdown.style.display = 'none'; }, 150);
        langButton.setAttribute('aria-expanded', 'false');
        var arrow = langButton.querySelector('.lang-btn-arrow');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    }

    function updateLanguageSelectorButton(lang) {
        if (!langButton) return;
        var meta = languageMeta[lang] || { nativeName: lang };
        var nativeName = meta.nativeName;

        // Inline SVG globe icon (renders identically on every OS/browser,
        // unlike emoji which may be missing or look different per platform)
        var globeIcon =
            '<svg class="lang-btn-icon" width="16" height="16" viewBox="0 0 24 24" ' +
            'fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round" ' +
            'style="flex-shrink:0;" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="10"></circle>' +
            '<line x1="2" y1="12" x2="22" y2="12"></line>' +
            '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 ' +
            '15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>' +
            '</svg>';

        // Chevron that rotates 180° when the dropdown is open
        var chevron =
            '<svg class="lang-btn-arrow" width="10" height="10" viewBox="0 0 24 24" ' +
            'fill="none" stroke="currentColor" stroke-width="2.5" ' +
            'stroke-linecap="round" stroke-linejoin="round" ' +
            'style="flex-shrink:0; margin-left:4px; transition:transform .2s ease;" ' +
            'aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';

        langButton.innerHTML =
            globeIcon +
            '<span class="lang-btn-text">' + nativeName + '</span>' +
            chevron;
    }

    function setLanguage(lang) {
        if (lang === currentLang || !translations[lang]) return;
        applyTranslations(lang);

        langDropdown.querySelectorAll('[data-lang]').forEach(function(btn) {
            var isSelected = btn.getAttribute('data-lang') === lang;
            btn.setAttribute('aria-selected', isSelected);
            btn.style.background = isSelected ? 'var(--winSeg)' : 'transparent';
            btn.style.color = isSelected ? '#fff' : 'var(--text)';
        });

        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
    }

    function t(key, params) {
        params = params || {};
        if (!translations[currentLang] || !translations[currentLang][key]) return key;
        var text = translations[currentLang][key];
        Object.entries(params).forEach(function(entry) {
            text = text.replace(new RegExp('{' + entry[0] + '}', 'g'), entry[1]);
        });
        return text;
    }

    function getCurrentLanguage() { return currentLang; }
    function getAvailableLanguages() { return Object.keys(translations); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.i18n = {
        init: init,
        setLanguage: setLanguage,
        getCurrentLanguage: getCurrentLanguage,
        getAvailableLanguages: getAvailableLanguages,
        t: t,
        applyTranslations: applyTranslations
    };
})();
