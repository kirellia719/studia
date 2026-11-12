import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;

const daysFromNow = (days) => new Date(Date.now() + days * DAY);

// =========================================================
// Helpers (idempotent: chỉ tạo khi chưa có, không xoá dữ liệu)
// =========================================================

const ensureUser = async ({
    email,
    name,
    role,
    studentCode,
    isDelete = false,
}) => {
    const hashedPassword = await bcrypt.hash("123456", 10);

    return prisma.user.upsert({
        where: { email },
        update: {
            name,
            password: hashedPassword,
            role,
            studentCode,
            isDelete,
        },
        create: {
            name,
            email,
            password: hashedPassword,
            role,
            studentCode,
            isDelete,
        },
    });
};

const ensureCourse = async ({
    teacherId,
    title,
    description,
    thumbnail,
    price,
    durationMonths,
    status,
}) => {
    const existing = await prisma.course.findFirst({
        where: { teacherId, title, isDelete: false },
    });

    if (existing) {
        return prisma.course.update({
            where: { id: existing.id },
            data: {
                description,
                thumbnail,
                price,
                durationMonths,
                status,
            },
        });
    }

    return prisma.course.create({
        data: {
            teacherId,
            title,
            description,
            thumbnail,
            price,
            durationMonths,
            status,
        },
    });
};

const ensureLesson = async ({
    courseId,
    title,
    description,
    video,
    duration,
    order,
    isFree,
}) => {
    const existing = await prisma.lesson.findFirst({
        where: { courseId, order },
    });

    if (existing) {
        return prisma.lesson.update({
            where: { id: existing.id },
            data: {
                title,
                description,
                video,
                duration,
                isFree,
            },
        });
    }

    return prisma.lesson.create({
        data: {
            courseId,
            title,
            description,
            video,
            duration,
            order,
            isFree,
        },
    });
};

const ensureDocument = async ({
    lessonId,
    name,
    url,
    mimeType,
    size,
}) => {
    const existing = await prisma.lessonDocument.findFirst({
        where: { lessonId, name },
    });

    if (existing) {
        return prisma.lessonDocument.update({
            where: { id: existing.id },
            data: { url, mimeType, size },
        });
    }

    return prisma.lessonDocument.create({
        data: { lessonId, name, url, mimeType, size },
    });
};

const ensureQuiz = async ({
    lessonId,
    title,
    description,
    passingScore,
    isPublished,
}) => {
    return prisma.quiz.upsert({
        where: { lessonId },
        update: {
            title,
            description,
            passingScore,
            isPublished,
        },
        create: {
            lessonId,
            title,
            description,
            passingScore,
            isPublished,
        },
    });
};

const ensureQuestion = async ({
    quizId,
    content,
    explanation,
    order,
    options,
}) => {
    const existing = await prisma.question.findFirst({
        where: { quizId, order },
    });

    const question = existing
        ? await prisma.question.update({
              where: { id: existing.id },
              data: { content, explanation },
          })
        : await prisma.question.create({
              data: { quizId, content, explanation, order },
          });

    for (const [index, option] of options.entries()) {
        const current = await prisma.questionOption.findFirst({
            where: { questionId: question.id, order: index },
        });

        if (current) {
            await prisma.questionOption.update({
                where: { id: current.id },
                data: {
                    content: option.content,
                    isCorrect: option.isCorrect,
                },
            });
        } else {
            await prisma.questionOption.create({
                data: {
                    questionId: question.id,
                    content: option.content,
                    isCorrect: option.isCorrect,
                    order: index,
                },
            });
        }
    }

    return question;
};

const ensureEnrollment = async ({
    studentId,
    courseId,
    enrolledAt,
    expiresAt,
}) => {
    return prisma.enrollment.upsert({
        where: {
            studentId_courseId: { studentId, courseId },
        },
        update: { expiresAt },
        create: { studentId, courseId, enrolledAt, expiresAt },
    });
};

const ensureProgress = async ({
    studentId,
    lessonId,
    completedAt = null,
    lastAccessedAt = new Date(),
}) => {
    const existing = await prisma.lessonProgress.findUnique({
        where: {
            studentId_lessonId: { studentId, lessonId },
        },
    });

    if (existing) {
        return existing;
    }

    return prisma.lessonProgress.create({
        data: { studentId, lessonId, completedAt, lastAccessedAt },
    });
};

