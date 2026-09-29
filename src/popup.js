const $ = (id) => document.getElementById(id);
const form = $('proxy-form');

function showStatus(status) {
  $('state').textContent = status.connected ? `Connected · ${status.host}:${status.port}` : 'Disconnected';
  $('dot').classList.toggle('online', Boolean(status.connected));
  $('location').textContent = status.location
    ? `${status.location.country} · ${status.location.city || 'Location detected'} · ${status.location.timezone}`
    : 'No proxy location detected.';
}

function populateForm(config) {
  if (!config?.connected) return;
  $('scheme').value = config.scheme;
  $('host').value = config.host;
  $('port').value = config.port;
  $('username').value = config.username || '';
  $('password').value = config.password || '';
  $('timezone').checked = Boolean(config.timezone);
}

async function message(payload) {
  try {
    return await chrome.runtime.sendMessage(payload);
  } catch (error) {
    return { ok: false, error: error.message || 'The extension service is unavailable.' };
  }
}

async function refresh() {
  const status = await message({ type: 'status' });
  if (status.ok === false) return alert(status.error);
  showStatus(status);
  populateForm(status);
}

async function run(button, work) {
  button.disabled = true;
  try {
    await work();
  } finally {
    button.disabled = false;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  run($('connect'), async () => {
    const data = Object.fromEntries(new FormData(form));
    const host = data.host.trim();
    const port = Number(data.port);
    if (!host) return alert('Enter a proxy host.');
    if (!Number.isInteger(port) || port < 1 || port > 65535) return alert('Enter a port from 1 to 65535.');
    if (Boolean(data.username) !== Boolean(data.password)) return alert('Enter both proxy authentication fields, or leave both empty.');
    const result = await message({
      type: 'connect',
      config: { scheme: data.scheme, host, port, username: data.username.trim(), password: data.password, timezone: $('timezone').checked }
    });
    if (!result.ok) return alert(result.error);
    if (result.locationError) alert(`Proxy connected. ${result.locationError}`);
    await refresh();
  });
});

$('disconnect').addEventListener('click', () => run($('disconnect'), async () => {
  const result = await message({ type: 'disconnect' });
  if (!result.ok) alert(result.error);
  await refresh();
}));

$('refresh').addEventListener('click', () => run($('refresh'), async () => {
  const result = await message({ type: 'locate' });
  if (!result.ok) alert(result.error);
  await refresh();
}));

refresh();
