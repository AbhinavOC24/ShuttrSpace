import { useProfileStore } from "@/store/useProfileStore";
import Image from "next/image";
import React from "react";

function SocialLinks() {
  const store = useProfileStore();

  if (!store.userProfile) return <div>Cant find the profile</div>;
  return (
    <div className=" flex flex-col gap-1">
      {/* <div className="text-[18px] font-family-helvetica font-medium font-white">
        Socials
      </div> */}
      <div className="flex  justify-center sm:justify-start gap-2 ">
        {store.userProfile.twitter && (
          <a
            href={store.userProfile.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="social-box twitter-box"
          >
            <Image
              src="/x.svg"
              alt="X (Twitter)"
              width={25}
              height={25}
              className="social-icon twitter-glow"
            />
          </a>
        )}

        {store.userProfile.email && (
          <a
            href={`mailto:${store.userProfile.email}`}
            className="social-box email-box"
          >
            <Image
              src="/google.svg"
              alt="Email"
              width={25}
              height={25}
              className="social-icon email-glow"
            />
          </a>
        )}

        {store.userProfile.linkedin && (
          <a
            href={store.userProfile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="social-box linkedin-box"
          >
            <Image
              src="/linkedin.svg"
              alt="LinkedIn"
              width={25}
              height={25}
              className="social-icon linkedin-glow"
            />
          </a>
        )}

        {store.userProfile.instagram && (
          <a
            href={store.userProfile.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="social-box instagram-box"
          >
            <Image
              src="/Instagram.svg"
              alt="Instagram"
              width={35}
              height={35}
              className="social-icon instagram-glow"
            />
          </a>
        )}
      </div>
    </div>
  );
}

export default SocialLinks;
