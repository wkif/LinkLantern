/* global chrome */

const $ = (id) => document.getElementById(id)

chrome.storage.sync.get(['baseUrl', 'bookmarkToken'], (items) => {
  if (items.baseUrl) $('baseUrl').value = items.baseUrl
  if (items.bookmarkToken) $('bookmarkToken').value = items.bookmarkToken
})

$('save').addEventListener('click', () => {
  const baseUrl = $('baseUrl').value.trim().replace(/\/+$/, '')
  const bookmarkToken = $('bookmarkToken').value.trim()
  const status = $('status')
  status.hidden = true

  chrome.storage.sync.set({ baseUrl, bookmarkToken }, () => {
    status.textContent = '已保存'
    status.hidden = false
  })
})
