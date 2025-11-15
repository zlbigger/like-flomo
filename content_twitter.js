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

function getTweetContent(tweetElement) {
  const tweetText = tweetElement.querySelector('[data-testid="tweetText"]');
  let content = tweetText ? tweetText.innerText : '';
  const authorElement = tweetElement.querySelector('[data-testid="User-Name"]');
  let author = '';
  if (authorElement) {
    const nameSpan = authorElement.querySelector('span');
    author = nameSpan ? nameSpan.innerText : '';
  }
  const timeElement = tweetElement.querySelector('time');
  let tweetUrl = '';
  if (timeElement && timeElement.parentElement) {
    tweetUrl = timeElement.parentElement.href || '';
  }
  let flomoContent = '';
  if (author) flomoContent += `来自 @${author}\n\n`;
  flomoContent += content;
  if (tweetUrl) flomoContent += `\n\n${tweetUrl}`;
  flomoContent += '\n\n#Twitter';
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
  const target = e.target.closest('[data-testid="like"]');
  if (!target) return;
  const tweetElement = target.closest('article[data-testid="tweet"]');
  if (!tweetElement) return;
  const isUnlike = target.querySelector('[data-testid="unlike"]');
  if (isUnlike) return;
  const content = getTweetContent(tweetElement);
  if (content) {
    setTimeout(async () => {
      const res = await syncToFlomo(content);
      if (res && res.ok) showNotification('✓ 已同步到 Flomo', 'success');
      else showNotification(res && res.error ? res.error : '同步失败', 'error');
    }, 300);
  }
}, true);

console.log('Twitter 内容脚本已加载');