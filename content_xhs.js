function showNotification(message, type = 'success') {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;top:20px;right:20px;padding:15px 20px;background:${type==='success'?'#10b981':'#ef4444'};color:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;font-size:14px;font-weight:500;`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => { el.style.transition='opacity 0.3s, transform 0.3s'; el.style.opacity='0'; el.style.transform='translateX(400px)'; setTimeout(() => el.remove(), 300); }, 3000);
}

function absUrl(href) {
  if (!href) return '';
  if (href.startsWith('http')) return href;
  if (href.startsWith('//')) return 'https:' + href;
  if (href.startsWith('/')) return 'https://www.xiaohongshu.com' + href;
  return href;
}

function getXhsContent(card) {
  let title = '';
  let author = '';
  let url = '';
  let summary = '';

  const titleEl = card.querySelector('#detail-title') || card.querySelector('.note-content .title') || card.querySelector('.footer .title span') || card.querySelector('.footer .title') || card.querySelector('a.title') || card.querySelector('[class*="title"]');
  if (titleEl) title = (titleEl.innerText || titleEl.textContent || '').trim();

  const authorEl = card.querySelector('.author .name') || card.querySelector('.author-wrapper .name') || card.querySelector('.note-content .author .name') || card.querySelector('[class*="author"] .name') || card.querySelector('[class*="user"] [class*="name"]');
  if (authorEl) author = (authorEl.innerText || authorEl.textContent || '').trim();

  const linkEl = card.querySelector('a.cover[href]') || card.querySelector('a[href^="/explore/"]') || card.querySelector('a[href*="/explore/"]');
  if (linkEl && linkEl.getAttribute('href')) url = absUrl(linkEl.getAttribute('href'));
  if (!url && location && location.hostname && location.hostname.includes('xiaohongshu.com') && location.pathname.includes('/explore/')) url = location.href;

  const descEl = card.querySelector('#detail-desc .note-text') || card.querySelector('#detail-desc') || card.querySelector('.note-content .desc') || card.querySelector('.desc, .content, .note-container .content, .note-card__content');
  if (descEl) {
    const raw = (descEl.innerText || descEl.textContent || '').replace(/[\u200B\u200C\u200D]/g,'');
    summary = raw.trim().replace(/\s+/g,' ').slice(0,280);
  }

  let content = '';
  if (title) content += `【标题】${title}\n\n`;
  if (summary) content += `${summary}\n\n`;
  if (author) content += `来自 @${author}\n\n`;
  if (url) content += `${url}\n\n`;
  content += '#小红书';
  return content;
}

async function syncToFlomo(content) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'syncToFlomo', content }, (resp) => resolve(resp));
  });
}

document.addEventListener('click', function(e) {
  const btn = e.target.closest('.like-wrapper');
  if (!btn) return;
  setTimeout(async () => {
    const liked = btn.classList.contains('like-active');
    const card = btn.closest('section.note-item') || btn.closest('[data-v-a264b01a]') || btn.closest('.footer')?.parentElement || btn.closest('.note-content') || document.querySelector('.note-content') || document.querySelector('[id="detail-title"]')?.closest('.note-content') || btn.closest('article') || btn.closest('div');
    if (!card) { showNotification('未找到小红书卡片节点', 'error'); return; }
    const content = getXhsContent(card);
    if (!content || content.length < 3) { showNotification('无法提取小红书内容', 'error'); return; }
    if (!liked) return;
    const res = await syncToFlomo(content);
    if (res && res.ok) showNotification('✓ 已同步到 Flomo','success'); else showNotification(res && res.error ? res.error : '同步失败','error');
  }, 300);
}, true);

console.log('小红书 内容脚本已加载');