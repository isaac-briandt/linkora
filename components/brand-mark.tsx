import Image from "next/image";

export default function BrandMark({ size = "sm" }: { size?: "sm" | "md" }) {
  const dimensions = size === "md" ? "h-10 w-10" : "h-8 w-8";
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-lg ${dimensions}`}
    >
      <Image
        src="/brand/connectora-icon.png"
        alt=""
        fill
        sizes={size === "md" ? "40px" : "32px"}
        className="scale-[1.55] object-contain"
      />
    </span>
  );
}
