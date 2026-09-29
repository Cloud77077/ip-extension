# H&M Proxy Time

![H&M Proxy Time banner](assets/banner.svg)

A monochrome, privacy-focused browser extension for switching a single proxy and optionally matching the **active tab's** timezone to the country detected from the proxy exit IP.

## Downloads

| Browser family | Download | Install |
| --- | --- | --- |
| Chrome, Chromium, Edge, Brave, Quetta, Lemur | Build `hm-proxy-time-chrome.zip` with the command below. | Extract it, open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the extracted folder. Mobile browsers that expose Chrome extension loading use the same Chrome build. |
| Firefox desktop / Android builds that support add-ons | Build `hm-proxy-time-firefox.zip` with the command below. | Extract it and load the folder temporarily from `about:debugging#/runtime/this-firefox`. For normal Firefox distribution, submit/sign the package through AMO. |

> **Mobile note:** Quetta and Lemur extension support depends on their version and platform. If they offer “Load unpacked”/Chrome-extension installation, use the Chrome download. Firefox Android ordinarily only installs AMO-listed add-ons, so unsigned local ZIPs are for development-capable Firefox builds.

## Features

- HTTP, HTTPS, SOCKS4, and SOCKS5 proxies.
- Works with either `host:port` alone or optional username/password proxy authentication.
- Validates port range before changing browser proxy settings.
- Uses `<local>` bypass so local addresses are not proxied.
- Optional proxy-country lookup through `ipwho.is`; it is only performed after you connect or press **Refresh location**.
- Optional timezone emulation uses the browser debugging protocol for the current HTTPS/HTTP tab. It does **not** change the device, operating system, or every browser tab.
- One-click disconnect clears the proxy, stored credentials, location, and attached timezone override.

## Important limitations & safety

- Proxy credentials are stored in extension-local browser storage so the browser can answer proxy authentication challenges. Use a trusted browser profile/device and remove the proxy with **Disconnect** when finished.
- A proxy can see traffic that is not end-to-end encrypted. Prefer HTTPS sites and reputable proxy providers.
- Country detection is a best-effort public-IP lookup. If the provider is unavailable, the proxy stays connected but no location/timezone is applied.
- The timezone option needs the `debugger` permission and can cause the browser’s “debugging this tab” indicator. This is required by Chromium/Firefox APIs; a normal extension cannot change the system timezone.
- On managed browsers, policies or another proxy extension can prevent this extension from controlling proxy settings.

## Build packages yourself

No npm dependencies are required:

```bash
./scripts/package.sh chrome
./scripts/package.sh firefox
```

The command produces distributable ZIP files in the ignored `dist/` directory. They are intentionally generated locally rather than committed, so the pull request contains only reviewable text-based source files. The Chrome package uses `webRequestAuthProvider` for authenticated proxy challenges; the Firefox package uses its compatible blocking web-request permission.

## Screenshot / UI preview

The included banner is a visual preview of the white-and-black H&M-inspired design. After loading, click the toolbar icon to open the compact proxy control panel.
