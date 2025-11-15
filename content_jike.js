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

function getJikeContent(postElement) {
  let content = '';
  let author = '';
  let postUrl = '';
  let topic = '';
  const authorElement = postElement.querySelector('.jk-bjn8wh') || postElement.querySelector('a[href*="/u/"]');
  if (authorElement) author = authorElement.innerText.trim();
  const textElement = postElement.querySelector('.jk-1mipk4t') || postElement.querySelector('[class*="jk-1mipk"]');
  if (textElement) content = textElement.innerText.trim();
  const topicElement = postElement.querySelector('.jk-1m1tvu4 .jk-qcm5xu') || postElement.querySelector('a[href*="/topic/"]');
  if (topicElement) topic = topicElement.innerText.trim();
  const linkElement = postElement.querySelector('a[href*="/originalPost/"]') || postElement.querySelector('a[href*="/repost/"]');
  if (linkElement && linkElement.href) {
    postUrl = linkElement.href;
  } else {
    const currentUrl = window.location.href;
    if (currentUrl.includes('/originalPost/') || currentUrl.includes('/repost/')) postUrl = currentUrl;
  }
  let flomoContent = '';
  if (author) flomoContent += `来自 @${author}\n\n`;
  if (content) flomoContent += content;
  if (topic) flomoContent += `\n\n📌 ${topic}`;
  if (postUrl) flomoContent += `\n\n${postUrl}`;
  flomoContent += '\n\n#即刻';
  return flomoContent;
}

function getPostId(postElement) {
  const linkElement = postElement.querySelector('a[href*="/originalPost/"]') || postElement.querySelector('a[href*="/repost/"]');
  if (linkElement && linkElement.href) return linkElement.href;
  const textElement = postElement.querySelector('.jk-1mipk4t');
  if (textElement) return textElement.innerText.substring(0, 50);
  return null;
}

async function syncToFlomo(content) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'syncToFlomo', content }, (resp) => {
      resolve(resp);
    });
  });
}

const syncedPosts = new Set();

document.addEventListener('click', function (e) {
  const target = e.target.closest('.jk-1elj2c5');
  if (!target) return;
  const svgPath = target.querySelector('svg path');
  if (!svgPath) return;
  const pathD = svgPath.getAttribute('d');
  if (!pathD || !pathD.includes('M13.2 2.4')) return;
  const isLiked = target.classList.contains('liked') || target.getAttribute('aria-pressed') === 'true';
  if (isLiked) return;
  const postElement = target.closest('.jk-dqdwfu') || target.closest('[class*="jk-dqdwfu"]') || target.closest('article');
  if (!postElement) return;
  const postId = getPostId(postElement);
  if (postId && syncedPosts.has(postId)) return;
  const content = getJikeContent(postElement);
  if (content && content.length > 10) {
    setTimeout(async () => {
      const res = await syncToFlomo(content);
      if (res && res.ok) {
        showNotification('✓ 已同步到 Flomo', 'success');
        if (postId) syncedPosts.add(postId);
      } else {
        showNotification(res && res.error ? res.error : '同步失败', 'error');
      }
    }, 300);
  }
}, true);

console.log('即刻 内容脚本已加载');