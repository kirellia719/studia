import {
    Routes, Route
} from "react-router-dom";

import LessonCreatePage from "@/features/lessons/pages/LessonCreatePage.jsx";
import LessonDetailPage from "@/features/lessons/pages/LessonDetailPage.jsx";

const LessonLayout = () => {

    return (
        <Routes>
            <Route path="create" element={<LessonCreatePage />} />
            <Route path=":lessonId" element={<LessonDetailPage />} />
        </Routes>
    );
};

export default LessonLayout;