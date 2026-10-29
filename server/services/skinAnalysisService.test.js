const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeSkinRegions } = require("./skinAnalysisService");

test("normalizes valid visible skin-observation boxes", () => {
  const regions = normalizeSkinRegions(
    [{
      label: "Spots",
      note: "  A few visible marks  across the left cheek. ",
      box: { x: 120, y: 240, width: 180, height: 140 },
    }],
    true,
  );

  assert.deepEqual(regions, [{
    label: "Spots",
    note: "A few visible marks across the left cheek.",
    box: { x: 120, y: 240, width: 180, height: 140 },
  }]);
});

test("clamps boxes to the image and drops invalid or duplicate regions", () => {
  const regions = normalizeSkinRegions(
    [
      { label: "Texture", note: "Visible texture", box: { x: -40, y: 80, width: 220, height: 130 } },
      { label: "Texture", note: "Duplicate marker", box: { x: 100, y: 100, width: 200, height: 200 } },
      { label: "Pores", note: "Bad dimensions", box: { x: 200, y: 200, width: -2, height: 60 } },
      { label: "Unknown", note: "Not an allowed category", box: { x: 200, y: 200, width: 100, height: 100 } },
      { label: "Hydration", note: "Outside image", box: { x: 980, y: 980, width: 100, height: 100 } },
    ],
    true,
  );

  assert.deepEqual(regions, [{
    label: "Texture",
    note: "Visible texture",
    box: { x: 0, y: 80, width: 180, height: 130 },
  }]);
});

test("does not return face markers when no face is detected", () => {
  assert.deepEqual(
    normalizeSkinRegions(
      [{ label: "Spots", note: "Visible marks", box: { x: 100, y: 100, width: 120, height: 120 } }],
      false,
    ),
    [],
  );
});
