"use client";
import React, { useEffect, useState } from "react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useErrorStore } from "@/store/useErrorStore";
import Image from "next/image";
import loginImage from "../../public/login_image.png";
import loginImage2 from "../../public/login_image.jpg";
import Arrow from "../../public/Arrow.svg";
import SolanaVector from "../../public/Solana vector.svg";
import star from "../../public/Star 1.svg";
const LoginPage = () => {
  const router = useRouter();
  const { publicKey, connected, signMessage } = useWallet();

  const { loginWithWallet, checkAuthAndFetchSlug, loading, setLoading } =
    useAuthStore();
  const { globalError, setGlobalError, clearGlobalError } = useErrorStore();

  const [isMounted, setIsMounted] = useState(false);
  const [attemptedLogin, setAttemptedLogin] = useState(false);
  const upper: string[] = [
    "Tell Stories",
    "Curate With Purpose",
    "Want control",
  ];
  const lower: string[] = ["Value Aesthetics", "Focus On The Timeless"];
  useEffect(() => {
    setIsMounted(true);
    clearGlobalError();
  }, []);

  useEffect(() => {
    const runAuthFlow = async () => {
      if (!connected || !publicKey || loading || attemptedLogin || !signMessage)
        return;

      setAttemptedLogin(true);
      setLoading(true);

      try {
        const { authenticated, hasProfile, slug } =
          await checkAuthAndFetchSlug();

        if (authenticated) {
          router.push(hasProfile ? `/u/${slug}` : "/u/createprofile");
        } else {
          const result = await loginWithWallet(
            publicKey.toBase58(),
            signMessage
          );
          if (result?.authenticated) {
            const { hasProfile, slug } = await checkAuthAndFetchSlug();
            router.push(hasProfile ? `/u/${slug}` : "/u/createprofile");
          }
        }
      } catch (err: any) {
        console.error("Auth error:", err);
        setGlobalError(
          err?.response?.data?.error || "Something went wrong during login."
        );
      } finally {
        setLoading(false);
        setAttemptedLogin(false);
      }
    };

    runAuthFlow();
  }, [connected, publicKey]);

  if (!isMounted)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="overflow-hidden flex items-center justify-center h-screen">
      <div className="w-[974px] h-[610px] flex  bg-[#151515] rounded-5xl ">
        {/* left */}
        <div className="div relative  w-[490px] h-full rounded-5xl overflow-clip">
          <Image
            src={loginImage2}
            alt="login image"
            width={490}
            height={610}
            className="w-full h-full rotate-[-78deg] scale-150 translate-y-[-20px] translate-x-[-130px] "
          />
          <div className="absolute   w-[490px] h-[198px] bottom-0 z-30 rounded-[20px] noise-overlay "></div>

          <div className="absolute bottom-0 w-[490px] h-[198px]  rounded-[20px] border-t [border-top-style:solid] bg-[#ffffff03] overflow-hidden border-[#ffffffcc] backdrop-blur-xl">
            <div className="flex flex-col w-[193px] items-start gap-2 absolute top-[92px] left-10">
              <div className="relative  mt-[-1.00px] font-family-helvetica font-normal leading text-white text-[28px] -tracking-normal leading-7 ">
                Welcome to
                <br />
                ShuttrSpace
              </div>

              <div className="relative  self-stretch font-family-neue  font-normal text-white text-[10px] tracking-[0] leading-[normal]">
                By photographers, for photographers
              </div>
            </div>

            <div className="absolute w-[85px] h-[85px] top-[80px] left-[366px]  rounded-[100px] border border-dashed bg-[#ffffff03] overflow-hidden border-[#ffffffcc]">
              <Image
                className="absolute w-[19px] h-[19px] top-8 left-[33px] hover:rotate-45  transition ease-in-out cursor-pointer"
                alt="Line"
                src={Arrow}
              />
            </div>
          </div>
        </div>

        {/* right*/}

        <div className=" w-[490px]  relative  rounded-5xl ">
          <div className=" relative    flex flex-col  gap-6 w-[389px] h-[393px]  top-[60px] left-[50px] ">
            {/* Hero */}
            <div className="text-[40px]  font-family-helvetica font-medium leading-10">
              Your Portfolio, <br />
              Secured Forever
            </div>
            <div className="w-[308px]  font-family-neue font-medium leading-[14px] text-sm">
              Publish, protect, and showcase — without middlemen or loss of
              control.
            </div>

            {/* Points */}
            <div className=" flex flex-col gap-1.5 absolute bottom-0 w-full">
              <div className=" text-[16px] font-family-neue font-medium leading-[normal] self-stretch mt-[-1px]">
                Built for creators who
              </div>

              <div className="flex flex-col gap-1   ">
                <div className="flex gap-[2px]">
                  {upper.map((content, i) => (
                    <div key={i} className="creator-border">
                      <span className="font-family-neue font-medium text-[#4e4e4e] text-[12px] whitespace-nowrap">
                        {content}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-[2px]">
                  {lower.map((content, i) => (
                    <div key={i} className="creator-border">
                      <span className="font-family-neue font-medium text-[#4e4e4e] text-[12px] whitespace-nowrap">
                        {content}
                      </span>
                    </div>
                  ))}
                  <span className="special-creator-border">
                    <span className="font-family-neue font-medium text-black text-[11px] whitespace-nowrap">
                      Treat Their Work Like Art
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <span className="w-full absolute  rounded-5xl h-[50px] bottom-0">
            <div className="flex gap-0   relative left-[55px]">
              <div className="w-[37px] h-[37px] border border-[#4e4e4e] rounded-full flex justify-center items-center">
                <Image
                  src={SolanaVector}
                  alt="solana vector"
                  width={15}
                  height={15}
                />
              </div>
              <div className="w-[37px] h-[37px] bg-white rounded-full translate-x-[-14px] flex justify-center items-center  ">
                <Image src={star} alt="solana vector" width={15} height={15} />
              </div>
              <div className="flex flex-col text-[12px] font-family-neue font-medium gap-0 translate-x-[-8px] pt-[0.8px]">
                <div className="text-[#4e4e4e]">
                  Built on <span className="text-white">Solana</span>
                </div>
                <div className="text-[#4e4e4e] translate-y-[-4px] ">
                  For <span className="text-white"> Creators</span>
                </div>
              </div>
            </div>

            <div
              className="h-[50px] absolute cursor-pointer w-[208px] flex items-center justify-center bottom-0 right-0   rounded-br-[40px] rounded-tl-[10px]
            font-family-neue font-medium text-sm bg-black border border-[#4d4d4d] shadow-[inset_4px_6px_4px_2px_rgba(255,255,255,0.1)] overflow-hidden
      hover:bg-white hover:text-black hover:border-white hover:shadow-[inset_2px_2px_4.3px_2px_rgba(0,0,0,0.5)]  transition ease-in-out "
            >
              Connect Wallet
            </div>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
// <div className="min-h-screen flex flex-col items-center justify-center p-4">
//   <h1 className="text-2xl mb-4 font-family-helvetica font-normal">
//     Solana Wallet Login
//   </h1>

//   {globalError && (
//     <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
//       {globalError}
//     </div>
//   )}

//   {!connected ? (
//     <div className="text-center">
//       <p className="mb-4">Connect Wallet</p>
//       <WalletMultiButton />
//     </div>
//   ) : (
//     <div className="text-center flex flex-col gap-3 items-center">
//       <p className="text-green-600">Wallet connected!</p>
//       <p className="text-sm text-gray-600">
//         {publicKey?.toBase58().slice(0, 8)}...
//       </p>
//       <WalletDisconnectButton />
//     </div>
//   )}
// </div>

// import line3 from "./line-3.svg";
