"use client";

import { useEffect } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDataContext } from "@/app/context/GameDataProvider";
import { useAuthContext } from "@/app/context/AuthProvider";
import PrizesCard from "@/app/components/cards/PrizesCard";
import ButtonNav from "@/app/components/home/ButtonNav";
import { IoMdArrowRoundBack } from "react-icons/io";
import { AiOutlineTrophy } from "react-icons/ai";
import { HiShoppingBag } from "react-icons/hi";
import "@/app/components/styles/loader.css";

const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

const fetchSorteo = async (
	token: any,
	userId: any,
	idSorteo: any,
	lang: string
) => {
	const response = await axios.post(
		"https://backend.emmagini.com/api2/get_sorteo",
		{
			token,
			userid: userId,
			id: idSorteo,
			host: HOST_URL,
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

interface ComponentProps {
	params: {
		idSorteo: string;
	};
}

function Page({ params: { idSorteo } }: ComponentProps) {
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
		data: raffleData,
		error,
		isLoading,
	} = useQuery(["raffleData", token, userId], () =>
		fetchSorteo(token, userId, idSorteo, lang)
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
		<div className="mt-20">
			<h1 className="text-white text-center font-bold text-2xl">
				Titulo del sorteo
			</h1>
			<p className="text-white text-center mt-2">
				{raffleData.content.descripcion}
			</p>
			<p className="text-white text-center mt-2 font-semibold">
				{raffleData.content.subtitulo}
			</p>
			<div className="mt-20 flex flex-col items-center lg:flex-row lg:justify-center gap-10">
				{/* Columna de premios */}
				<div className="w-[336px] h-auto flex flex-col gap-y-6">
					<h2 className="text-white text-center lg:text-left mb-4 text-xs lg:text-base font-semibold">
						Premios
					</h2>

					{raffleData.content.premios
						.filter((premio: any) => premio.suplente === 0)
						.map((premio: any) => (
							<div key={premio.id} className="w-full  drop-shadow-lg">
								<PrizesCard
									title={premio.titulo}
									imageClassName="rounded-lg"
									description={premio.descripcion}
									image={fixImageUrl(premio.imagen)}
								/>
							</div>
						))}
				</div>

				{/* Columna de suplentes */}
				<div className="w-[336px] h-auto flex flex-col gap-y-6">
					<h2 className="text-white text-center lg:text-left mb-4 text-xs lg:text-base font-semibold">
						Suplentes
					</h2>

					{raffleData.content.premios
						.filter((premio: any) => premio.suplente === 1)
						.map((premio: any) => (
							<div key={premio.id} className="w-full  drop-shadow-lg">
								<PrizesCard
									title={premio.titulo}
									imageClassName="rounded-lg"
									description={premio.descripcion}
									image={fixImageUrl(premio.imagen)}
								/>
							</div>
						))}
				</div>
			</div>
			<ButtonNav
				items={[
					{
						link: "/app/sorteos",
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
	);
}

export default Page;
