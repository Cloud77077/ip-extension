# H&M Change

![H&M Change banner](assets/banner.svg)

**H&M Change** is a monochrome, privacy-focused browser extension for switching one proxy and optionally matching the active tab's timezone to the proxy exit country's timezone. This is the downloadable **v1.0.0** release.

## Download H&M Change v1.0.0

| Platform | Download | What to use |
| --- | --- | --- |
| **Desktop — Chrome, Chromium, Edge, Brave** | [**Download Chrome extension (ZIP)**](../../releases/download/v1.0.0/hm-change-chrome.zip) | Use this build in Chromium-family desktop browsers. |
| **Mobile — supported Chromium browsers** | [**Download mobile Chrome extension (ZIP)**](../../releases/download/v1.0.0/hm-change-chrome.zip) | For browsers such as Lemur or Quetta *only when their version supports installing unpacked Chrome extensions*. |
| **Desktop — Firefox** | [**Download Firefox extension (ZIP)**](../../releases/download/v1.0.0/hm-change-firefox.zip) | Use the Firefox build for temporary/developer installation or AMO signing. |
| **Mobile — Firefox for Android** | [**Download Firefox extension (ZIP)**](../../releases/download/v1.0.0/hm-change-firefox.zip) | Firefox Android normally accepts only AMO-listed add-ons; this ZIP is for development-capable Firefox builds. |

## Install on desktop

### Chrome, Chromium, Edge, or Brave

1. Download the [Chrome ZIP](../../releases/download/v1.0.0/hm-change-chrome.zip) and extract it.
2. Open your browser's extensions page (for example, `chrome://extensions`).
3. Turn on **Developer mode**.
4. Select **Load unpacked** and select the extracted folder.
5. Pin **H&M Change** and open it from the toolbar.

### Firefox

1. Download the [Firefox ZIP](../../releases/download/v1.0.0/hm-change-firefox.zip) and extract it.
2. For a temporary test install, open `about:debugging#/runtime/this-firefox`.
3. Select **Load Temporary Add-on** and choose the extracted `manifest.json`.
4. For a normal persistent Firefox installation, submit/sign the package through AMO.

## Install on mobile

### Chromium-based mobile browsers

Download the [mobile Chrome ZIP](../../releases/download/v1.0.0/hm-change-chrome.zip), extract it, then use your browser's extension-installation flow. Browser support varies by product, version, and platform: install it only if the browser provides an option such as **Load unpacked** or Chrome-extension installation.

### Firefox for Android

Download the [Firefox ZIP](../../releases/download/v1.0.0/hm-change-firefox.zip) for developer testing. Standard Firefox for Android generally installs extensions distributed through AMO, so this local package cannot be installed in the standard stable flow until it is signed and published there.

## Features

- HTTP, HTTPS, SOCKS4, and SOCKS5 proxies.
- Optional username/password proxy authentication.
- Client- and service-worker-side validation for the host, protocol, and port range.
- `<local>` bypass so local addresses are not proxied.
- Optional proxy-country lookup through `ipwho.is`, performed only after connecting or selecting **Refresh location**.
- Optional timezone emulation uses the browser debugging protocol for the current HTTP/HTTPS tab only.
- One-click disconnect clears the proxy, stored credentials, location, and active timezone override.

## Important limitations and safety

- Proxy credentials are stored in extension-local browser storage so the browser can answer proxy authentication challenges. Use a trusted profile/device and select **Disconnect** when finished.
- A proxy can see traffic that is not end-to-end encrypted. Prefer HTTPS sites and reputable proxy providers.
- Country detection is best-effort. If the location provider is unavailable, the proxy remains connected but no location/timezone is applied.
- Timezone matching requires the `debugger` permission and can cause a browser debugging indicator. It does not change the device, operating system, or every browser tab.
- Managed-browser policies or another proxy extension may prevent H&M Change from controlling proxy settings.

## Build packages yourself

No npm dependencies are required:

```bash
./scripts/package.sh chrome
./scripts/package.sh firefox
```

The commands produce `dist/hm-change-chrome.zip` and `dist/hm-change-firefox.zip`. On a `v1.0.0` tag, the release workflow builds these same archives and attaches them to the GitHub release; the download buttons above point to those release assets. The binary archives are deliberately not committed, keeping pull requests reviewable in source form.

## Screenshot / UI preview

The banner is a preview of H&M Change's white-and-black design. After loading the extension, select its toolbar icon to open the proxy controls.
