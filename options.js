async function load() {
  const { flomoApi, inviteCode } = await chrome.storage.sync.get(['flomoApi', 'inviteCode']);
  const input = document.getElementById('api');
  if (flomoApi) input.value = flomoApi;
  const code = inviteCode || 'MTU5ODA5';
  const codeInput = document.getElementById('inviteCodeInput');
  const codeDisplay = document.getElementById('inviteCodeDisplay');
  const invite = document.getElementById('inviteText');
  if (codeInput) codeInput.value = code;
  if (codeDisplay) codeDisplay.textContent = code;
  if (invite) invite.value = `终于发现了输入超方便的卡片笔记 App —— flomo 浮墨笔记，还能智能建立笔记关联！注册 30 天内兑换我的邀请码 ${code}，你我都能得会员，快来体验吧。`;
}

async function save() {
  const input = document.getElementById('api');
  const msg = document.getElementById('msg');
  const url = input.value.trim();
  const codeInput = document.getElementById('inviteCodeInput');
  const codeDisplay = document.getElementById('inviteCodeDisplay');
  const invite = document.getElementById('inviteText');
  const code = (codeInput.value || '').trim() || 'MTU5ODA5';
  if (!url) {
    msg.textContent = '请输入有效的 Flomo API 地址';
    msg.style.color = '#ef4444';
    return;
  }
  await chrome.storage.sync.set({ flomoApi: url, inviteCode: code });
  if (codeDisplay) codeDisplay.textContent = code;
  if (invite) invite.value = `终于发现了输入超方便的卡片笔记 App —— flomo 浮墨笔记，还能智能建立笔记关联！注册 30 天内兑换我的邀请码 ${code}，你我都能得会员，快来体验吧。`;
  msg.textContent = '已保存';
  msg.style.color = '#10b981';
}

async function testSend() {
  const input = document.getElementById('api');
  const msg = document.getElementById('msg');
  const url = input.value.trim();
  if (!url) {
    msg.textContent = '请先填写并保存 Flomo API 地址';
    msg.style.color = '#ef4444';
    return;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Like Sync to Flomo 测试消息' })
    });
    if (res.status >= 200 && res.status < 400) {
      msg.textContent = '测试成功，已发送到 Flomo';
      msg.style.color = '#10b981';
    } else {
      msg.textContent = `测试失败：${res.status}`;
      msg.style.color = '#ef4444';
    }
  } catch (e) {
    msg.textContent = `测试失败：${e.message}`;
    msg.style.color = '#ef4444';
  }
}

document.getElementById('save').addEventListener('click', save);
document.getElementById('test').addEventListener('click', testSend);
document.getElementById('copyCode').addEventListener('click', async () => {
  const msg = document.getElementById('msg');
  const text = document.getElementById('inviteCodeDisplay').textContent;
  try {
    await navigator.clipboard.writeText(text);
    msg.textContent = '已复制邀请码';
    msg.style.color = '#10b981';
  } catch (e) {
    const temp = document.createElement('input');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    msg.textContent = '已复制邀请码';
    msg.style.color = '#10b981';
  }
});
document.getElementById('copyInvite').addEventListener('click', async () => {
  const msg = document.getElementById('msg');
  const text = document.getElementById('inviteText').value;
  try {
    await navigator.clipboard.writeText(text);
    msg.textContent = '已复制邀请文案';
    msg.style.color = '#10b981';
  } catch (e) {
    const ta = document.getElementById('inviteText');
    ta.removeAttribute('readonly');
    ta.select();
    document.execCommand('copy');
    ta.setAttribute('readonly', '');
    msg.textContent = '已复制邀请文案';
    msg.style.color = '#10b981';
  }
});
document.getElementById('copyMP').addEventListener('click', async () => {
  const msg = document.getElementById('msg');
  const text = document.getElementById('mpNameDisplay').textContent;
  try {
    await navigator.clipboard.writeText(text);
    msg.textContent = '已复制公众号名称';
    msg.style.color = '#10b981';
  } catch (e) {
    const temp = document.createElement('input');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    msg.textContent = '已复制公众号名称';
    msg.style.color = '#10b981';
  }
});
load();