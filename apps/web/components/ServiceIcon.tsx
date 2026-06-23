import Image from "next/image";

export default function ServiceIcon({
  service,
  size = 24,
}: {
  service: string;
  size?: number;
}) {
  return (
    <Image
      src={`/aws-icons/${service}.svg`}
      width={size}
      height={size}
      alt=""
      unoptimized
    />
  );
}
