// import loginImage2 from "@public/login_image.jpg";
// import Arrow from "@public/Arrow.svg";
import Image from "next/image";
const LeftPanel = () => (
  <div className="relative w-[490px] h-full rounded-5xl overflow-clip">
    <Image
      src="/login_image.jpg"
      alt="login image"
      width={490}
      height={610}
      className="w-full h-full rotate-[-78deg] scale-150 translate-y-[-20px] translate-x-[-130px]"
    />
    <div className="absolute w-[490px] h-[198px] bottom-0 z-30 rounded-[20px] noise-overlay" />

    <div className="absolute bottom-0 w-[490px] h-[198px] rounded-[20px] border-t [border-top-style:solid] bg-[#ffffff03] overflow-hidden border-[#ffffffcc] backdrop-blur-xl">
      <div className="flex flex-col w-[193px] items-start gap-2 absolute top-[92px] left-10">
        <div className="relative mt-[-1.00px] font-family-helvetica font-normal text-white text-[28px] -tracking-normal leading-7">
          Welcome to
          <br />
          ShuttrSpace
        </div>
        <div className="relative self-stretch font-family-neue font-normal text-white text-[10px] tracking-[0] leading-[normal]">
          By photographers, for photographers
        </div>
      </div>

      <div className="absolute w-[85px] h-[85px] top-[80px] left-[366px] rounded-[100px] border border-dashed bg-[#ffffff03] overflow-hidden border-[#ffffffcc]">
        <Image
          className="absolute w-[19px] h-[19px] top-8 left-[33px] hover:rotate-45 transition ease-in-out cursor-pointer"
          alt="Arrow"
          src="/Arrow.svg"
        />
      </div>
    </div>
  </div>
);
export default LeftPanel;
