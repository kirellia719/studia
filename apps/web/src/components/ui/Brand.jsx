import BrandImage from "@/assets/achan-amber.png";

const Brand = ({
  width = 220,
  className = "",
}) => {
  return (
    <img src={BrandImage} alt="Achan - Học tiếng Lào" className={className} width={width} />
  );
};

export default Brand;
