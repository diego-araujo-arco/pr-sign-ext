(() => {
  const LEVELS = [
    { emoji: '🟢', label: 'Alta' },
    { emoji: '🟡', label: 'Média' },
    { emoji: '🔴', label: 'Baixa' },
  ];
  const CONFIDENCE_EMOJIS = LEVELS.map((l) => l.emoji);
  const WIDGET_ID = 'pr-confidence-label-widget';
  const EDIT_TIMEOUT_MS = 4000;
  const POLL_INTERVAL_MS = 100;

  let lastUrl = '';

  function isPRPage() {
    return /^\/[^/]+\/[^/]+\/pull\/\d+/.test(location.pathname);
  }

  function getLoggedInUser() {
    return document.querySelector('meta[name="user-login"]')?.content || null;
  }

  function getPRAuthor() {
    const link = document.querySelector('a.author, a[data-hovercard-type="user"]');
    const href = link?.getAttribute('href');
    return href ? href.replace(/^\//, '') : null;
  }

  function getTitleElement() {
    return (
      document.querySelector('[data-component="TitleArea"] h1 .markdown-title') ||
      document.querySelector('[data-component="PH_Title"] span[data-component="Text"]')
    );
  }

  function hasConfidenceEmoji(text) {
    return CONFIDENCE_EMOJIS.some((emoji) => text.includes(emoji));
  }

  function removeWidget() {
    document.getElementById(WIDGET_ID)?.remove();
  }

  function waitFor(predicate, timeoutMs) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = setInterval(() => {
        const result = predicate();
        if (result) {
          clearInterval(timer);
          resolve(result);
        } else if (Date.now() - start > timeoutMs) {
          clearInterval(timer);
          reject(new Error('timeout waiting for condition'));
        }
      }, POLL_INTERVAL_MS);
    });
  }

  function setReactInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  async function applyConfidenceEmoji(emoji) {
    try {
      const editButton = document
        .querySelector('[data-component="TitleArea"] svg.octicon-pencil')
        ?.closest('button');
      if (!editButton) throw new Error('edit button not found');
      editButton.click();

      const label = await waitFor(
        () =>
          Array.from(document.querySelectorAll('label')).find(
            (el) => el.textContent.trim().toLowerCase() === 'edit pull request title'
          ),
        EDIT_TIMEOUT_MS
      );
      const input = document.getElementById(label.getAttribute('for'));
      if (!input) throw new Error('title input not found');

      setReactInputValue(input, `${emoji} ${input.value}`);

      const saveButton = await waitFor(() => {
        const scope = input.closest('form')?.parentElement || document;
        return Array.from(scope.querySelectorAll('button')).find((b) =>
          /^Save\b(?!d)/.test(b.textContent.trim())
        );
      }, EDIT_TIMEOUT_MS);
      saveButton.click();

      removeWidget();
    } catch (err) {
      console.error('[pr-confidence-label] failed to apply confidence emoji:', err);
    }
  }

  function renderWidget() {
    removeWidget();

    const widget = document.createElement('div');
    widget.id = WIDGET_ID;
    widget.style.cssText =
      'display:flex;gap:6px;align-items:center;margin:8px 0;font-size:14px;';

    const label = document.createElement('span');
    label.textContent = 'Nível de confiança para auto-merge:';
    label.style.cssText = 'font-weight:600;margin-right:4px;';
    widget.appendChild(label);

    LEVELS.forEach(({ emoji, label: levelLabel }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${emoji} ${levelLabel}`;
      button.style.cssText =
        'cursor:pointer;border:1px solid var(--borderColor-default, #d0d7de);border-radius:6px;padding:4px 8px;background:var(--bgColor-default, #fff);';
      button.addEventListener('click', () => applyConfidenceEmoji(emoji));
      widget.appendChild(button);
    });

    const titleEl = getTitleElement();
    const heading = titleEl?.closest('h1');
    // The h1 is now inline next to the edit button; append below both so the PageHeader grid stays intact.
    heading?.parentElement?.appendChild(widget);
  }

  function evaluatePage() {
    if (!isPRPage()) {
      removeWidget();
      return;
    }

    const loggedInUser = getLoggedInUser();
    const prAuthor = getPRAuthor();
    if (!loggedInUser || !prAuthor || loggedInUser.toLowerCase() !== prAuthor.toLowerCase()) {
      removeWidget();
      return;
    }

    const titleText = getTitleElement()?.textContent || '';
    if (!titleText || hasConfidenceEmoji(titleText)) {
      removeWidget();
      return;
    }

    renderWidget();
  }

  function onUrlChange() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    setTimeout(evaluatePage, 300);
  }

  const observer = new MutationObserver(() => {
    onUrlChange();
    if (isPRPage() && !document.getElementById(WIDGET_ID)) {
      evaluatePage();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('turbo:load', evaluatePage);
  document.addEventListener('turbo:render', evaluatePage);

  lastUrl = location.href;
  evaluatePage();
})();
