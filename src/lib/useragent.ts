export function parseUserAgent(ua: string) {
  let browser = "Unknown Browser";
  let device = "Unknown Device/OS";

  // Browser checks
  if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua) && !/opr|opera/i.test(ua)) {
    browser = "Chrome";
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = "Safari";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  } else if (/edge|edg/i.test(ua)) {
    browser = "Edge";
  } else if (/opr|opera/i.test(ua)) {
    browser = "Opera";
  } else if (/trident|msie/i.test(ua)) {
    browser = "Internet Explorer";
  }

  // OS / Device checks
  if (/windows/i.test(ua)) {
    device = "Windows";
  } else if (/macintosh|mac os x/i.test(ua) && !/iphone|ipad|ipod/i.test(ua)) {
    device = "macOS";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    device = /iphone/i.test(ua) ? "iPhone" : "iPad";
  } else if (/android/i.test(ua)) {
    device = "Android";
  } else if (/linux/i.test(ua)) {
    device = "Linux";
  }

  return { browser, device };
}
