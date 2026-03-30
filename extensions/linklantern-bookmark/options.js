/* global chrome */

const $ = (id) => document.getElementById(id)

chrome.storage.sync.get(['baseUrl', 'bookmarkToken', 'debug'], (items) => {
  if (items.baseUrl) $('baseUrl').value = items.baseUrl
  if (items.bookmarkToken) $('bookmarkToken').value = items.bookmarkToken
  if (items.debug) $('debug').checked = true
})

$('save').addEventListener('click', () => {
  const baseUrl = $('baseUrl').value.trim().replace(/\/+$/, '')
  const bookmarkToken = $('bookmarkToken').value.trim()
  const debug = $('debug').checked
  const status = $('status')
  status.hidden = true

  chrome.storage.sync.set({ baseUrl, bookmarkToken, debug }, () => {
    status.textContent = '已保存'
    status.hidden = false
    if (debug) {
      console.log('[LinkLantern options] 已保存，调试模式开启')
    }
  })
})
