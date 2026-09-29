const LOCATION_URL = 'https://ipwho.is/';
const api = chrome;
let configCache = null;

async function getConfig() {
  if (configCache) return configCache;
  const { proxyConfig } = await api.storage.local.get('proxyConfig');
  return (configCache = proxyConfig || null);
}

async function saveConfig(config) {
  configCache = config;
  await api.storage.local.set({ proxyConfig: config });
}

async function getStatus() {
  const config = await getConfig();
  const { location } = await api.storage.local.get('location');
  return { connected: Boolean(config), ...(config || {}), location: location || null };
}

api.webRequest.onAuthRequired.addListener(
  (details, callback) => {
    getConfig().then((config) => {
      const hasCredentials = typeof config?.username === 'string' && config.username && typeof config.password === 'string';
      callback(hasCredentials && details.isProxy ? { authCredentials: { username: config.username, password: config.password } } : {});
    });
  },
  { urls: ['<all_urls>'] },
  ['asyncBlocking']
);

function isValidHost(host) {
  if (typeof host !== 'string' || host.length > 253 || /[\s/@\\]/.test(host)) return false;
  if (host.startsWith('[') || host.endsWith(']')) return /^\[[0-9a-fA-F:.]+\]$/.test(host);
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return host.split('.').every((part) => Number(part) <= 255);
  return /^(?=.{1,253}$)(?!-)[a-zA-Z0-9-]+(?:\.(?!-)[a-zA-Z0-9-]+)*$/.test(host);
}

function validateConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Invalid proxy configuration.');
  if (!['http', 'https', 'socks4', 'socks5'].includes(config.scheme)) throw new Error('Choose a supported proxy protocol.');
  const host = typeof config.host === 'string' ? config.host.trim() : '';
  if (!isValidHost(host)) throw new Error('Enter a valid proxy hostname or IP address.');
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) throw new Error('Enter a port from 1 to 65535.');
  const username = typeof config.username === 'string' ? config.username : '';
  const password = typeof config.password === 'string' ? config.password : '';
  if (username.length > 1024 || password.length > 1024 || (username && !password) || (!username && password)) throw new Error('Enter both proxy authentication fields, or leave both empty.');
  return { scheme: config.scheme, host, port: config.port, username, password, timezone: Boolean(config.timezone) };
}

function proxyRules(config) {
  return { mode: 'fixed_servers', rules: { singleProxy: { scheme: config.scheme, host: config.host, port: config.port }, bypassList: ['<local>'] } };
}

async function applyTimezone(timezone) {
  if (!timezone) return;
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !/^https?:/i.test(tab.url || '')) return;
  try {
    await api.debugger.attach({ tabId: tab.id }, '1.3');
    await api.debugger.sendCommand({ tabId: tab.id }, 'Emulation.setTimezoneOverride', { timezoneId: timezone });
    await api.storage.session.set({ timezoneTabId: tab.id });
  } catch (error) {
    console.warn('Timezone override unavailable:', error.message);
  }
}

async function clearTimezone() {
  const { timezoneTabId } = await api.storage.session.get('timezoneTabId');
  if (timezoneTabId) {
    try {
      await api.debugger.sendCommand({ tabId: timezoneTabId }, 'Emulation.setTimezoneOverride', { timezoneId: '' });
      await api.debugger.detach({ tabId: timezoneTabId });
    } catch (_) {
      // The tab may have closed or another debugger may own the session.
    }
  }
  await api.storage.session.remove('timezoneTabId');
}

async function locate() {
  const config = await getConfig();
  if (!config) return { ok: false, error: 'Connect a proxy before detecting its location.' };
  try {
    const response = await fetch(LOCATION_URL, { cache: 'no-store' });
    const data = await response.json();
    if (!data.success || !data.timezone?.id) throw new Error(data.message || 'Location lookup did not return a timezone.');
    const location = { country: data.country || 'Unknown country', city: data.city || '', timezone: data.timezone.id };
    await api.storage.local.set({ location });
    if (config.timezone) await applyTimezone(location.timezone);
    return { ok: true, location };
  } catch (error) {
    return { ok: false, error: `Could not detect proxy location: ${error.message}` };
  }
}

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (!message || typeof message.type !== 'string') return { ok: false, error: 'Invalid request.' };
    if (message.type === 'status') return getStatus();
    if (message.type === 'connect') {
      const config = validateConfig(message.config);
      await clearTimezone();
      await api.proxy.settings.set({ value: proxyRules(config), scope: 'regular' });
      await saveConfig(config);
      await api.storage.local.remove('location');
      const located = await locate();
      return { ok: true, location: located.location || null, locationError: located.ok ? null : located.error };
    }
    if (message.type === 'disconnect') {
      await api.proxy.settings.clear({ scope: 'regular' });
      await clearTimezone();
      configCache = null;
      await api.storage.local.remove(['proxyConfig', 'location']);
      return { ok: true };
    }
    if (message.type === 'locate') return locate();
    return { ok: false, error: 'Unknown request.' };
  })().then(sendResponse).catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

api.tabs.onRemoved.addListener(async (tabId) => {
  const { timezoneTabId } = await api.storage.session.get('timezoneTabId');
  if (tabId === timezoneTabId) await api.storage.session.remove('timezoneTabId');
});