const ensureSubmittedAttempt = async ({
    quizId,
    studentId,
    answers, // [{ questionId, selectedOptionId }]
}) => {
    const existing = await prisma.quizAttempt.findFirst({
        where: { quizId, studentId, submittedAt: { not: null } },
    });

    if (existing) {
        return existing;
    }

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
            questions: {
                orderBy: { order: "asc" },
                include: { options: { orderBy: { order: "asc" } } },
            },
        },
    });

    const snapshot = quiz.questions.map((question, index) => {
        const correctOption = question.options.find(
            (option) => option.isCorrect
        );
        const selectedOptionId =
            answers[index]?.selectedOptionId ?? null;
        const selectedOption = question.options.find(
            (option) => option.id === selectedOptionId
        );

        return {
            questionId: question.id,
            order: question.order,
            questionContent: question.content,
            selectedOptionId,
            selectedContent: selectedOption?.content ?? null,
            correctOptionId: correctOption?.id ?? "",
            correctContent: correctOption?.content ?? "",
            explanation: question.explanation,
            isCorrect: selectedOptionId === correctOption?.id,
        };
    });

    const correctCount = snapshot.filter((a) => a.isCorrect).length;
    const totalQuestions = snapshot.length;
    const score =
        totalQuestions > 0
            ? Math.round((correctCount / totalQuestions) * 100)
            : 0;

    return prisma.quizAttempt.create({
        data: {
            quizId,
            studentId,
            startedAt: daysFromNow(-2),
            submittedAt: daysFromNow(-2),
            score,
            correctCount,
            totalQuestions,
            answers: { create: snapshot },
        },
    });
};

// =========================================================
// SEED
// =========================================================

