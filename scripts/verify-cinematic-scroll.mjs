import { mkdir, writeFile } from "node:fs/promises";

const pages = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const page = pages.find((item) => item.type === "page" && item.url.includes("/cars/h6-hev"));

if (!page?.webSocketDebuggerUrl) {
  throw new Error("لم تُعثر جلسة H6 المفتوحة للتحقق من التمرير.");
}

const socket = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let requestId = 0;

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++requestId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result);
  }
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

await mkdir("/home/ubuntu/webdev-static-assets/scroll-verification", { recursive: true });

for (const marker of [2, 4]) {
  await send("Runtime.evaluate", {
    expression: `document.getElementById('reel-${marker}')?.scrollIntoView({ block: 'center', behavior: 'instant' });`,
  });
  await new Promise((resolve) => setTimeout(resolve, 900));
  const state = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `JSON.stringify({
      marker: ${marker},
      scrollY: Math.round(window.scrollY),
      reel: document.querySelector('.cinematic-stage-meta span:last-child')?.textContent?.trim(),
      eyebrow: document.querySelector('.cinematic-stage-copy p span')?.textContent?.trim(),
      title: document.querySelector('.cinematic-stage-copy h2')?.textContent?.trim()
    })`,
  });
  const screenshot = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
  await writeFile(`/home/ubuntu/webdev-static-assets/scroll-verification/h6-reel-${marker}.png`, Buffer.from(screenshot.data, "base64"));
  console.log(state.result.value);
}

socket.close();
