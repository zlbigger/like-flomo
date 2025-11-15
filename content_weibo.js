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

function getWeiboContent(weiboElement) {
  let content = '';
  let author = '';
  let weiboUrl = '';
  const textElement = weiboElement.querySelector('.detail_wbtext_4CRf9') ||
    weiboElement.querySelector('[class*="detail_wbtext"]') ||
    weiboElement.querySelector('.wbpro-feed-content') ||
    weiboElement.querySelector('[class*="text"]');
  if (textElement) {
    const textContent = textElement.innerText || textElement.textContent;
    content = textContent.replace(/收起$|展开全文$/g, '').trim();
  }
  const authorElement = weiboElement.querySelector('.head_name_24eEB span') ||
    weiboElement.querySelector('.head_name_24eEB') ||
    weiboElement.querySelector('[class*="head_name"]');
  if (authorElement) {
    author = (authorElement.getAttribute('title') || authorElement.innerText).trim();
  }
  const linkElement = weiboElement.querySelector('.head-info_time_6sFQg') ||
    weiboElement.querySelector('a[href*="/status/"]') ||
    weiboElement.querySelector('[class*="head-info_time"]');
  if (linkElement && linkElement.href) {
    weiboUrl = linkElement.href;
  }
  let flomoContent = '';
  if (author) flomoContent += `来自 @${author}\n\n`;
  if (content) flomoContent += content;
  if (weiboUrl) flomoContent += `\n\n${weiboUrl}`;
  flomoContent += '\n\n#微博';
  return flomoContent;
}

async function syncToFlomo(content) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'syncToFlomo', content }, (resp) => {
      resolve(resp);
    });
  });
}

document.addEventListener('click', function (e) {
  const target = e.target.closest('.woo-like-main') || e.target.closest('button[title="赞"]');
  if (!target) return;
  const isLiked = target.querySelector('.woo-like-liked') || target.classList.contains('woo-like-liked');
  if (isLiked) return;
  const weiboElement = target.closest('article') || target.closest('[class*="woo-box-item"]') || target.closest('.card-wrap');
  if (!weiboElement) return;
  const content = getWeiboContent(weiboElement);
  if (content && content.length > 10) {
    setTimeout(async () => {
      const res = await syncToFlomo(content);
      if (res && res.ok) showNotification('✓ 已同步到 Flomo', 'success');
      else showNotification(res && res.error ? res.error : '同步失败', 'error');
    }, 300);
  }
}, true);

console.log('微博 内容脚本已加载');