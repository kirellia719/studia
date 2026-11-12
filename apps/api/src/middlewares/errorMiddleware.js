const errorMiddleware = (err, req, res, next) => {
    const isMalformedId =
        err?.code === "P2023" ||
        /Malformed ObjectID|Inconsistent column data/i.test(
            err?.message || ""
        );

    if (isMalformedId) {
        return res.status(400).json({
            success: false,
            message: "ID không hợp lệ.",
        });
    }

    if (err?.code === "P2025") {
        return res.status(404).json({
            success: false,
            message: "Không tìm thấy dữ liệu.",
        });
    }

    const statusCode = err.statusCode || 500;

    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message:
            statusCode >= 500
                ? "Đã xảy ra lỗi máy chủ"
                : err.message,
    });
};

export default errorMiddleware;
