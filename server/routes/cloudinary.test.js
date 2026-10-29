const test = require("node:test");
const assert = require("node:assert/strict");
const { getPublicId } = require("./cloudinary");

test("extracts a namespaced Cloudinary public ID", () => {
  assert.equal(
    getPublicId(
      "https://res.cloudinary.com/dhppdatrl/image/upload/v123/zyvar/user-1/photo.jpg",
    ),
    "zyvar/user-1/photo",
  );
});

test("extracts a public ID when Cloudinary transformations precede its version", () => {
  assert.equal(
    getPublicId(
      "https://res.cloudinary.com/dhppdatrl/image/upload/c_fill,w_400/v123/zyvar/user-1/photo.png",
    ),
    "zyvar/user-1/photo",
  );
});

test("rejects images from other Cloudinary accounts and non-image resources", () => {
  assert.equal(
    getPublicId("https://res.cloudinary.com/other/image/upload/v123/photo.jpg"),
    null,
  );
  assert.equal(
    getPublicId("https://res.cloudinary.com/dhppdatrl/video/upload/v123/video.mp4"),
    null,
  );
});
