const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeMessage } = require("./notifications");

test("accepts a complete notification with a local app route", () => {
  assert.deepEqual(
    normalizeMessage({
      title: "Order status",
      body: "Your order is on its way.",
      category: "order-update",
      url: "/my-orders",
    }),
    {
      title: "Order status",
      body: "Your order is on its way.",
      category: "order-update",
      url: "/my-orders",
    },
  );
});

test("rejects oversized notifications and external links", () => {
  assert.match(
    normalizeMessage({
      title: "A".repeat(81),
      body: "Message",
      category: "notice",
    }).error,
    /80 characters/,
  );
  assert.match(
    normalizeMessage({
      title: "Update",
      body: "Message",
      category: "notice",
      url: "https://example.com",
    }).error,
    /in-app path/,
  );
});

test("rejects unsupported notification categories", () => {
  assert.match(
    normalizeMessage({
      title: "Update",
      body: "Message",
      category: "unknown",
    }).error,
    /category/,
  );
});

test("rejects a non-object request body", () => {
  assert.match(normalizeMessage(null).error, /must be an object/);
  assert.match(normalizeMessage([]).error, /must be an object/);
});
