(function () {
    const STORAGE_KEY = 'interview_topic_notes';

    function readStore() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (error) {
            return {};
        }
    }

    function writeStore(store) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }

    function getPageKey() {
        const pathname = decodeURIComponent(window.location.pathname || '');
        return pathname.replace(/.*\/面试背题\//, '').replace(/^\//, '') || document.title || 'topic-page';
    }

    function slugify(text, index) {
        return 'note-section-' + (index + 1) + '-' + text.trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\u4e00-\u9fa5-]/g, '')
            .slice(0, 40);
    }

    function getSectionElement(heading) {
        return heading.closest('.question-card, .card, section, article') || heading;
    }

    function getSectionKey(heading, index) {
        if (!heading.id) {
            heading.id = slugify(heading.textContent || 'section', index);
        }
        const section = getSectionElement(heading);
        if (section && section.id) return section.id;
        return heading.id;
    }

    function saveSection(pageKey, sectionKey, data) {
        const store = readStore();
        store[pageKey] = store[pageKey] || {};
        store[pageKey][sectionKey] = data;
        if (!data.starred && !data.note) {
            delete store[pageKey][sectionKey];
        }
        writeStore(store);
    }

    function renderSection(heading, index, pageKey, pageData) {
        if (heading.dataset.notesReady === 'true') return;
        heading.dataset.notesReady = 'true';

        const sectionKey = getSectionKey(heading, index);
        const initial = pageData[sectionKey] || { starred: false, note: '' };
        const section = getSectionElement(heading);

        const tools = document.createElement('span');
        tools.className = 'topic-tools';
        tools.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        const starButton = document.createElement('button');
        starButton.type = 'button';
        starButton.className = 'topic-tool-btn topic-star-btn';
        starButton.textContent = '⭐ 重点';

        const noteButton = document.createElement('button');
        noteButton.type = 'button';
        noteButton.className = 'topic-tool-btn topic-note-btn';
        noteButton.textContent = '📝 笔记';

        tools.appendChild(starButton);
        tools.appendChild(noteButton);
        heading.appendChild(tools);

        const panel = document.createElement('div');
        panel.className = 'topic-note-panel';
        panel.hidden = true;
        panel.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        const textarea = document.createElement('textarea');
        textarea.placeholder = '记录你的理解、易错点或复习提示...';
        textarea.value = initial.note || '';

        const meta = document.createElement('div');
        meta.className = 'topic-note-meta';
        const status = document.createElement('span');
        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.className = 'topic-note-clear';
        clearButton.textContent = '清空笔记';
        meta.appendChild(status);
        meta.appendChild(clearButton);

        panel.appendChild(textarea);
        panel.appendChild(meta);
        heading.insertAdjacentElement('afterend', panel);

        function getData() {
            return {
                starred: starButton.classList.contains('active'),
                note: textarea.value.trim(),
                updatedAt: new Date().toISOString()
            };
        }

        function updateUI() {
            const data = getData();
            starButton.classList.toggle('active', data.starred);
            noteButton.classList.toggle('has-note', Boolean(data.note));
            if (section) section.classList.toggle('topic-section-starred', data.starred);
            status.textContent = data.note ? '已自动保存' : '输入后自动保存';
        }

        function persist() {
            const data = getData();
            saveSection(pageKey, sectionKey, data);
            updateUI();
        }

        starButton.classList.toggle('active', Boolean(initial.starred));
        if (section) section.classList.toggle('topic-section-starred', Boolean(initial.starred));
        noteButton.classList.toggle('has-note', Boolean(initial.note));
        updateUI();

        starButton.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            starButton.classList.toggle('active');
            persist();
        });

        noteButton.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            panel.hidden = !panel.hidden;
            if (!panel.hidden) textarea.focus();
        });

        textarea.addEventListener('input', persist);

        clearButton.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            textarea.value = '';
            persist();
            textarea.focus();
        });

        return {
            heading: heading,
            sectionKey: sectionKey,
            getTitle: function () {
                return (heading.textContent || '').replace('⭐ 重点', '').replace('📝 笔记', '').trim();
            },
            getNote: function () {
                return textarea.value;
            },
            setNote: function (note) {
                textarea.value = note;
                persist();
            },
            openInlineNote: function () {
                panel.hidden = false;
                textarea.focus();
            }
        };
    }

    function getCurrentController(controllers) {
        let current = controllers[0];

        controllers.forEach(function (controller) {
            const rect = controller.heading.getBoundingClientRect();
            if (rect.top <= 140) {
                current = controller;
            }
        });

        return current;
    }

    function initFloatingNotes(controllers) {
        if (controllers.length === 0) return;

        let currentController = getCurrentController(controllers);
        let isOpen = false;

        const widget = document.createElement('div');
        widget.className = 'floating-note-widget';

        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'floating-note-toggle';
        toggleButton.textContent = '📝 当前章节笔记';

        const panel = document.createElement('div');
        panel.className = 'floating-note-panel';
        panel.hidden = true;

        const title = document.createElement('div');
        title.className = 'floating-note-title';

        const textarea = document.createElement('textarea');
        textarea.placeholder = '记录当前章节的理解、易错点或复习提示...';

        const actions = document.createElement('div');
        actions.className = 'floating-note-actions';

        const status = document.createElement('span');
        status.textContent = '输入后自动保存';

        const locateButton = document.createElement('button');
        locateButton.type = 'button';
        locateButton.textContent = '定位章节';

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.textContent = '收起';

        actions.appendChild(status);
        actions.appendChild(locateButton);
        actions.appendChild(closeButton);
        panel.appendChild(title);
        panel.appendChild(textarea);
        panel.appendChild(actions);
        widget.appendChild(toggleButton);
        widget.appendChild(panel);
        document.body.appendChild(widget);

        function syncCurrentController() {
            const nextController = getCurrentController(controllers);
            if (!nextController || nextController === currentController) return;
            currentController = nextController;
            if (isOpen) renderPanel();
        }

        function renderPanel() {
            if (!currentController) return;
            title.textContent = currentController.getTitle();
            textarea.value = currentController.getNote();
            status.textContent = textarea.value.trim() ? '已自动保存' : '输入后自动保存';
        }

        toggleButton.addEventListener('click', function () {
            isOpen = !isOpen;
            panel.hidden = !isOpen;
            toggleButton.classList.toggle('active', isOpen);
            syncCurrentController();
            renderPanel();
            if (isOpen) textarea.focus();
        });

        textarea.addEventListener('input', function () {
            if (!currentController) return;
            currentController.setNote(textarea.value);
            status.textContent = textarea.value.trim() ? '已自动保存' : '输入后自动保存';
        });

        locateButton.addEventListener('click', function () {
            if (!currentController) return;
            currentController.heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            currentController.openInlineNote();
        });

        closeButton.addEventListener('click', function () {
            isOpen = false;
            panel.hidden = true;
            toggleButton.classList.remove('active');
        });

        const scrollTarget = document.querySelector('.content-wrapper') || window;
        scrollTarget.addEventListener('scroll', syncCurrentController, { passive: true });
        window.addEventListener('resize', syncCurrentController);
    }

    function initTopicNotes() {
        const headings = Array.from(document.querySelectorAll('.content-wrapper h2, main h2, body > .container h2'));
        if (headings.length === 0) return;

        const pageKey = getPageKey();
        const store = readStore();
        const pageData = store[pageKey] || {};

        const controllers = headings.map(function (heading, index) {
            return renderSection(heading, index, pageKey, pageData);
        }).filter(Boolean);

        initFloatingNotes(controllers);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTopicNotes);
    } else {
        initTopicNotes();
    }
})();
