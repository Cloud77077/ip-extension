const $ = (id) => document.getElementById(id);
const form = $('proxy-form');
function showStatus(status) { $('state').textContent = status.connected ? `Connected · ${status.host}:${status.port}` : 'Disconnected'; $('dot').classList.toggle('online', Boolean(status.connected)); $('location').textContent = status.location ? `${status.location.country} · ${status.location.city || 'Location detected'} · ${status.location.timezone}` : 'No proxy location detected.'; }
async function refresh() { showStatus(await chrome.runtime.sendMessage({ type: 'status' })); }
form.addEventListener('submit', async (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(form)); const port = Number(data.port); if (!Number.isInteger(port) || port < 1 || port > 65535) return alert('Enter a port from 1 to 65535.'); const result = await chrome.runtime.sendMessage({ type: 'connect', config: { scheme: data.scheme, host: data.host.trim(), port, username: data.username.trim(), password: data.password, timezone: $('timezone').checked } }); if (!result.ok) alert(result.error); await refresh(); });
$('disconnect').addEventListener('click', async () => { await chrome.runtime.sendMessage({ type: 'disconnect' }); await refresh(); });
$('refresh').addEventListener('click', async () => { const result = await chrome.runtime.sendMessage({ type: 'locate' }); if (!result.ok) alert(result.error); await refresh(); });
refresh();
