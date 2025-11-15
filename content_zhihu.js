function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function normalizeUrl(u) {
  if (!u) return '';
  if (u.startsWith('//')) return 'https:' + u;
  return u;
}

function getZhihuContent(itemEl) {
  let title = '';
  let summary = '';
  let author = '';
  let url = '';

  const titleEl = itemEl.querySelector('h2.ContentItem-title a, .ContentItem-title a');
  if (titleEl) title = titleEl.textContent.trim();

  const richEl = itemEl.querySelector('.RichContent-inner .RichText, .RichContent .RichText');
  if (richEl) {
    const text = richEl.innerText.trim().replace(/\s+/g, ' ');
    summary = text.slice(0, 200);
  }

  const zopRaw = itemEl.getAttribute('data-zop');
  if (zopRaw) {
    try {
      const zop = JSON.parse(zopRaw);
      if (zop && typeof zop.authorName === 'string') author = zop.authorName.trim();
    } catch {}
  }
  if (!author) {
    const authorMeta = itemEl.querySelector('meta[itemprop="author"]');
    if (authorMeta && authorMeta.content) author = authorMeta.content.trim();
  }

  const urlMeta = itemEl.querySelector('meta[itemprop="url"]');
  if (urlMeta && urlMeta.content) url = normalizeUrl(urlMeta.content.trim());
  if (!url && titleEl && titleEl.href) url = normalizeUrl(titleEl.href);

  let content = '';
  if (title) content += `【标题】${title}\n\n`;
  if (summary) content += `${summary}\n\n`;
  if (author) content += `来自 @${author}\n\n`;
  if (url) content += `${url}\n\n`;
  content += '#知乎';
  return content;
}

async function syncToFlomo(content) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'syncToFlomo', content }, (resp) => {
      resolve(resp);
    });
  });
}

document.addEventListener('click', function (e) {
  const btn = e.target.closest('button.VoteButton');
  if (!btn) return;
  const upIcon = btn.querySelector('.Zi--TriangleUp');
  if (!upIcon) return;
  setTimeout(async () => {
    const isActive = btn.classList.contains('is-active') || btn.getAttribute('aria-pressed') === 'true';
    if (!isActive) return;
    const itemEl = btn.closest('.ContentItem.ArticleItem') || btn.closest('.ContentItem');
    if (!itemEl) return;
    const content = getZhihuContent(itemEl);
    if (!content || content.length < 10) return;
    const res = await syncToFlomo(content);
    if (res && res.ok) showNotification('✓ 已同步到 Flomo', 'success');
    else showNotification(res && res.error ? res.error : '同步失败', 'error');
  }, 300);
}, true);

console.log('知乎 内容脚本已加载');