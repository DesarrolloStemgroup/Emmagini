import Link from "next/link";
import Image from "next/image";
import { useDataContext } from "@/app/context/GameDataProvider";
//Agregar el link del boton si lo tiene o que vaya a subastas.

function ImageBanner(props) {
	const { empresa } = useDataContext();

	const textColor = empresa?.texto_nav;
	const navBgColor = empresa?.fondo_nav;

	return (
		<div className="relative overflow-hidden mt-16 h-[460px] w-full">
			<div className="absolute inset-0">
				<Image
					src={props.image}
					alt="Banner"
					fill
					style={{ objectFit: "cover" }}
					className="w-full h-full"
				/>
			</div>
			<div
				className={`relative container mx-auto px-4 py-16`}
				style={{ color: textColor }}
			>
				<div className="text-center">
					<h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-8 mb-2 md:mb-4">
						{props.welcomText}
					</h3>
					<h1 className="font-semibold text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-10 mb-2 md:mb-4">
						{props.title}
					</h1>
					<h3 className="font-normal text-lg sm:text-xl md:text-2xl lg:text-3xl leading-8 mt-2 md:mt-4 mb-4">
						{props.subtitle}
					</h3>
					<Link href={props.link} target="_blank" rel="noopener noreferrer">
						<button
							className={`w-full sm:w-[323px] h-12 bg-blueEmmagini mt-4 rounded-[50px] border-4 border-gray-500 hover:bg-sky-700`}
							style={{ backgroundColor: navBgColor }}
						>
							{props.buttonText}
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
}

export default ImageBanner;
