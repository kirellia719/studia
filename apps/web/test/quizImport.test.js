import test from "node:test";
import assert from "node:assert/strict";

import {
    decodeTextBuffer,
    documentXmlToText,
    normalizeText,
    parseQuizText,
} from "../src/features/quizzes/lib/quizImport.js";

const viSample = [
    "1. Thủ đô của Lào là gì?",
    "*A. Viêng Chăn",
    "B. Luang Prabang",
    "C. Savannakhet",
    "D. Pakse",
    "",
    "2. Câu hỏi số hai?",
    "A. Sai",
    "B. Đúng",
    "*C. Cũng đúng",
    "D. Sai nữa",
].join("\r\n");

const laoSample = [
    "໑. ພາສາລາວມີກີ່ສຽງ?",
    "*ກ. ໖ ສຽງ",
    "ຂ. ໕ ສຽງ",
    "ຄ. ໔ ສຽງ",
    "ງ. ໓ ສຽງ",
].join("\n");

test("parseQuizText: đọc đúng mẫu tiếng Việt, xuống dòng CRLF", () => {
    const { questions, warnings } = parseQuizText(viSample);

    assert.equal(questions.length, 2);
    assert.equal(questions[0].content, "Thủ đô của Lào là gì?");
    assert.equal(questions[0].options.length, 4);
    assert.deepEqual(
        questions[0].options.map((option) => option.isCorrect),
        [true, false, false, false]
    );
    assert.equal(questions[1].options[2].isCorrect, true);
    assert.equal(warnings.length, 0);
});

test("parseQuizText: đọc được số thứ tự và nhãn đáp án tiếng Lào", () => {
    const { questions, warnings } = parseQuizText(laoSample);

    assert.equal(questions.length, 1);
    assert.equal(questions[0].content, "ພາສາລາວມີກີ່ສຽງ?");
    assert.equal(questions[0].options.length, 4);
    assert.equal(questions[0].options[0].content, "໖ ສຽງ");
    assert.equal(questions[0].options[0].isCorrect, true);
    assert.equal(warnings.length, 0);
});

test("parseQuizText: gộp dòng nối tiếp vào câu hỏi và đáp án", () => {
    const { questions } = parseQuizText(
        ["1. Câu hỏi dài", "nối tiếp ở dòng sau?", "*A. Đáp án", "cũng nối tiếp", "B. Khác"].join("\n")
    );

    assert.equal(questions[0].content, "Câu hỏi dài nối tiếp ở dòng sau?");
    assert.equal(questions[0].options[0].content, "Đáp án cũng nối tiếp");
});

test("parseQuizText: thiếu dấu * thì chọn đáp án đầu và cảnh báo", () => {
    const { questions, warnings } = parseQuizText(
        ["1. Câu hỏi?", "A. Một", "B. Hai"].join("\n")
    );

    assert.equal(questions[0].options[0].isCorrect, true);
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].level, "warn");
});

test("parseQuizText: nhiều dấu * thì chỉ giữ đáp án đúng đầu tiên", () => {
    const { questions, warnings } = parseQuizText(
        ["1. Câu hỏi?", "*A. Một", "*B. Hai", "C. Ba"].join("\n")
    );

    assert.deepEqual(
        questions[0].options.map((option) => option.isCorrect),
        [true, false, false]
    );
    assert.match(warnings[0].message, /nhiều đáp án/);
});

test("parseQuizText: cắt bớt khi quá 6 đáp án và báo cảnh báo", () => {
    const lines = ["1. Câu hỏi?", "*A. Một", "B. Hai", "C. Ba", "D. Bốn", "E. Năm", "F. Sáu", "G. Bảy"];

    const { questions, warnings } = parseQuizText(lines.join("\n"));

    assert.equal(questions[0].options.length, 6);
    assert.match(warnings[0].message, /6 đáp án/);
});

test("parseQuizText: bỏ câu không đủ 2 đáp án và ghi lỗi", () => {
    const { questions, warnings } = parseQuizText(
        ["1. Câu hỏi thiếu đáp án?", "*A. Chỉ một"].join("\n")
    );

    assert.equal(questions.length, 0);
    assert.equal(warnings[0].level, "error");
});

test("parseQuizText: chấp nhận dấu * đặt sau nhãn", () => {
    const { questions } = parseQuizText(
        ["1. Câu hỏi?", "A*. Một", "B. Hai"].join("\n")
    );

    assert.equal(questions[0].options[0].isCorrect, true);
});

test("normalizeText: bỏ ký tự vô hình, đổi NBSP nhưng giữ nguyên số Lào", () => {
    const raw = "\uFEFF1.\u00A0Câu\u200B hỏi ໑໒";

    assert.equal(normalizeText(raw), "1. Câu hỏi ໑໒");
});

test("decodeTextBuffer: nhận diện UTF-8 có BOM và UTF-16LE", () => {
    const utf8 = new Uint8Array([
        0xef, 0xbb, 0xbf, 0x41, 0x2e, 0x20, 0xe1, 0xba, 0xa5,
    ]);

    assert.equal(decodeTextBuffer(utf8.buffer), "A. ấ");

    const utf16 = new Uint8Array([
        0xff, 0xfe, 0x41, 0x00, 0x2e, 0x00, 0x20, 0x00, 0xbf, 0x1e,
    ]);

    assert.equal(decodeTextBuffer(utf16.buffer), "A. ế");
});

test("documentXmlToText: tách đoạn, giải mã entity, giữ tab", () => {
    const xml = [
        "<w:body>",
        '<w:p><w:r><w:t>1. Câu &amp; hỏi?</w:t></w:r></w:p>',
        '<w:p><w:r><w:t>*A.</w:t></w:r><w:r><w:tab/></w:r><w:r><w:t>Đáp án</w:t></w:r></w:p>',
        "</w:body>",
    ].join("");

    assert.equal(
        documentXmlToText(xml),
        "1. Câu & hỏi?\n*A.\tĐáp án\n"
    );
});
