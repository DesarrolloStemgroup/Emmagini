import Link from "next/link";
import { useDataContext } from "@/app/context/GameDataProvider";
import "@/app/components/styles/loader.css";

// faltan textos propios para compra, y textos de subastas y premium

interface ComponentProps {
	link1: string;
	link2: string;
	link3: string;
	icon1: React.ReactElement;
	icon2: React.ReactElement;
	icon3: React.ReactElement;
	texto1: string;
	texto2: string;
	texto3: string;
}

function ButtonNav({
	link1,
	link2,
	link3,
	icon1,
	icon2,
	icon3,
	texto1,
	texto2,
	texto3,
}: ComponentProps) {
	const { empresa } = useDataContext();
	const navBgColor = empresa?.fondo_nav;

	return (
		<div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 sm:px-0">
			<div
				className="flex justify-between px-5 sm:px-7 py-2 mt-4 rounded-full border-4 border-gray-100 shadow-xl"
				style={{ backgroundColor: navBgColor }}
			>
				<Link href={link1} className="flex-1 flex items-center justify-center">
					<button className="flex flex-col items-center justify-center w-full h-full rounded-xl p-1">
						<div className="flex flex-col items-center">
							{icon1}
							<span className="mt-1 text-sm sm:text-md text-white">
								{texto1}
							</span>
						</div>
					</button>
				</Link>

				<Link href={link2} className="flex-1 flex items-center justify-center">
					<button className="flex flex-col items-center justify-center w-full h-full rounded-xl p-1">
						<div className="flex flex-col items-center">
							{icon2}
							<span className="mt-1 text-sm sm:text-md text-white">
								{texto2}
							</span>
						</div>
					</button>
				</Link>

				<Link href={link3} className="flex-1 flex items-center justify-center">
					<button className="flex flex-col items-center justify-center w-full h-full rounded-xl p-1">
						<div className="flex flex-col items-center">
							{icon3}
							<span className="mt-1 text-sm sm:text-md text-center text-white">
								{texto3}
							</span>
						</div>
					</button>
				</Link>
			</div>
		</div>
	);
}

export default ButtonNav;
