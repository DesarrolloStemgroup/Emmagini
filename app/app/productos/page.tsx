"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useDataContext } from "@/app/context/GameDataProvider";
import { useAuthContext } from "@/app/context/AuthProvider";
import CardGames from "@/app/components/cards/CardGames";
import ButtonNav from "@/app/components/home/ButtonNav";
import { IoMdArrowRoundBack } from "react-icons/io";
import { AiOutlineTrophy } from "react-icons/ai";
import { BsGift, BsCoin, BsCashCoin } from "react-icons/bs";

function Page() {
	const { textos, empresa } = useDataContext();
	const { userId, token, lang } = useAuthContext();
	const router = useRouter();
	const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;
	const [productos, setProductos] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	function fixImageUrl(url: string | undefined) {
		if (!url) return "";
		if (url.startsWith("//")) return `https:${url}`;
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

	const getProducts = useCallback(async () => {
		try {
			const response = await axios.post(
				"https://backend.emmagini.com/api2/get_productos",
				{
					token: token,
					userid: userId,
					host: HOST_URL,
					id_club: null,
					lang: lang,
				},
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error al obtener los productos", error);
			throw error;
		}
	}, [token, userId, lang]);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const apiResponse = await getProducts();
			setProductos(apiResponse);
			setLoading(false);
		} catch (error) {
			console.error("Error al obtener los datos:", error);
			setLoading(false);
		}
	}, [getProducts]);

	useEffect(() => {
		if (token && userId) {
			fetchData();
		}
	}, [token, userId, fetchData]);

	const getAltText = (producto: any) => {
		if (producto.tipo_pago === "1") {
			return (
				<div className="flex items-center first-letter:uppercase">
					<span className="first-letter:uppercase">
						{" "}
						{textos?.producto_precio}:
					</span>
					<BsCoin size={20} className="text-orange-300 ml-4" />
					<span className="ml-2">{producto.monto_coins}</span>
				</div>
			);
		} else if (producto.tipo_pago === "2") {
			return (
				<div className="flex items-center first-letter:uppercase">
					<span className="first-letter:uppercase">
						{" "}
						{textos?.producto_precio}:
					</span>
					<BsCashCoin size={20} className="text-green-400 ml-4" />
					<span className="ml-2">{producto.monto_real}</span>
				</div>
			);
		} else if (producto.tipo_pago === 3) {
			return (
				<div className="flex items-center space-x-4">
					<span className="flex items-center first-letter:uppercase">
						<span className="first-letter:uppercase">
							{" "}
							{textos?.producto_precio}:
						</span>
						<BsCoin size={20} className="text-orange-300 ml-4" />
						<span className="ml-2">{producto.monto_coins}</span>
					</span>
					<span className="flex items-center first-letter:uppercase">
						|
						<BsCashCoin size={20} className="text-green-400 ml-4" />
						<span className="ml-2">{producto.monto_real}</span>
					</span>
				</div>
			);
		}
		return (
			<div className="first-letter:uppercase">
				<span className="first-letter:uppercase">
					{" "}
					{textos?.producto_precio}: N/A
				</span>
			</div>
		);
	};

	if (!productos && loading) {
		return (
			<div className="mt-20 text-black">
				<div className="mt-96">
					<section className="dots-container">
						<div className="dot"></div>
						<div className="dot"></div>
						<div className="dot"></div>
						<div className="dot"></div>
						<div className="dot"></div>
					</section>
					<h1 className="text-blueEmmagini text-center mt-4 font-bold text-xl">
						CARGANDO
					</h1>
				</div>
			</div>
		);
	}

	return (
		<div className="pb-10 overflow-x-hidden">
			<div>
				<h1 className="mt-20 text-white text-center font-bold text-2xl first-letter:uppercase">
					{textos?.txt_productos_titulo}
				</h1>
			</div>
			{/* Sección de "Mis Productos" */}
			{productos &&
				productos.mias &&
				productos.mias.filter((producto: any) => producto.es_tienda === "1")
					.length > 0 && (
					<div className="w-full max-w-screen-xl mx-auto mt-20 px-4 lg:px-8">
						<h2 className="text-white text-lg md:text-xl font-semibold first-letter:uppercase">
							{textos?.lbl_productos_misproductos}
						</h2>
						<div className="container mx-auto py-8 mb-20 mt-8">
							<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
								{productos.mias
									.filter((producto: any) => producto.es_tienda === "1")
									.map((producto: any) => (
										<div
											key={producto.id}
											className="flex justify-center w-[400px]"
										>
											<CardGames
												cardClassName="drop-shadow-lg w-full bg-white p-4"
												backgroundColor={producto.color_portada}
												imageContainer="flex-none w-[160px] h-[160px] overflow-hidden rounded-md"
												imageClassName="object-cover w-full h-full"
												image={fixImageUrl(producto.imagen)}
												altText={getAltText(producto)}
												title={producto.nombre}
												description={producto.descripcion}
												descriptionClassName="break-words whitespace-normal"
												buttonRouter={true}
												buttonRouterClassName="bg-blueEmmagini text-white w-full max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] h-[36px]"
												buttonText={textos?.producto_comprar}
												onClick={() => handleCardClick(producto.id)}
											/>
										</div>
									))}
							</div>
						</div>
					</div>
				)}
			{/* Sección de "Otros Productos" */}
			{productos &&
				productos.otras &&
				productos.otras.filter((producto: any) => producto.es_tienda === "1")
					.length > 0 && (
					<div className="w-full max-w-screen-xl mx-auto mt-20 px-4 lg:px-8">
						<h2 className="text-white text-lg md:text-xl font-semibold first-letter:uppercase">
							{textos?.lbl_productos_otrosproductos}
						</h2>
						<div className="container mx-auto py-8 mb-32 mt-8">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
								{productos.otras
									.filter((producto: any) => producto.es_tienda === "1")
									.map((producto: any) => (
										<div
											key={producto.id}
											className="flex justify-center w-[400px]"
										>
											<CardGames
												cardClassName="drop-shadow-lg w-full bg-white p-4"
												backgroundColor={producto.color_portada}
												imageContainer="flex-none w-[160px] h-[160px] overflow-hidden rounded-md"
												imageClassName="object-cover w-full h-full"
												image={fixImageUrl(producto.imagen)}
												altText={getAltText(producto)}
												title={producto.nombre}
												description={producto.descripcion}
												descriptionClassName="break-words whitespace-normal"
												buttonRouter={true}
												buttonRouterClassName="bg-blueEmmagini text-white w-full max-w-[150px] sm:max-w-[200px] lg:max-w-[250px] h-[36px]"
												buttonText={textos?.producto_comprar}
												onClick={() => handleCardClick(producto.id)}
											/>
										</div>
									))}
							</div>
						</div>
					</div>
				)}
			<ButtonNav
				link1="/app/productos"
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
