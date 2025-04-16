import { useDataContext } from "@/app/context/GameDataProvider";
import "@/app/components/styles/loader.css";

// faltan textos propios

interface ComponentProps {
	icon1: React.ReactElement;
	icon2: React.ReactElement;
	icon3: React.ReactElement;
	texto1: string;
	texto2: string;
	texto3: string;
	onClick1?: () => void;
	onClick2?: () => void;
	onClick3?: () => void;
}

function DinamicButtonNav({
	icon1,
	icon2,
	icon3,
	texto1,
	texto2,
	texto3,
	onClick1,
	onClick2,
	onClick3,
}: ComponentProps) {
	const { empresa } = useDataContext();
	const textColor = empresa?.texto_nav;
	const navBgColor = empresa?.fondo_nav;
	return (
		<div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 sm:px-0">
			<div
				className="flex justify-between px-5 sm:px-7 py-2 mt-4 rounded-full border-4 border-gray-100 shadow-xl"
				style={{ backgroundColor: navBgColor }}
			>
				<button
					className="flex-1 flex flex-col items-center justify-center"
					onClick={onClick1}
				>
					<div className="flex flex-col items-center">
						{icon1}
						<span className="mt-1 text-sm sm:text-md text-white">{texto1}</span>
					</div>
				</button>

				<button
					className="flex-1 flex flex-col items-center justify-center"
					onClick={onClick2}
				>
					<div className="flex flex-col items-center">
						{icon2}
						<span className="mt-1 text-sm sm:text-md text-white">{texto2}</span>
					</div>
				</button>

				<button
					className="flex-1 flex flex-col items-center justify-center"
					onClick={onClick3}
				>
					<div className="flex flex-col items-center">
						{icon3}
						<span className="mt-1 text-sm sm:text-md text-white">{texto3}</span>
					</div>
				</button>
			</div>
		</div>
	);
}

export default DinamicButtonNav;
