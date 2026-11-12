import { useEffect, useReducer, useRef, useState } from "react";

import {
    Check,
    FileUp,
    Plus,
    Save,
    Trash2,
    X,
} from "lucide-react";

import appToast from "@/lib/toast.js";

const MAX_OPTIONS = 6;
const MIN_OPTIONS = 2;

const createOption = (content = "", isCorrect = false) => ({
    content,
    isCorrect,
});

const createQuestion = () => ({
    content: "",
    explanation: "",
    options: [
        createOption("", true),
        createOption(),
        createOption(),
        createOption(),
    ],
});

const createInitialForm = (quiz) => {
    if (!quiz) {
        return {
            title: "Ôn tập cuối bài",
            description: "",
            passingScore: 70,
            questions: [createQuestion()],
        };
    }

    return {
        title: quiz.title ?? "",
        description: quiz.description ?? "",
        passingScore: quiz.passingScore ?? 70,
        questions:
            quiz.questions?.length > 0
                ? quiz.questions.map((question) => ({
                    content: question.content ?? "",
                    explanation: question.explanation ?? "",
                    options: question.options.map((option) => ({
                        content: option.content ?? "",
                        isCorrect: Boolean(option.isCorrect),
                    })),
                }))
                : [createQuestion()],
    };
};

const buildPayload = (form) => ({
    title: form.title.trim() || "Ôn tập cuối bài",
    description: form.description.trim(),
    passingScore: Number(form.passingScore),
    questions: form.questions.map((question) => ({
        content: question.content.trim(),
        explanation: question.explanation.trim(),
        options: question.options.map((option) => ({
            content: option.content.trim(),
            isCorrect: option.isCorrect,
        })),
    })),
});

const optionLabels = ["A", "B", "C", "D", "E", "F"];

