"use client";

import DatePicker from "react-datepicker";
import Image from "next/image";
import back_tats from "@public/back_tats.png";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthStore } from "@/store/useAuthStore";
const HeroSection = () => {
  const { formData, setFormData } = useAuthStore();
  const selectedDate = formData.birthDate ? new Date(formData.birthDate) : null;

  return (
    <div className="w-full max-w-md   flex flex-col ">
      <Image
        src={back_tats}
        alt="Background design"
        height={200}
        width={200}
        className="absolute top-0 right-0 w-full h-full object-cover opacity-70 -z-10 "
      />
      {/* Heading */}
      <div className="text-[40px] font-family-helvetica font-medium leading-10 ">
        Complete Your <br />
        Profile
      </div>

      {/* Display Name */}
      <div className="flex flex-col z-10">
        <div className="flex  mt-[30px] gap-[10px]  ">
          <div className="flex flex-col gap-[6px] ">
            <label className="block text-[14px] text-[#9c9c9c] font-family-neue font-medium  ">
              Display Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              className=" py-[12px] px-[10px] w-[188px] h-[38px] rounded-[10px] mb-[10px] border-[0.5px] text-[14px] border-[#4d4d4d] focus:outline-none font-family-neue font-medium self-stretch"
              placeholder="Mark Twin"
            />
          </div>
          {/* Birth-Date (keeping static placeholder for now) */}
          <div className="flex flex-col gap-[6px]">
            <label className="block text-[14px] text-[#9c9c9c] font-family-neue font-medium">
              Birth Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(birthDate) =>
                setFormData({
                  birthDate: birthDate ? birthDate.toISOString() : "",
                })
              }
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              customInput={
                <input className="px-[10px] w-[188px] h-[38px] rounded-[10px] border-[0.5px] text-[14px] border-[#4d4d4d] focus:outline-none font-family-neue font-medium" />
              }
            />
          </div>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-[6px]">
          <label className="block text-[14px] text-[#9c9c9c] font-family-neue font-medium  ">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ bio: e.target.value })}
            className="w-full bg-opacity-5 mb-[7px] py-[12px] px-[10px] border-[0.5px]border-[#4d4d4d]  text-[14px]   rounded-[10px] focus:outline-none font-family-neue font-medium"
            rows={4}
            placeholder="Emerging concert photographer with a growing love for capturing live music moments..."
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
