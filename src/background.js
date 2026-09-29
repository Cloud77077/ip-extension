const LOCATION_URL = 'https://ipwho.is/';
const api = chrome;
let configCache = null;

async function getConfig() { if (configCache) return configCache; const { proxyConfig } = await api.storage.local.get('proxyConfig'); return (configCache = proxyConfig || null); }
async function saveConfig(config) { configCache = config; await api.storage.local.set({ proxyConfig: config }); }
async function getStatus() { const { location } = await api.storage.local.get('location'); return { connected: Boolean(await getConfig()), ...(await getConfig() || {}), location: location || null }; }

api.webRequest.onAuthRequired.addListener(
  (details, callback) => {
    getConfig().then((config) => callback(config?.username && details.isProxy ? { authCredentials: { username: config.username, password: config.password } } : {}));
  },
  { urls: ['<all_urls>'] },
  ['asyncBlocking']
);

function proxyRules(config) { return { mode: 'fixed_servers', rules: { singleProxy: { scheme: config.scheme, host: config.host, port: config.port }, bypassList: ['<local>'] } }; }
function validateConfig(config) {
  if (!config || !['http', 'https', 'socks4', 'socks5'].includes(config.scheme)) throw new Error('Choose a supported proxy protocol.');
  if (typeof config.host !== 'string' || !config.host.trim()) throw new Error('Enter a proxy host.');
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) throw new Error('Enter a port from 1 to 65535.');
}
async function applyTimezone(timezone) {
  if (!timezone) return;
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !/^https?:/i.test(tab.url || '')) return;
  try { await api.debugger.attach({ tabId: tab.id }, '1.3'); await api.debugger.sendCommand({ tabId: tab.id }, 'Emulation.setTimezoneOverride', { timezoneId: timezone }); await api.storage.session.set({ timezoneTabId: tab.id }); }
  catch (error) { console.warn('Timezone override unavailable:', error.message); }
}
async function clearTimezone() { const { timezoneTabId } = await api.storage.session.get('timezoneTabId'); if (timezoneTabId) { try { await api.debugger.sendCommand({ tabId: timezoneTabId }, 'Emulation.setTimezoneOverride', { timezoneId: '' }); await api.debugger.detach({ tabId: timezoneTabId }); } catch (_) {} } await api.storage.session.remove('timezoneTabId'); }

async function locate() {
  const config = await getConfig(); if (!config) return { ok: false, error: 'Connect a proxy before detecting its location.' };
  try { const response = await fetch(LOCATION_URL, { cache: 'no-store' }); const data = await response.json(); if (!data.success || !data.timezone?.id) throw new Error(data.message || 'Location lookup did not return a timezone.'); const location = { country: data.country || 'Unknown country', city: data.city || '', timezone: data.timezone.id }; await api.storage.local.set({ location }); if (config.timezone) await applyTimezone(location.timezone); return { ok: true, location }; } catch (error) { return { ok: false, error: `Could not detect proxy location: ${error.message}` }; }
}

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message.type === 'status') return getStatus();
    if (message.type === 'connect') { const config = message.config; validateConfig(config); await clearTimezone(); await api.proxy.settings.set({ value: proxyRules(config), scope: 'regular' }); await saveConfig(config); await api.storage.local.remove('location'); const located = await locate(); return { ok: true, ...located }; }
    if (message.type === 'disconnect') { await api.proxy.settings.clear({ scope: 'regular' }); await clearTimezone(); configCache = null; await api.storage.local.remove(['proxyConfig', 'location']); return { ok: true }; }
    if (message.type === 'locate') return locate();
    return { ok: false, error: 'Unknown request.' };
  })().then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});
api.tabs.onRemoved.addListener(async (tabId) => { const { timezoneTabId } = await api.storage.session.get('timezoneTabId'); if (tabId === timezoneTabId) await api.storage.session.remove('timezoneTabId'); });
