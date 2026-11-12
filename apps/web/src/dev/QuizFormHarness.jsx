import { createRoot } from "react-dom/client";

import "@/styles/index.css";

import QuizForm from "@/features/quizzes/components/QuizForm.jsx";

const question = {
    id: "q1",
    content: "Câu nào đúng để nói \"Tôi là học sinh\"?",
    explanation: "",
    options: [
        { id: "a", content: "ຂ້ອຍເປັນນັກຮຽນ", isCorrect: true },
        { id: "b", content: "ຂ້ອຍຄືນັກຮຽນບໍ່", isCorrect: false },
        { id: "c", content: "ນັກຮຽນແມ່ນຂ້ອຍບໍ່", isCorrect: false },
    ],
};

const createQuiz = (passingScore) => ({
    id: `demo-${passingScore}`,
    title: "Ôn tập cuối bài",
    description: "Phân biệt cách dùng ຄື và ແມ່ນ.",
    passingScore,
    isPublished: true,
    questions: [question],
});

const noop = () => {};

const Demo = () => (
    <div className="mx-auto max-w-[420px] space-y-4 p-3">
        {[0, 50].map((passingScore) => (
            <section
                key={passingScore}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
            >
                <p className="border-b border-[var(--surface-2)] px-4 py-2 text-[12px] font-semibold text-[var(--muted)]">
                    Harness · passingScore = {passingScore}
                </p>

                <QuizForm
                    quiz={createQuiz(passingScore)}
                    saving={false}
                    onChange={noop}
                    onSubmit={async () => true}
                    onOpenImport={noop}
                />
            </section>
        ))}
    </div>
);

createRoot(document.getElementById("root")).render(<Demo />);