const QuizForm = ({
    quiz,
    saving,
    onChange,
    onSubmit,
    onOpenImport,
}) => {
    const [form, setForm] = useState(() =>
        createInitialForm(quiz)
    );
    const [error, setError] = useState("");
    const [, refresh] = useReducer((version) => version + 1, 0);

    const baselineRef = useRef(null);

    if (baselineRef.current === null) {
        baselineRef.current = JSON.stringify(
            buildPayload(createInitialForm(quiz))
        );
    }

    const payload = buildPayload(form);
    const dirty = JSON.stringify(payload) !== baselineRef.current;

    useEffect(() => {
        onChange?.(payload, dirty);
    });

    const updateQuestion = (index, patch) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map(
                (question, questionIndex) =>
                    questionIndex === index
                        ? { ...question, ...patch }
                        : question
            ),
        }));
    };

    const updateOption = (
        questionIndex,
        optionIndex,
        patch
    ) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map(
                (question, currentQuestionIndex) => {
                    if (
                        currentQuestionIndex !==
                        questionIndex
                    ) {
                        return question;
                    }

                    return {
                        ...question,
                        options: question.options.map(
                            (option, currentOptionIndex) => {
                                if (
                                    patch.isCorrect &&
                                    currentOptionIndex !==
                                    optionIndex
                                ) {
                                    return {
                                        ...option,
                                        isCorrect: false,
                                    };
                                }

                                return currentOptionIndex ===
                                    optionIndex
                                    ? { ...option, ...patch }
                                    : option;
                            }
                        ),
                    };
                }
            ),
        }));
    };

    const addOption = (questionIndex) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map(
                (question, index) =>
                    index === questionIndex &&
                    question.options.length < MAX_OPTIONS
                        ? {
                            ...question,
                            options: [
                                ...question.options,
                                createOption(),
                            ],
                        }
                        : question
            ),
        }));
    };

    const removeOption = (
        questionIndex,
        optionIndex
    ) => {
        setForm((prev) => ({
            ...prev,
            questions: prev.questions.map(
                (question, index) => {
                    if (index !== questionIndex) {
                        return question;
                    }

                    if (
                        question.options.length <=
                        MIN_OPTIONS
                    ) {
                        return question;
                    }

                    const options = question.options.filter(
                        (_, currentIndex) =>
                            currentIndex !== optionIndex
                    );

                    if (!options.some((option) => option.isCorrect)) {
                        options[0] = {
                            ...options[0],
                            isCorrect: true,
                        };
                    }

                    return { ...question, options };
                }
            ),
        }));
    };

    const addQuestion = () => {
        setForm((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                createQuestion(),
            ],
        }));
    };

    const removeQuestion = (index) => {
        setForm((prev) => {
            if (prev.questions.length <= 1) {
                return prev;
            }

            return {
                ...prev,
                questions: prev.questions.filter(
                    (_, questionIndex) =>
                        questionIndex !== index
                ),
            };
        });
    };

    const validate = () => {
        for (
            let index = 0;
            index < form.questions.length;
            index += 1
        ) {
            const question = form.questions[index];

            if (!question.content.trim()) {
                return `Câu ${index + 1} chưa có nội dung.`;
            }

            if (question.options.length < MIN_OPTIONS) {
                return `Câu ${index + 1} cần ít nhất ${MIN_OPTIONS} đáp án.`;
            }

            if (
                question.options.some(
                    (option) => !option.content.trim()
                )
            ) {
                return `Câu ${index + 1} có đáp án để trống.`;
            }

            const correctCount = question.options.filter(
                (option) => option.isCorrect
            ).length;

            if (correctCount !== 1) {
                return `Câu ${index + 1} phải có đúng 1 đáp án đúng.`;
            }
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) return;

        const message = validate();

        if (message) {
            setError(message);
            appToast.error(message);
            return;
        }

        setError("");

        const saved = await onSubmit(payload);

        if (saved) {
            baselineRef.current = JSON.stringify(payload);
            refresh();
        }
    };

    const handleReset = () => {
        const initial = createInitialForm(quiz);

        setForm(initial);
        setError("");
        baselineRef.current = JSON.stringify(
            buildPayload(initial)
        );
        refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="block">
            <div className="space-y-4 px-4 py-4 sm:px-5">
                {error && (
                    <p className="rounded-xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-3 py-2 text-[12px] font-medium leading-5 text-[var(--danger)]">
                        {error}
                    </p>
                )}

                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <label
                                htmlFor="quiz-passing-score"
                                className="block text-[12px] font-medium text-[var(--muted)]"
                            >
                                Điểm đạt (%)
                            </label>

                            <p className="mt-0.5 text-[12px] leading-4 text-[var(--faint)]">
                                {Number(form.passingScore) > 0
                                    ? `Bắt buộc đạt tối thiểu ${form.passingScore}% để bài được tính hoàn thành.`
                                    : "Để 0 nếu không cần đạt đề — học sinh xem xong là hoàn thành bài."}
                            </p>
                        </div>

                        <input
                            id="quiz-passing-score"
                            type="number"
                            min={0}
                            max={100}
                            step={5}
                            value={form.passingScore}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    passingScore:
                                        event.target.value,
                                }))
                            }
                            className="h-11 w-20 shrink-0 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 text-center text-[14px] tabular-nums text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {form.questions.map(
                        (question, questionIndex) => (
                            <div
                                key={questionIndex}
                                className="rounded-xl border border-[var(--line)] bg-[var(--surface-3)] p-3 sm:p-4"
                            >
                                <div className="mb-2.5 flex items-center justify-between gap-2">
                                    <span className="inline-flex h-7 items-center rounded-lg bg-[var(--brand-soft)] px-2.5 text-[12px] font-semibold text-[var(--brand-text)]">
                                        Câu {questionIndex + 1}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeQuestion(
                                                questionIndex
                                            )
                                        }
                                        disabled={
                                            form.questions
                                                .length <= 1
                                        }
                                        aria-label={`Xóa câu ${questionIndex + 1}`}
                                        className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--faint)] transition hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>

                                <textarea
                                    aria-label={`Nội dung câu ${questionIndex + 1}`}
                                    value={question.content}
                                    onChange={(event) =>
                                        updateQuestion(
                                            questionIndex,
                                            {
                                                content:
                                                    event.target.value,
                                            }
                                        )
                                    }
                                    placeholder="Nhập nội dung câu hỏi..."
                                    rows={2}
                                    maxLength={500}
                                    className="w-full resize-y rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-[14px] leading-6 text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
                                />

                                <div className="mt-3 space-y-2">
                                    {question.options.map(
                                        (option, optionIndex) => (
                                            <div
                                                key={optionIndex}
                                                className="flex items-center gap-2"
                                            >
                                                <label
                                                    className={[
                                                        "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border text-[12px] font-semibold transition",
                                                        option.isCorrect
                                                            ? "border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]"
                                                            : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]",
                                                    ].join(" ")}
                                                    title="Chọn làm đáp án đúng"
                                                >
                                                    <input
                                                        type="radio"
                                                        aria-label={`Chọn đáp án ${optionLabels[optionIndex]} là đáp án đúng`}
                                                        name={`quiz-question-${questionIndex}`}
                                                        checked={
                                                            option.isCorrect
                                                        }
                                                        onChange={() =>
                                                            updateOption(
                                                                questionIndex,
                                                                optionIndex,
                                                                {
                                                                    isCorrect: true,
                                                                }
                                                            )
                                                        }
                                                        className="sr-only"
                                                    />

                                                    {option.isCorrect ? (
                                                        <Check
                                                            size={15}
                                                        />
                                                    ) : (
                                                        optionLabels[
                                                            optionIndex
                                                        ]
                                                    )}
                                                </label>

                                                <input
                                                    type="text"
                                                    aria-label={`Nội dung đáp án ${optionLabels[optionIndex]}`}
                                                    value={option.content}
                                                    onChange={(event) =>
                                                        updateOption(
                                                            questionIndex,
                                                            optionIndex,
                                                            {
                                                                content:
                                                                    event
                                                                        .target
                                                                        .value,
                                                            }
                                                        )
                                                    }
                                                    placeholder={`Đáp án ${optionLabels[optionIndex]}`}
                                                    maxLength={300}
                                                    className="h-11 min-w-0 flex-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-[13px] text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeOption(
                                                            questionIndex,
                                                            optionIndex
                                                        )
                                                    }
                                                    disabled={
                                                        question.options
                                                            .length <=
                                                        MIN_OPTIONS
                                                    }
                                                    aria-label={`Xóa đáp án ${optionLabels[optionIndex]}`}
                                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--faint)] transition hover:bg-[var(--surface-2)] hover:text-[var(--danger)] disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            addOption(questionIndex)
                                        }
                                        disabled={
                                            question.options.length >=
                                            MAX_OPTIONS
                                        }
                                        className="inline-flex h-11 items-center gap-1 rounded-full border border-dashed border-[var(--line)] px-3 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Plus size={14} />
                                        Thêm đáp án
                                    </button>

                                    <span className="text-[12px] text-[var(--faint)]">
                                        Bấm ô chữ cái để chọn đáp
                                        án đúng
                                    </span>
                                </div>

                                <input
                                    type="text"
                                    value={question.explanation}
                                    onChange={(event) =>
                                        updateQuestion(
                                            questionIndex,
                                            {
                                                explanation:
                                                    event.target.value,
                                            }
                                        )
                                    }
                                    placeholder="Giải thích đáp án (không bắt buộc)"
                                    maxLength={500}
                                    className="mt-3 h-11 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-[13px] text-[var(--ink)] outline-none transition focus:border-[var(--brand)]"
                                />
                            </div>
                        )
                    )}
                </div>

                <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-[var(--line)] text-[13px] font-medium text-[var(--muted)] transition hover:border-[var(--brand)] hover:bg-[var(--surface-3)] hover:text-[var(--brand-text)]"
                >
                    <Plus size={16} />
                    Thêm câu hỏi
                </button>
            </div>

            <div className="sticky bottom-0 z-10 border-t border-[var(--line)] bg-[var(--surface)]/95 px-4 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-5 sm:pb-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onOpenImport}
                        disabled={saving}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:gap-1.5 sm:px-3.5 sm:text-[13px] sm:font-medium"
                    >
                        <FileUp size={16} />

                        <span className="hidden sm:inline">
                            Nhập từ file
                        </span>
                    </button>

                    {dirty && (
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={saving}
                            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full px-2.5 text-[12px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
                        >
                            Hoàn tác
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={saving || !dirty}
                        className="ml-auto inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--brand-solid)] px-5 text-[13px] font-semibold text-white transition hover:bg-[var(--brand-solid-hover)] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                    >
                        <Save size={16} />

                        {saving ? "Đang lưu..." : "Lưu đề"}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default QuizForm;
