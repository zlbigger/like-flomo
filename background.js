chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'syncToFlomo') {
    (async () => {
      try {
        const { content } = message;
        const { flomoApi } = await chrome.storage.sync.get(['flomoApi']);
        if (!flomoApi || typeof flomoApi !== 'string' || flomoApi.trim() === '') {
          sendResponse({ ok: false, error: '未配置 Flomo API' });
          return;
        }
        const res = await fetch(flomoApi, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });
        if (res.status >= 200 && res.status < 400) {
          sendResponse({ ok: true });
        } else {
          const text = await res.text().catch(() => '');
          sendResponse({ ok: false, error: `Flomo API 返回错误 ${res.status}`, detail: text });
        }
      } catch (e) {
        sendResponse({ ok: false, error: e && e.message ? e.message : '网络错误' });
      }
    })();
    return true;
  }
});