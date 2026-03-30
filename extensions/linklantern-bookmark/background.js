/* global chrome */

const ICON = chrome.runtime.getURL('icon48.png')

function normalizeBaseUrl(url) {
  if (!url) return ''
  return url.replace(/\/+$/, '')
}

async function notify(title, message) {
  try {
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: ICON,
      title,
      message,
    })
  } catch {
    // 部分环境 icon 不可用时不阻塞
    console.log(`[LinkLantern] ${title}: ${message}`)
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'save-to-linklantern') return

  const { baseUrl, bookmarkToken } = await chrome.storage.sync.get([
    'baseUrl',
    'bookmarkToken',
  ])

  const root = normalizeBaseUrl(String(baseUrl || '').trim())
  const token = String(bookmarkToken || '').trim()

  if (!root || !token) {
    await notify('LinkLantern', '请先在扩展选项中填写站点地址与扩展令牌')
    chrome.runtime.openOptionsPage()
    return
  }

  let tab
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    tab = tabs[0]
  } catch (e) {
    await notify('LinkLantern', '无法读取当前标签页')
    return
  }

  if (!tab?.url) {
    await notify('LinkLantern', '当前页面无法收藏')
    return
  }

  const u = tab.url
  if (u.startsWith('chrome://') || u.startsWith('chrome-extension://') || u.startsWith('edge://')) {
    await notify('LinkLantern', '此页面不支持收藏')
    return
  }

  const api = `${root}/api/links/quick`
  try {
    const res = await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bookmark-Token': token,
      },
      body: JSON.stringify({
        url: tab.url,
        title: (tab.title && tab.title.trim()) || tab.url,
        icon: tab.favIconUrl || undefined,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      const msg =
        data?.statusMessage ||
        data?.message ||
        `请求失败 (${res.status})`
      await notify('LinkLantern 收藏失败', msg)
      return
    }

    if (data?.data?.duplicate) {
      await notify('LinkLantern', '该链接已在收藏中')
    } else {
      await notify('LinkLantern', '已保存到收藏')
    }
  } catch (e) {
    await notify(
      'LinkLantern 收藏失败',
      e?.message || '网络错误，请检查站点地址是否正确'
    )
  }
})
