/* global chrome */

/** 通知用图标：内联 data URL（Chrome 通知进程常无法加载 chrome-extension:// 下的 PNG，会报 Unable to download all specified images） */
const NOTIFICATION_ICON_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAARUlEQVR42u3PIQ0AAAgAMAIQkP6SElABy3bxAI+unM9CQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQOBqAUv/ti011/KQAAAAAElFTkSuQmCC'

const LOG_PREFIX = '[LinkLantern]'

function normalizeBaseUrl(url) {
  if (!url) return ''
  return url.replace(/\/+$/, '')
}

/** 调试模式下打印；令牌只显示长度与末尾 4 位，避免完整泄露到日志 */
function tokenHint(token) {
  const t = String(token || '')
  if (!t) return '(空)'
  const tail = t.length > 4 ? t.slice(-4) : '****'
  return `len=${t.length} …${tail}`
}

function dbg(debug, ...args) {
  if (debug) console.log(LOG_PREFIX, '[debug]', ...args)
}

const BADGE_CLEAR_MS = 4500
const ACTION_TITLE_DEFAULT = 'LinkLantern 快捷收藏'

/** 工具栏角标 + 悬停标题（不依赖系统是否允许通知） */
async function setToolbarFeedback(tone, detail) {
  try {
    const text = tone === 'ok' ? 'OK' : tone === 'err' ? '!' : '…'
    const color = tone === 'ok' ? '#15803d' : tone === 'err' ? '#b91c1c' : '#64748b'
    await chrome.action.setBadgeText({ text })
    await chrome.action.setBadgeBackgroundColor({ color })
    await chrome.action.setTitle({
      title: `${ACTION_TITLE_DEFAULT} — ${detail}`,
    })
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' }).catch(() => {})
      chrome.action.setTitle({ title: ACTION_TITLE_DEFAULT }).catch(() => {})
    }, BADGE_CLEAR_MS)
  } catch (e) {
    console.warn(LOG_PREFIX, 'toolbar 反馈失败', e?.message)
  }
}

/**
 * 在当前页显示短暂浮层（多数网页可用；受 CSP 限制的页面会静默失败）
 */
async function showPageToast(tabId, message, tone) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (msg, ok) => {
        const bg = ok ? '#15803d' : '#b91c1c'
        const el = document.createElement('div')
        el.setAttribute('data-linklantern-toast', '1')
        el.textContent = msg
        el.style.cssText = [
          'position:fixed',
          'top:20px',
          'right:20px',
          'z-index:2147483647',
          'max-width:min(360px,calc(100vw - 40px))',
          'padding:12px 16px',
          `background:${bg}`,
          'color:#fff',
          'border-radius:10px',
          'font:14px/1.45 system-ui,-apple-system,sans-serif',
          'box-shadow:0 8px 24px rgba(0,0,0,.18)',
          'pointer-events:none',
        ].join(';')
        document.documentElement.appendChild(el)
        setTimeout(() => el.remove(), 3200)
      },
      args: [message, tone === 'ok'],
    })
  } catch {
    /* 受限页、PDF 查看器等 */
  }
}

async function notify(title, message, { tone = 'info', tabId } = {}) {
  const detail = message
  if (tone === 'ok' || tone === 'err') {
    await setToolbarFeedback(tone, detail)
  }
  if (typeof tabId === 'number' && tone === 'ok') {
    await showPageToast(tabId, message, tone)
  }

  const nid = `ll-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  try {
    await chrome.notifications.create(nid, {
      type: 'basic',
      iconUrl: NOTIFICATION_ICON_PNG,
      title,
      message,
    })
  } catch (e) {
    // Chrome 要求 basic 通知含 type、iconUrl、title、message；勿省略 iconUrl
    console.warn(LOG_PREFIX, '系统通知失败', e?.message || e, '—', title)
  }
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'save-to-linklantern') return

  const { baseUrl, bookmarkToken, debug } = await chrome.storage.sync.get([
    'baseUrl',
    'bookmarkToken',
    'debug',
  ])
  const isDebug = Boolean(debug)

  dbg(isDebug, '快捷键触发', { command })

  const root = normalizeBaseUrl(String(baseUrl || '').trim())
  const token = String(bookmarkToken || '').trim()

  if (!root || !token) {
    console.warn(LOG_PREFIX, '配置不完整', {
      hasBaseUrl: Boolean(root),
      token: tokenHint(token),
    })
    await notify('LinkLantern', '请先在扩展选项中填写站点地址与扩展令牌', {
      tone: 'err',
    })
    chrome.runtime.openOptionsPage()
    return
  }

  dbg(isDebug, '配置', { baseUrl: root, token: tokenHint(token) })

  let tab
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    tab = tabs[0]
  } catch (e) {
    console.error(LOG_PREFIX, 'tabs.query 失败', e)
    await notify('LinkLantern', '无法读取当前标签页', { tone: 'err' })
    return
  }

  if (!tab?.url) {
    console.warn(LOG_PREFIX, '无当前标签或 URL', { tabId: tab?.id })
    await notify('LinkLantern', '当前页面无法收藏', { tone: 'err' })
    return
  }

  const u = tab.url
  if (u.startsWith('chrome://') || u.startsWith('chrome-extension://') || u.startsWith('edge://')) {
    dbg(isDebug, '跳过内置页', { url: u })
    await notify('LinkLantern', '此页面不支持收藏', { tone: 'err' })
    return
  }

  const payload = {
    url: tab.url,
    title: (tab.title && tab.title.trim()) || tab.url,
    icon: tab.favIconUrl || undefined,
  }

  dbg(isDebug, '当前标签', {
    tabId: tab.id,
    url: payload.url,
    title: payload.title,
    hasFavicon: Boolean(payload.icon),
  })

  const api = `${root}/api/links/quick`
  dbg(isDebug, '请求', { method: 'POST', api, body: { ...payload, icon: payload.icon ? '(有)' : undefined } })

  try {
    const t0 = performance.now()
    const res = await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Bookmark-Token': token,
      },
      body: JSON.stringify(payload),
    })

    const text = await res.text()
    let data = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch (parseErr) {
      console.error(LOG_PREFIX, '响应非 JSON', { status: res.status, textPreview: text.slice(0, 200) })
      await notify('LinkLantern 收藏失败', `服务器返回异常 (${res.status})`, {
        tone: 'err',
      })
      return
    }

    const ms = Math.round(performance.now() - t0)
    dbg(isDebug, '响应', {
      status: res.status,
      ok: res.ok,
      ms,
      body: data,
    })

    if (!res.ok) {
      const msg =
        data?.statusMessage ||
        data?.message ||
        `请求失败 (${res.status})`
      console.warn(LOG_PREFIX, 'API 错误', { status: res.status, msg, data })
      await notify('LinkLantern 收藏失败', msg, { tone: 'err' })
      return
    }

    if (data?.data?.duplicate) {
      dbg(isDebug, '结果: 重复链接', data.data?.link?.id)
      await notify('LinkLantern', '该链接已在收藏中', {
        tone: 'ok',
        tabId: tab.id,
      })
    } else {
      dbg(isDebug, '结果: 新建成功', data.data?.link?.id)
      await notify('LinkLantern', '已保存到收藏', {
        tone: 'ok',
        tabId: tab.id,
      })
    }
  } catch (e) {
    console.error(LOG_PREFIX, 'fetch 异常', {
      name: e?.name,
      message: e?.message,
      api,
    })
    await notify(
      'LinkLantern 收藏失败',
      e?.message || '网络错误，请检查站点地址是否正确',
      { tone: 'err' }
    )
  }
})
