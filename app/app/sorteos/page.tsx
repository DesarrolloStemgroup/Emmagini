"use client";

import { useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDataContext } from "@/app/context/GameDataProvider";
import { useAuthContext } from "@/app/context/AuthProvider";
import CardGames from "@/app/components/cards/CardGames";
import ButtonNav from "@/app/components/home/ButtonNav";
import { IoMdArrowRoundBack } from "react-icons/io";
import { HiShoppingBag } from "react-icons/hi";
import { AiOutlineTrophy } from "react-icons/ai";
import "@/app/components/styles/loader.css";

const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

const fetchSorteos = async (token: any, userId: any, lang: string) => {
	const response = await axios.post(
		"https://backend.emmagini.com/api2/get_sorteos",
		{
			token,
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
};

function Page() {
	const { empresa, textos } = useDataContext();
	const { token, userId, lang } = useAuthContext();
	const router = useRouter();

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

	const {
		data: rafflesData,
		error,
		isLoading,
	} = useQuery(["rafflesData", token, userId], () =>
		fetchSorteos(token, userId, lang)
	);

	function fixImageUrl(url: string) {
		if (!url) {
			return "";
		}

		if (url.startsWith("//")) {
			return `https:${url}`;
		}

		return url;
	}

	const handleCardProximoSorteoClick = (idSorteo: string) => {
		router.push(`/app/sorteos/proximos/${idSorteo}`);
	};

	const handleCardSorteoAnteriorClick = (idSorteo: string) => {
		router.push(`/app/sorteos/anteriores/${idSorteo}`);
	};
	if (isLoading) {
		return (
			<div className="mt-20 text-blueEmmagini">
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

	if (error) return <div>Error al cargar los datos de sorteos</div>;

	return (
		<div className="pb-[80px] overflow-x-hidden">
			<div className="mx-auto max-w-screen-lg px-4">
				<h1 className="mt-20 text-white text-left font-bold text-xl sm:text-2xl md:text-3xl text-center">
					Sorteos
				</h1>

				{rafflesData &&
					rafflesData.proximos &&
					rafflesData.proximos.length > 0 && (
						<div className="mt-10 lg:mt-20">
							<h2 className="text-white text-sm md:text-base font-semibold">
								Proximos
							</h2>
							<div className="px-2 py-8 lg:px-4 lg:py-6">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
									{rafflesData.proximos.map((sorteo: any) => (
										<div key={sorteo.id} className="flex justify-start w-full">
											<CardGames
												cardClassName="drop-shadow-lg w-full max-w-[450px] md:max-w-[500px]"
												backgroundColor={sorteo.color_portada}
												imageContainer="flex justify-start items-center"
												imageClassName="w-[80px] h-[130px] sm:w-[150px] sm:h-[155px] md:w-[180px] md:h-[180px] lg:w-[191px] lg:h-[191px]"
												image={fixImageUrl(sorteo.imagen)}
												altText={`Sortea: ${sorteo.fin}`}
												title={sorteo.nombre}
												description={sorteo.descripcion}
												buttonRouter={true}
												buttonRouterClassName="bg-blueEmmagini text-white text-xs sm:text-sm lg:text-base w-full max-w-[200px] h-[36px] flex items-center justify-center"
												buttonText="Ingresar"
												onClick={() => handleCardProximoSorteoClick(sorteo.id)}
											/>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				{rafflesData &&
					rafflesData.anteriores &&
					rafflesData.anteriores.length > 0 && (
						<div className="mt-10 lg:mt-20">
							<h2 className="text-white text-sm md:text-base font-semibold">
								Anteriores
							</h2>
							<div className="px-2 py-8 lg:px-4 lg:py-6">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
									{rafflesData.anteriores.map((sorteo: any) => (
										<div key={sorteo.id} className="flex justify-start w-full">
											<CardGames
												cardClassName="drop-shadow-lg w-full max-w-[450px] md:max-w-[500px]"
												backgroundColor={sorteo.color_portada}
												imageContainer="flex justify-start items-center"
												imageClassName="w-[80px] h-[130px] sm:w-[150px] sm:h-[155px] md:w-[180px] md:h-[180px] lg:w-[191px] lg:h-[191px]"
												image={fixImageUrl(sorteo.imagen)}
												altText={`Sortea: ${sorteo.fin}`}
												title={sorteo.nombre}
												description={sorteo.descripcion}
												buttonRouter={true}
												buttonRouterClassName="bg-blueEmmagini text-white text-xs sm:text-sm lg:text-base w-full max-w-[200px] h-[36px] flex items-center justify-center"
												buttonText="Ingresar"
												onClick={() => handleCardSorteoAnteriorClick(sorteo.id)}
											/>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

				<ButtonNav
					items={[
						{
							link: "/app/",
							icon: <IoMdArrowRoundBack size={22} className="text-white" />,
							texto: "Volver",
						},
						{
							link: "/app/productos",
							icon: <HiShoppingBag size={22} className="text-white" />,
							texto: "Tienda online",
						},
						{
							link: "/app/premium",
							icon: <AiOutlineTrophy size={22} className="text-white" />,
							texto: "Premium",
						},
					]}
				/>
			</div>
		</div>
	);
}

export default Page;
