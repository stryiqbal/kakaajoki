const LEGACY_ORDER_ID_PATTERN = /^KKJ-[a-f\d]{32}$/i;
const ORDER_ID_PATTERN = /^KJ\/(\d{8})\/(\d{4,})$/i;

export function normalizeOrderId(value: string) {
  const orderId = value.trim();
  if (LEGACY_ORDER_ID_PATTERN.test(orderId)) {
    return `KKJ-${orderId.slice(4).toLowerCase()}`;
  }

  const match = orderId.match(ORDER_ID_PATTERN);
  if (!match) return null;

  return `KJ/${match[1]}/${match[2].padStart(4, "0")}`;
}

export function getOrderNumber(orderId: string) {
  const normalizedOrderId = normalizeOrderId(orderId);
  if (!normalizedOrderId) return orderId.slice(-6).toUpperCase();
  if (normalizedOrderId.startsWith("KJ/")) {
    return normalizedOrderId.split("/").at(-1) ?? "";
  }
  return normalizedOrderId.slice(-6).toUpperCase();
}

export function getJakartaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const partValues = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${partValues.year}${partValues.month}${partValues.day}`;
}