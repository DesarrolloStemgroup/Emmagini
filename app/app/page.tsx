"use client";

import { useEffect } from "react";
import React from "react";
import { useDataContext } from "@/app/context/GameDataProvider";
import ImageBanner from "../components/home/ImageBanner";
import Table from "../components/home/Table";
import banner from "../../public/assets/bg/background.png";
import "@/app/components/styles/loader.css";
import ButtonNav from "../components/home/ButtonNav";
import { BsGift } from "react-icons/bs";
import { AiOutlineTrophy } from "react-icons/ai";
import { HiShoppingBag } from "react-icons/hi";

const Home = () => {
	const { error, empresa, textos } = useDataContext();

	useEffect(() => {
		console.log("textos", textos);
	}, [textos]);

	useEffect(() => {
		if (empresa) {
			const backgroundImage = empresa
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
		}
	}, [empresa]);

	if (!empresa && !textos) {
		return (
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
		);
	}

	if (error) {
		return <div className="text-red-500 text-center mt-4">{error}</div>;
	}

	const fixImageUrl = (url: string) => {
		if (url && url.startsWith("//")) {
			return `https:${url}`;
		}
		return url;
	};

	return (
		<main>
			{empresa.header_activo === 1 && (
				<ImageBanner
					image={fixImageUrl(empresa.header_imagen)}
					welcomText={empresa.header_1}
					title={empresa.header_2}
					subtitle={empresa.header_contenido}
					buttonText={textos.btn_header_mas}
					link={empresa.header_destino}
				/>
			)}

			<Table />
			<ButtonNav
				items={[
					{
						link: "/app/subastas",
						icon: <BsGift size={22} className="text-white" />,
						texto: "Subastas",
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
		</main>
	);
};

export default Home;
