import { useProfileStore } from "@/store/useProfileStore";
import Image from "next/image";
import React from "react";
import instagram from "@public/Instagram.svg";
import linkedin from "@public/linkedin.svg";
import x from "@public/x.svg";
import email from "@public/google.svg";
function SocialLinks() {
  const store = useProfileStore();

  if (!store.userProfile) return <div>Cant find the profile</div>;
  return (
    <div className="absolute right-0 top-0 flex flex-col gap-[4px]">
      <div className="text-[18px] font-family-helvetica font-medium font-white">
        Socials
      </div>
      <div className="flex gap-[8px]">
        {store.userProfile.twitter && (
          <a
            href={store.userProfile.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="social-box twitter-box"
          >
            <Image
              src={x}
              alt="X (Twitter)"
              width={18}
              height={18}
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
              src={email}
              alt="Email"
              width={18}
              height={18}
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
              src={linkedin}
              alt="LinkedIn"
              width={18}
              height={18}
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
              src={instagram}
              alt="Instagram"
              width={24}
              height={24}
              className="social-icon instagram-glow"
            />
          </a>
        )}
      </div>
    </div>
  );
}

export default SocialLinks;
