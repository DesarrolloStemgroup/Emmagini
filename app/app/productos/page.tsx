"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDataContext } from "@/app/context/GameDataProvider";
import CardGames from "@/app/components/cards/CardGames";
import ButtonNav from "@/app/components/home/ButtonNav";
import { IoMdArrowRoundBack } from "react-icons/io";
import { AiOutlineTrophy } from "react-icons/ai";
import { BsGift } from "react-icons/bs";

function Page() {
	const { data, textos, empresa } = useDataContext();
	const router = useRouter();

	function fixImageUrl(url: string | undefined) {
		if (!url) {
			return "";
		}

		if (url.startsWith("//")) {
			return `https:${url}`;
		}

		return url;
	}
	useEffect(() => {
		const backgroundImage = empresa?.fondo
			? `https://backend.emmagini.com/uploads/${empresa.fondo}`
			: null;

		if (backgroundImage) {
			document.body.style.backgroundImage = `url(${backgroundImage})`;
			document.body.style.backgroundSize = "cover";
			document.body.style.backgroundPosition = "center";
			document.body.style.backgroundRepeat = "no-repeat";
		} else {
			document.body.style.backgroundImage = "";
			document.body.style.backgroundColor = "white";
		}

		return () => {
			document.body.style.backgroundImage = "";
			document.body.style.backgroundColor = "white";
		};
	}, [empresa]);

	const handleCardClick = (idProducto: string) => {
		router.push(`/app/productos/${idProducto}`);
	};

	return (
		<div className="pb-10 overflow-x-hidden">
			<div>
				<h1 className="mt-20 text-white text-center font-bold text-2xl">
					Productos
				</h1>
			</div>
			{data && data.productos.mias && data.productos.mias.length > 0 && (
				<div className="w-full max-w-screen-xl mx-auto mt-20 px-4 lg:px-8">
					<h2 className="text-white text-lg md:text-xl font-semibold">
						{textos?.lbl_productos_misproductos}
					</h2>
					<div className="container mx-auto py-8 mb-20 mt-8">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
							{data.productos.mias.map((producto: any) => (
								<div key={producto.id} className="flex justify-center w-full">
									<CardGames
										cardClassName="drop-shadow-lg w-full"
										backgroundColor={producto.color_portada}
										imageContainer="flex justify-center items-center"
										imageClassName="w-full max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-[250px] h-auto"
										image={fixImageUrl(producto.imagen)}
										altText={`Precio: ${producto.monto_coins}`}
										title={producto.nombre}
										description={`${producto.descripcion}`}
										buttonRouter={true}
										buttonRouterClassName="bg-blueEmmagini text-white w-full max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] h-[36px]"
										buttonText="Comprar"
										onClick={() => handleCardClick(producto.id)}
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{data && data.productos.otras && data.productos.otras.length > 0 && (
				<div className="w-full max-w-screen-xl mx-auto mt-14 px-4 lg:px-8">
					<h2 className="text-white text-sm md:text-base font-semibold">
						{textos?.lbl_productos_otrosproductos}
					</h2>
					<div className="container mx-auto py-8 mb-32 mt-8">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
							{data.productos.otras.map((producto: any) => (
								<div key={producto.id} className="flex justify-center w-full">
									<CardGames
										cardClassName="drop-shadow-lg w-full"
										backgroundColor={producto.color_portada}
										imageContainer="flex justify-center items-center"
										imageClassName="w-full max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-[250px] h-auto"
										image={fixImageUrl(producto.imagen)}
										altText={`Precio: ${producto.monto_coins}`}
										title={producto.nombre}
										description={`${producto.descripcion}`}
										buttonRouter={true}
										buttonRouterClassName="bg-blueEmmagini text-white w-full max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] h-[36px]"
										buttonText="Comprar"
										onClick={() => handleCardClick(producto.id)}
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
			<ButtonNav
				link1="/app/"
				link2="/app/subastas"
				link3="/app/premium"
				icon1={<IoMdArrowRoundBack size={18} className="text-white" />}
				icon2={<BsGift size={18} className="text-white" />}
				icon3={<AiOutlineTrophy size={18} className="text-white" />}
				texto1={"Volver"}
				texto2={"Subastas"}
				texto3={"Premium"}
			/>
		</div>
	);
}

export default Page;
