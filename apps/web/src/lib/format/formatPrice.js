// Giá khóa học được lưu theo đơn vị nghìn đồng:
// 0   = miễn phí
// 299 = 299.000 VNĐ
// 1200 = 1.200.000 VNĐ

const formatPrice = (price) => {
    const value = Number(price);

    if (!value || value <= 0) {
        return "Miễn phí";
    }

    if (value < 1000) {
        return `${value.toLocaleString("vi-VN")}k`;
    }

    return `${(value / 1000).toLocaleString("vi-VN", {
        maximumFractionDigits: 1,
    })}tr`;
};

export default formatPrice;
