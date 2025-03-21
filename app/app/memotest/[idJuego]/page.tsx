"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuthContext } from "@/app/context/AuthProvider";
import MemoryGame from "../memoriGame";
import "@/app/components/styles/loader.css";

interface ComponentProps {
	params: {
		idJuego: string;
	};
}

function Page({ params: { idJuego } }: ComponentProps) {
	const { token, userId, lang } = useAuthContext();
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<any>(null);
	const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

	const iniciarPartida = useCallback(async () => {
		try {
			const response = await axios.post(
				"https://backend.emmagini.com/api2/iniciar_partida",
				{
					token: token,
					userid: userId,
					id_juego: idJuego,
					id_partida: "",
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
		} catch (error) {
			console.error("Error al hacer la solicitud", error);
			throw error;
		}
	}, [token, userId, idJuego, lang]);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const apiResponse = await iniciarPartida();

			setResponse(apiResponse);

			setLoading(false);
		} catch (error) {
			console.error("Error al obtener los datos:", error);
			setLoading(false);
		}
	}, [iniciarPartida]);

	useEffect(() => {
		if (token && userId) {
			fetchData();
		}
	}, [fetchData, token, userId]);

	if (loading) {
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
			/*
			<>
				<div className="mt-96 ml-46">
					<div className="wrapper">
						<div className="circle"></div>
						<div className="circle"></div>
						<div className="circle"></div>
						<div className="shadow"></div>
						<div className="shadow"></div>
						<div className="shadow"></div>
					</div>
					<h1 className="text-blueEmmagini text-center mt-4 font-bold text-xl">
						CARGANDO
					</h1>
				</div>
			</> */
		);
	}
	return response ? (
		<MemoryGame
			idDelJuego={idJuego}
			idPartida={response.id_partida}
			iniciarPartida={iniciarPartida}
		/>
	) : (
		<div>Oppps! No se pudo iniciar la partida.</div>
	);
}

export default Page;