async function main() {
    console.log("🌱 Starting database seed (giữ nguyên dữ liệu cũ)...\n");

    // =========================================================
    // 1. USERS
    // =========================================================

    const admin = await ensureUser({
        email: "admin@gmail.com",
        name: "Admin Stady",
        role: "ADMIN",
        studentCode: "ADMIN",
    });

    const teacher = await ensureUser({
        email: "teacher@gmail.com",
        name: "Nguyễn Văn Teacher",
        role: "TEACHER",
        studentCode: "TEACHER",
    });

    const teacher2 = await ensureUser({
        email: "teacher2@gmail.com",
        name: "Trần Thị Lào",
        role: "TEACHER",
        studentCode: "TEACHER2",
    });

    const student = await ensureUser({
        email: "student@gmail.com",
        name: "Nguyễn Văn Student",
        role: "STUDENT",
        studentCode: "HS0001",
    });

    const student2 = await ensureUser({
        email: "student2@gmail.com",
        name: "Lê Thị Mai",
        role: "STUDENT",
        studentCode: "HS0002",
    });

    const student3 = await ensureUser({
        email: "student3@gmail.com",
        name: "Phạm Văn Hùng",
        role: "STUDENT",
        studentCode: "HS0003",
    });

    const student4 = await ensureUser({
        email: "student4@gmail.com",
        name: "Đỗ Minh Anh",
        role: "STUDENT",
        studentCode: "HS0004",
    });

    // Tài khoản đã xoá mềm để test chức năng khôi phục của Admin
    const formerStudent = await ensureUser({
        email: "former@gmail.com",
        name: "Nguyễn Văn Cũ",
        role: "STUDENT",
        studentCode: "HS0005",
        isDelete: true,
    });

    console.log("✅ Users ready");

    // =========================================================
    // 2. COURSES (giáo viên 1)
    // =========================================================

    const courseBasic = await ensureCourse({
        teacherId: teacher.id,
        title: "Tiếng Lào giao tiếp cho người mới",
        description:
            "Khóa học mẫu: chào hỏi, giới thiệu bản thân, số đếm và các tình huống giao tiếp hằng ngày.",
        thumbnail: "/uploads/courses/b5498dc0-68d4-4e79-80e6-35a4fd0457ce.jpeg",
        price: 0,
        durationMonths: 6,
        status: true,
    });

    const courseListening = await ensureCourse({
        teacherId: teacher.id,
        title: "Luyện nghe tiếng Lào trình độ A2",
        description:
            "Khóa học mẫu: luyện nghe hội thoại sân bay, tin tức và đời sống.",
        thumbnail: "/uploads/courses/bcb7b70b-de8f-4781-9f5b-99a7ffb2d10e.jpg",
        price: 299,
        durationMonths: 3,
        status: true,
    });

    const courseGrammar = await ensureCourse({
        teacherId: teacher.id,
        title: "Ngữ pháp tiếng Lào nâng cao",
        description:
            "Khóa học mẫu: cấu trúc câu, thì và các mẫu ngữ pháp nâng cao.",
        thumbnail: "/uploads/courses/d7e6a0cc-fdac-4c92-ab18-5a6c8109f75d.png",
        price: 599,
        durationMonths: 12,
        status: true,
    });

    const courseBusiness = await ensureCourse({
        teacherId: teacher2.id,
        title: "Tiếng Lào thương mại",
        description:
            "Khóa học mẫu đang tạm khóa để kiểm tra trạng thái khóa học.",
        thumbnail: "/uploads/courses/b5498dc0-68d4-4e79-80e6-35a4fd0457ce.jpeg",
        price: 1200,
        durationMonths: 6,
        status: false,
    });

    console.log("✅ Courses ready");

    // =========================================================
    // 3. LESSONS
    // =========================================================

    const basicLesson1 = await ensureLesson({
        courseId: courseBasic.id,
        title: "Chào hỏi và giới thiệu bản thân",
        description:
            "Mẫu câu chào hỏi, tự giới thiệu tên, quốc tịch và nghề nghiệp.",
        video: "/uploads/lessons/15bc89e9-04ca-4e8b-9d30-337258588849.mp4",
        duration: 20,
        order: 1,
        isFree: true,
    });

    const basicLesson2 = await ensureLesson({
        courseId: courseBasic.id,
        title: "Số đếm và mua bán cơ bản",
        description:
            "Số đếm từ 1 đến 100, hỏi giá và trả giá khi mua hàng.",
        video: "/uploads/lessons/6476e509-c0f1-4f1c-bbcc-5772da195a34.mp4",
        duration: 277,
        order: 2,
        isFree: false,
    });

    const basicLesson3 = await ensureLesson({
        courseId: courseBasic.id,
        title: "Hỏi đường và di chuyển",
        description:
            "Hỏi đường, chỉ đường và các phương tiện di chuyển thông dụng.",
        video: "/uploads/lessons/fca6e518-adb6-40fa-b313-056a42d6325e.mp4",
        duration: 277,
        order: 3,
        isFree: false,
    });

    const listeningLesson1 = await ensureLesson({
        courseId: courseListening.id,
        title: "Nghe hội thoại tại sân bay",
        description:
            "Luyện nghe các đoạn hội thoại làm thủ tục và nhập cảnh.",
        video: "/uploads/lessons/6476e509-c0f1-4f1c-bbcc-5772da195a34.mp4",
        duration: 277,
        order: 1,
        isFree: true,
    });

    const listeningLesson2 = await ensureLesson({
        courseId: courseListening.id,
        title: "Nghe tin tức và dự báo thời tiết",
        description:
            "Luyện nghe tin tức ngắn và dự báo thời tiết.",
        video: "/uploads/lessons/fca6e518-adb6-40fa-b313-056a42d6325e.mp4",
        duration: 277,
        order: 2,
        isFree: false,
    });

    const grammarLesson1 = await ensureLesson({
        courseId: courseGrammar.id,
        title: "Cấu trúc câu với ຄື / ແມ່ນ",
        description:
            "Cách dùng ຄື (là) và ແມ່ນ (đúng là) trong câu khẳng định.",
        video: "/uploads/lessons/15bc89e9-04ca-4e8b-9d30-337258588849.mp4",
        duration: 20,
        order: 1,
        isFree: true,
    });

    const grammarLesson2 = await ensureLesson({
        courseId: courseGrammar.id,
        title: "Thì hiện tại và quá khứ",
        description:
            "Phân biệt các trạng từ chỉ thời gian và cách chia thì.",
        video: "/uploads/lessons/6476e509-c0f1-4f1c-bbcc-5772da195a34.mp4",
        duration: 277,
        order: 2,
        isFree: false,
    });

    const businessLesson1 = await ensureLesson({
        courseId: courseBusiness.id,
        title: "Từ vựng văn phòng",
        description:
            "Từ vựng và mẫu câu dùng trong môi trường công sở.",
        video: "/uploads/lessons/15bc89e9-04ca-4e8b-9d30-337258588849.mp4",
        duration: 20,
        order: 1,
        isFree: false,
    });

    console.log("✅ Lessons ready");

    // =========================================================
    // 4. LESSON DOCUMENTS
    // =========================================================

    const documentPdf = await ensureDocument({
        lessonId: basicLesson1.id,
        name: "Bài giảng chào hỏi.pdf",
        url: "/uploads/documents/ce6cd1ce-3f94-4427-be11-5bf61241ece6.pdf",
        mimeType: "application/pdf",
        size: 182154,
    });

    const documentDocx = await ensureDocument({
        lessonId: basicLesson1.id,
        name: "Bài tập tuần 1.docx",
        url: "/uploads/documents/6689c74e-8c67-4ca9-9aa9-319af02e9b5d.docx",
        mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 1294535,
    });

    await ensureDocument({
        lessonId: grammarLesson1.id,
        name: "Slide ngữ pháp.pptx",
        url: "/uploads/documents/f7d5a204-1f55-4b86-a9ca-e8c8b6ce2508.pptx",
        mimeType:
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        size: 4202462,
    });

    console.log("✅ Documents ready");

    // =========================================================
    // 5. QUIZZES
    // =========================================================

    const quizBasic1 = await ensureQuiz({
        lessonId: basicLesson1.id,
        title: "Ôn tập: Chào hỏi cơ bản",
        description:
            "Đề mẫu gồm 3 câu hỏi về mẫu câu chào hỏi.",
        passingScore: 60,
        isPublished: true,
    });

    const quizBasic1Questions = [
        {
            content: "Câu nào dùng để chào hỏi lịch sự?",
            explanation: "ສະບາຍດີ là lời chào thông dụng.",
            order: 0,
            options: [
                { content: "ສະບາຍດີ", isCorrect: true },
                { content: "ຂອບໃຈ", isCorrect: false },
                { content: "ລາກ່ອນ", isCorrect: false },
                { content: "ຂໍໂທດ", isCorrect: false },
            ],
        },
        {
            content: "Muốn hỏi tên của người khác, dùng câu nào?",
            explanation: "ເຈົ້າຊື່ຫຍັງ? = Bạn tên gì?",
            order: 1,
            options: [
                { content: "ເຈົ້າຊື່ຫຍັງ?", isCorrect: true },
                { content: "ເຈົ້າອາຍຸເທົ່າໃດ?", isCorrect: false },
                { content: "ເຈົ້າມາຈາກໃສ?", isCorrect: false },
            ],
        },
        {
            content: "Đáp lại lời cảm ơn ຂອບໃຈ bằng câu nào?",
            explanation: "ບໍ່ເປັນຫຍັງ = Không có gì.",
            order: 2,
            options: [
                { content: "ບໍ່ເປັນຫຍັງ", isCorrect: true },
                { content: "ສະບາຍດີ", isCorrect: false },
                { content: "ຍິນດີຕ້ອນຮັບ", isCorrect: false },
                { content: "ໄປໃສ", isCorrect: false },
            ],
        },
    ];

    for (const question of quizBasic1Questions) {
        await ensureQuestion({ quizId: quizBasic1.id, ...question });
    }

    // Đề nháp (chưa xuất bản) để test trạng thái soạn đề
    const quizBasic2 = await ensureQuiz({
        lessonId: basicLesson2.id,
        title: "Đề nháp: Số đếm",
        description: "Đề đang soạn, học sinh không thấy.",
        passingScore: 70,
        isPublished: false,
    });

    await ensureQuestion({
        quizId: quizBasic2.id,
        content: "Số 5 trong tiếng Lào là gì?",
        explanation: "ຫ້າ = 5.",
        order: 0,
        options: [
            { content: "ຫ້າ", isCorrect: true },
            { content: "ສີ່", isCorrect: false },
            { content: "ຫົກ", isCorrect: false },
        ],
    });

    await ensureQuestion({
        quizId: quizBasic2.id,
        content: "Số 10 trong tiếng Lào là gì?",
        explanation: "ສິບ = 10.",
        order: 1,
        options: [
            { content: "ສິບ", isCorrect: true },
            { content: "ເກົ້າ", isCorrect: false },
            { content: "ແປດ", isCorrect: false },
        ],
    });

    const quizListening1 = await ensureQuiz({
        lessonId: listeningLesson1.id,
        title: "Trắc nghiệm nghe hiểu A2",
        description: "Đề mẫu kiểm tra nghe hiểu hội thoại sân bay.",
        passingScore: 70,
        isPublished: true,
    });

    await ensureQuestion({
        quizId: quizListening1.id,
        content: "Hành khách cần xuất trình giấy tờ gì?",
        explanation: "Hộ chiếu (ໜັງສືເດີນທາງ) là giấy tờ cần thiết.",
        order: 0,
        options: [
            { content: "ໜັງສືເດີນທາງ", isCorrect: true },
            { content: "ໃບຂັບຂີ່", isCorrect: false },
            { content: "ບັດນັກສຶກສາ", isCorrect: false },
        ],
    });

    await ensureQuestion({
        quizId: quizListening1.id,
        content: "Chuyến bay bị hoãn được thông báo bằng từ nào?",
        explanation: "ລ່າຊ້າ = bị hoãn/trễ.",
        order: 1,
        options: [
            { content: "ລ່າຊ້າ", isCorrect: true },
            { content: "ຕົງເວລາ", isCorrect: false },
            { content: "ຂຶ້ນຍົນ", isCorrect: false },
        ],
    });

    const quizGrammar1 = await ensureQuiz({
        lessonId: grammarLesson1.id,
        title: "Trắc nghiệm: ຄື và ແມ່ນ",
        description: "Phân biệt cách dùng ຄື và ແມ່ນ.",
        passingScore: 50,
        isPublished: true,
    });

    await ensureQuestion({
        quizId: quizGrammar1.id,
        content: "Câu nào đúng để nói \"Tôi là học sinh\"?",
        explanation: "ຂ້ອຍເປັນນັກຮຽນ là câu đúng.",
        order: 0,
        options: [
            { content: "ຂ້ອຍເປັນນັກຮຽນ", isCorrect: true },
            { content: "ຂ້ອຍຄືນັກຮຽນບໍ່", isCorrect: false },
            { content: "ນັກຮຽນແມ່ນຂ້ອຍບໍ່", isCorrect: false },
        ],
    });

    console.log("✅ Quizzes ready");

    // =========================================================
    // 6. ENROLLMENTS
    // =========================================================

    await ensureEnrollment({
        studentId: student.id,
        courseId: courseBasic.id,
        enrolledAt: daysFromNow(-30),
        expiresAt: daysFromNow(150),
    });

    await ensureEnrollment({
        studentId: student.id,
        courseId: courseListening.id,
        enrolledAt: daysFromNow(-20),
        expiresAt: daysFromNow(90),
    });

    await ensureEnrollment({
        studentId: student2.id,
        courseId: courseBasic.id,
        enrolledAt: daysFromNow(-15),
        expiresAt: daysFromNow(150),
    });

    await ensureEnrollment({
        studentId: student2.id,
        courseId: courseGrammar.id,
        enrolledAt: daysFromNow(-10),
        expiresAt: daysFromNow(365),
    });

    await ensureEnrollment({
        studentId: student3.id,
        courseId: courseBasic.id,
        enrolledAt: daysFromNow(-40),
        expiresAt: daysFromNow(150),
    });

    // Ghi danh đã hết hạn để test bộ lọc khóa học hết hạn
    await ensureEnrollment({
        studentId: student3.id,
        courseId: courseListening.id,
        enrolledAt: daysFromNow(-100),
        expiresAt: daysFromNow(-10),
    });

    console.log("✅ Enrollments ready");

    // =========================================================
    // 7. LESSON PROGRESS
    // =========================================================

    await ensureProgress({
        studentId: student.id,
        lessonId: basicLesson1.id,
        completedAt: daysFromNow(-3),
        lastAccessedAt: daysFromNow(-3),
    });

    await ensureProgress({
        studentId: student.id,
        lessonId: basicLesson2.id,
        lastAccessedAt: daysFromNow(-1),
    });

    await ensureProgress({
        studentId: student.id,
        lessonId: listeningLesson1.id,
        lastAccessedAt: daysFromNow(-2),
    });

    await ensureProgress({
        studentId: student2.id,
        lessonId: basicLesson1.id,
        completedAt: daysFromNow(-12),
        lastAccessedAt: daysFromNow(-12),
    });

    await ensureProgress({
        studentId: student2.id,
        lessonId: basicLesson2.id,
        completedAt: daysFromNow(-8),
        lastAccessedAt: daysFromNow(-8),
    });

    await ensureProgress({
        studentId: student2.id,
        lessonId: basicLesson3.id,
        completedAt: daysFromNow(-5),
        lastAccessedAt: daysFromNow(-5),
    });

    await ensureProgress({
        studentId: student3.id,
        lessonId: basicLesson1.id,
        completedAt: daysFromNow(-20),
        lastAccessedAt: daysFromNow(-20),
    });

    console.log("✅ Lesson progress ready");

    // =========================================================
    // 8. QUIZ ATTEMPTS (đã nộp)
    // =========================================================

    const quizBasic1WithOptions = await prisma.quiz.findUnique({
        where: { id: quizBasic1.id },
        include: {
            questions: {
                orderBy: { order: "asc" },
                include: { options: { orderBy: { order: "asc" } } },
            },
        },
    });

    const correctOptionOf = (question) =>
        question.options.find((option) => option.isCorrect);

    const wrongOptionOf = (question) =>
        question.options.find((option) => !option.isCorrect);

    const questions = quizBasic1WithOptions.questions;

    const attemptStudent1 = await ensureSubmittedAttempt({
        quizId: quizBasic1.id,
        studentId: student.id,
        answers: questions.map((question) => ({
            selectedOptionId: correctOptionOf(question).id,
        })),
    });

    const attemptStudent2 = await ensureSubmittedAttempt({
        quizId: quizBasic1.id,
        studentId: student2.id,
        answers: [
            { selectedOptionId: correctOptionOf(questions[0]).id },
            { selectedOptionId: wrongOptionOf(questions[1]).id },
            { selectedOptionId: correctOptionOf(questions[2]).id },
        ],
    });

    console.log(
        `✅ Quiz attempts ready (HS0001: ${attemptStudent1.score}%, HS0002: ${attemptStudent2.score}%)`
    );

    // =========================================================
    // LOG
    // =========================================================

    const counts = {
        users: await prisma.user.count(),
        courses: await prisma.course.count(),
        lessons: await prisma.lesson.count(),
        documents: await prisma.lessonDocument.count(),
        enrollments: await prisma.enrollment.count(),
        progresses: await prisma.lessonProgress.count(),
        quizzes: await prisma.quiz.count(),
        questions: await prisma.question.count(),
        options: await prisma.questionOption.count(),
        attempts: await prisma.quizAttempt.count(),
        answers: await prisma.quizAnswer.count(),
    };

    console.log("\n📊 Tổng dữ liệu hiện có:");
    console.table(counts);

    console.log("\n🔑 Tài khoản mẫu (mật khẩu: 123456)");
    console.log(`   Admin:    ${admin.email}`);
    console.log(`   Teacher:  ${teacher.email} (${teacher.studentCode})`);
    console.log(`   Teacher2: ${teacher2.email} (${teacher2.studentCode})`);
    console.log(`   Student:  ${student.email} (${student.studentCode})`);
    console.log(`   Student2: ${student2.email} (${student2.studentCode})`);
    console.log(`   Student3: ${student3.email} (${student3.studentCode})`);
    console.log(`   Student4: ${student4.email} (${student4.studentCode})`);
    console.log(
        `   Deleted:  ${formerStudent.email} (${formerStudent.studentCode})`
    );

    console.log("\n🌱 Database seed completed.");
}

main()
    .catch((error) => {
        console.error("\n❌ Seed failed:");
        console.error(error);

        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
