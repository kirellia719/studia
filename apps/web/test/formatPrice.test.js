import test from "node:test";
import assert from "node:assert/strict";

import formatPrice from "../src/lib/format/formatPrice.js";

test("formatPrice: 0 và giá trị rỗng là miễn phí", () => {
    assert.equal(formatPrice(0), "Miễn phí");
    assert.equal(formatPrice(null), "Miễn phí");
    assert.equal(formatPrice(undefined), "Miễn phí");
});

test("formatPrice: giá lưu theo nghìn đồng được đổi ra VNĐ", () => {
    assert.equal(formatPrice(299), "299.000 đ");
    assert.equal(formatPrice(599), "599.000 đ");
    assert.equal(formatPrice(1200), "1.200.000 đ");
});

test("formatPrice: nhận cả chuỗi số", () => {
    assert.equal(formatPrice("599"), "599.000 đ");
});
