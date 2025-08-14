import Image from "next/image";
const SolanaCredits = () => (
  <div className="flex gap-0 relative left-[55px]">
    <div className="w-[37px] h-[37px] border border-[#4e4e4e] rounded-full flex justify-center items-center">
      <Image
        src="Solana vector.svg"
        alt="solana vector"
        width={15}
        height={15}
      />
    </div>
    <div className="w-[37px] h-[37px] bg-white rounded-full translate-x-[-14px] flex justify-center items-center">
      <Image src="Star 1.svg" alt="star" width={15} height={15} />
    </div>
    <div className="flex flex-col text-[12px] font-family-neue font-medium gap-0 translate-x-[-8px] pt-[0.8px]">
      <div className="text-[#4e4e4e]">
        Built on <span className="text-white">Solana</span>
      </div>
      <div className="text-[#4e4e4e] translate-y-[-4px]">
        For <span className="text-white">Creators</span>
      </div>
    </div>
  </div>
);
export default SolanaCredits;
