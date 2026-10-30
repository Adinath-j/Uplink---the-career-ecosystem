
import Image from "next/image";

interface PhoneMockupProps {
  screenSrc: string;
  alt: string;
  priority?: boolean;
}

export function PhoneMockup({
  screenSrc,
  alt,
  priority = false,
}: PhoneMockupProps) {
  return (
    <div className="relative aspect-[9/19.5] w-full rounded-[2.8rem] border-[7px] border-[#111827] bg-[#111827] p-[5px] shadow-[0_25px_60px_-20px_rgba(15,23,42,0.55)] ring-1 ring-white/40">

      {/* Inner screen */}
      <div className="relative h-full w-full overflow-hidden rounded-[2.25rem] bg-white">

        <Image
          src={screenSrc}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 205px, (max-width: 1024px) 245px, 265px"
          className="object-cover object-top"
        />

        {/* Dynamic island / camera cutout */}
        <div className="absolute left-1/2 top-2 z-10 h-[19px] w-[76px] -translate-x-1/2 rounded-full bg-black shadow-inner" />

      </div>
    </div>
  );
}
