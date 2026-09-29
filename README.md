# IP Extension

![IP Extension interface preview](./assets/banner.svg)

**IP Extension** is a Manifest V3 browser extension for applying a single HTTP, HTTPS, SOCKS4, or SOCKS5 proxy profile. It can optionally look up the proxy exit location and apply that location's timezone to the currently active HTTP(S) tab.

> [!WARNING]
> A proxy provider can observe traffic that is not protected by end-to-end encryption. Use reputable providers and HTTPS websites.

## Contents

- [Features](#features)
- [Supported browsers](#supported-browsers)
- [Installation](#installation)
- [Using IP Extension](#using-ip-extension)
- [Permissions, security, and privacy](#permissions-security-and-privacy)
- [Releases and downloads](#releases-and-downloads)
- [Development and packaging](#development-and-packaging)
- [Project structure](#project-structure)
- [Limitations and troubleshooting](#limitations-and-troubleshooting)
- [Version history](#version-history)

## Features

- Configure one HTTP, HTTPS, SOCKS4, or SOCKS5 proxy at a time.
- Optionally provide proxy authentication credentials.
- Validate the protocol, hostname/IP address, port range, and paired authentication fields before applying the proxy.
- Keep local addresses outside the proxy through the browser's `<local>` bypass rule.
- Detect the proxy exit country, city, and IANA timezone through [`ipwho.is`](https://ipwho.is/) after connection or on demand.
- Optionally emulate the detected timezone in the **active HTTP(S) tab** using the browser debugging protocol.
- Disconnect in one action, clearing the browser proxy setting, saved proxy configuration, location, and active timezone override.

## Supported browsers

| Browser family | Build | Notes |
| --- | --- | --- |
| Chrome, Chromium, Microsoft Edge, Brave | [Chrome manifest](./manifest.chrome.json) | Load the unpacked package in a desktop browser that supports Chromium extension APIs. |
| Firefox 121+ | [Firefox manifest](./manifest.firefox.json) | The Firefox package is suitable for temporary/developer installation; persistent distribution requires Firefox signing. |

Mobile browser extension installation and the `proxy`/`debugger` APIs vary by browser and platform. IP Extension does not claim support for a particular mobile browser.

## Installation

### Chrome / Chromium / Edge / Brave

1. Download an archive from [GitHub Releases](../../releases), then extract `ip-extension-chrome.zip`.
2. Open the browser's extensions page (for example, `chrome://extensions`).
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select the extracted directory containing `manifest.json`.
5. Pin **IP Extension** and open it from the toolbar.

### Firefox

1. Download and extract `ip-extension-firefox.zip` from [GitHub Releases](../../releases).
2. For temporary developer testing, open `about:debugging#/runtime/this-firefox`.
3. Select **Load Temporary Add-on** and choose the extracted `manifest.json`.
4. For a persistent install, the add-on must be signed and distributed through Firefox's supported signing/distribution process.

## Using IP Extension

### Proxy configuration

1. Select the proxy protocol supplied by your provider.
2. Enter a hostname or IP address and a port between `1` and `65535`.
3. Open **Authentication** only when the provider requires it; enter both username and password, or neither.
4. Select **Connect proxy**. The extension applies the setting to the regular browser profile and then attempts a location lookup.
5. Select **Disconnect** when you no longer need the proxy.

### Location and timezone

Enable **Match timezone to proxy country** before connecting to request timezone emulation after a successful location lookup. The extension applies it only to the active `http:` or `https:` tab; it does not change your device clock, operating system timezone, or every browser tab. Use **Refresh location** to retry the lookup.

## Permissions, security, and privacy

| Permission / access | Why it is requested |
| --- | --- |
| `proxy` | Apply and clear the browser proxy setting. |
| `storage` | Save the active proxy configuration and detected location locally in the extension profile. |
| `tabs` + `debugger` | Identify the active tab and apply an optional tab-scoped timezone override. Browsers may display a debugging indicator. |
| `webRequest` + authentication permission | Provide configured credentials only when the browser reports a proxy-authentication challenge. |
| `<all_urls>` | Required by browser proxy/authentication APIs to handle requests routed through the configured proxy. |
| `https://ipwho.is/*` | Retrieve best-effort public exit location data only after connection or a manual refresh. |

Proxy credentials are stored in the browser's extension-local storage because the browser needs them to answer proxy authentication challenges. They are not placed in this repository or sent to a project-operated server. Disconnecting removes saved credentials and location data. Treat a shared browser profile as untrusted, do not reuse sensitive passwords, and inspect your browser's extension permission prompts before installing.

## Releases and downloads

Release archives are generated from a pushed version tag by the [release workflow](./.github/workflows/release.yml) and attached to [GitHub Releases](../../releases). Archives are intentionally excluded from the source tree.

A release tag must match both manifest versions: for example, tag `v1.0.0` packages manifests with version `1.0.0`. The workflow publishes:

- `ip-extension-chrome.zip`
- `ip-extension-firefox.zip`

## Development and packaging

No npm dependencies are required. You need Bash, `zip`, and a POSIX-like shell.

```bash
git clone https://github.com/Cloud77077/ip-extension.git
cd ip-extension
./scripts/package.sh chrome
./scripts/package.sh firefox
```

Packages are written to the ignored `dist/` directory. Each archive contains only `manifest.json`, [`src/`](./src/), and [`assets/`](./assets/). Use the supplied manifest for the target browser; do not load `manifest.chrome.json` or `manifest.firefox.json` directly as `manifest.json` without first copying/renaming it.

For a release, push a version tag whose version matches both manifests:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Project structure

```text
.github/workflows/release.yml  Tagged-release packaging and GitHub Release publication
assets/                        Repository assets, including the README interface preview
scripts/package.sh             Reproducible Chrome/Firefox ZIP packaging
src/background.js              Proxy, authentication, location, and timezone logic
src/popup.html                 Extension popup markup
src/popup.js                   Popup validation and interaction logic
src/popup.css                  Popup styling
manifest.chrome.json           Chromium-family Manifest V3 configuration
manifest.firefox.json          Firefox Manifest V3 configuration
```

## Limitations and troubleshooting

- **A proxy will not connect:** verify the host, port, protocol, and whether the provider expects both authentication fields. Another extension, enterprise policy, or browser setting may control proxy settings.
- **Location is unavailable:** the proxy can remain connected even if `ipwho.is` is unavailable or does not return a timezone. Try **Refresh location** later.
- **Timezone did not change:** timezone emulation requires the `debugger` permission and an active HTTP(S) tab. It is tab-scoped and may be unavailable when another debugger is attached.
- **Firefox will not install permanently:** unsigned extensions are normally limited to temporary/developer installation; use Firefox's signing/distribution process.
- **Local services bypass the proxy:** this is intentional because the configured rules include `<local>`.

## Version history

- **Current source version: 1.0.0.** A GitHub Release is created only after the matching `v1.0.0` tag is pushed.

## License and acknowledgements

No license file is currently included in this repository; all rights are reserved unless the repository owner adds a license. Location information is provided by [`ipwho.is`](https://ipwho.is/).

For bugs, compatibility issues, or feature requests, use the repository's [issue tracker](../../issues).
