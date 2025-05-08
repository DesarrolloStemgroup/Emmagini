import Link from "next/link";
import { useDataContext } from "@/app/context/GameDataProvider";
import React from "react";

// Define type for each navigation item
interface NavItem {
	link?: string;
	icon?: React.ReactElement;
	texto?: string;
}

interface ComponentProps {
	items: (NavItem | undefined)[];
}

const ButtonNav: React.FC<ComponentProps> = ({ items }) => {
	const { empresa } = useDataContext();
	const navBgColor = empresa?.fondo_nav;

	const renderItems = items.filter(
		(item): item is NavItem => !!item?.link && !!item.icon && !!item.texto
	);

	return (
		<div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 sm:px-0">
			<div
				className="flex justify-between px-5 sm:px-7 py-2 mt-4 rounded-full border-4 border-gray-100 shadow-xl"
				style={{ backgroundColor: navBgColor }}
			>
				{renderItems.map((item, idx) => (
					<Link
						key={idx}
						href={item.link!}
						className="flex-1 flex items-center justify-center"
					>
						<button className="flex flex-col items-center justify-center w-full h-full rounded-xl p-1">
							{item.icon}
							<span className="mt-1 text-sm sm:text-md text-white">
								{item.texto}
							</span>
						</button>
					</Link>
				))}
			</div>
		</div>
	);
};

export default ButtonNav;
