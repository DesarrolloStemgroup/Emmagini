import Image from "next/image";

interface ComponentProps {
	text: string;
	onClick?: () => void;
	imageCard: string;
	imageClassName?: string;
	text2?: string;
}

function CardHome({
	text,
	imageCard,
	imageClassName,
	onClick,
	text2,
}: ComponentProps) {
	return (
		<div
			className="bg-white rounded-md shadow-md p-4 w-[260px] h-[263.01px] h-auto  flex flex-col items-center cursor-pointer  drop-shadow-lg max-h-[640px]"
			onClick={onClick}
		>
			<div className="relative h-40 w-full">
				<Image
					src={imageCard}
					alt="Card"
					fill
					style={{ objectFit: "cover" }}
					className={"w-full h-full".concat(" ", imageClassName || "")}
					sizes="80"
				/>
			</div>
			<span className="text-black font-bold text-base leading-5 text-center mt-8 align-middle">
				{text}
			</span>
			<span className="text-black font-bold text-base leading-5 text-center mt-8 align-middle">
				{text2}
			</span>
		</div>
	);
}

export default CardHome;
