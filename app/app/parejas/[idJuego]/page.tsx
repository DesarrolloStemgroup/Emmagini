"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "react-query";
import axios from "axios";
import { useAuthContext } from "@/app/context/AuthProvider";
import { useDataContext } from "@/app/context/GameDataProvider";
import DinamicButtonNav from "@/app/components/home/DinamicButtonNav";
import CountdownTimer from "@/app/components/extras/CountdownTimer";
import ModalMensajes from "@/app/components/extras/ModalMensajes";
import ModalGame from "@/app/components/extras/ModalGame";
import ModalAyuda from "@/app/components/extras/modalAyuda";
import Ruleta from "@/app/components/ruleta/Ruleta";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdWorkspacePremium } from "react-icons/md";
import { GrPowerReset } from "react-icons/gr";
import "@/app/components/styles/loader.css";

const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

// @ts-ignore
const validateData = async ({ token, userId, lang }) => {
	const response = await axios.post(
		"https://backend.emmagini.com/api2/validate",
		{
			callback: `https://${HOST_URL}/home.php#v=inicio`,
			token,
			userid: userId,
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
		idJuego: string;
	};
}

const Page = ({ params: { idJuego } }: ComponentProps) => {
	const { userId, token, lang } = useAuthContext();
	const { refetchAppData } = useDataContext();
	const [responseApi, setResponseApi] = useState<any>(null);
	const [contenidoEncontrado, setContenidoEncontrado] = useState(null);
	const [column1, setColumn1] = useState([]);
	const [column2, setColumn2] = useState([]);
	const [matchedDivs, setMatchedDivs] = useState([]);
	const [wrongMatchIndices, setWrongMatchIndices] = useState([]);
	const [clickedDivs, setClickedDivs] = useState([]);
	const [correctAttempts, setCorrectAttempts] = useState(0);
	const [incorrectAttempts, setIncorrectAttempts] = useState(0);
	const [modalContent, setModalContent] = useState<any>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalGameOpen, setModalGameOpen] = useState(false);
	const [modalText, setModalText] = useState<any>(null);
	const [resetTimer, setResetTimer] = useState(false);
	const [timeoutCalled, setTimeoutCalled] = useState(false);
	const [loading, setLoading] = useState(true);
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(true);
	const [gameStarted, setGameStarted] = useState(false);
	const [buttonText, setButtonText] = useState<string>("Volver");
	const [showRuletaButton, setShowRuletaButton] = useState<boolean>(false);
	const [showRuleta, setShowRuleta] = useState(false);

	const { data, error, isLoading } = useQuery(
		["validateData", token, userId],
		() => validateData({ token, userId, lang }),
		{
			enabled: !!token && !!userId,
			refetchOnWindowFocus: false,
		}
	);

	const router = useRouter();

	useEffect(() => {
		const hideModal = localStorage.getItem(`hideModal_${idJuego}`);
		if (hideModal === "true") {
			setIsHelpModalOpen(false);
			setGameStarted(true);
		}
	}, [idJuego]);

	//Iniciar la partida y obtener el id_partida
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

			setResponseApi(apiResponse);

			setLoading(false);
		} catch (error) {
			console.error("Error al obtener los datos:", error);
			setLoading(false);
		}
	}, [iniciarPartida]);

	useEffect(() => {
		if (token && userId) {
			let hasStarted = false;

			if (!hasStarted) {
				fetchData();
				hasStarted = true;
			}
		}
	}, [token, userId, fetchData]);

	//Buscamos en la respuesta de la api el contenido que coincide con el idJuego que recibimos por parametro.

	useEffect(() => {
		if (data?.contenidos) {
			const contenido = data.contenidos.find(
				(item: any) => item.id === idJuego
			);
			if (contenido && contenido.data?.images) {
				const images = contenido.data.images;

				const column1Images = images.map((image: any) => ({
					id: image.id,
					url: image.img_1,
				}));
				setColumn1(column1Images);

				const column2Images = images.map((image: any) => ({
					id: image.id,
					url: image.img_2,
				}));

				const shuffledColumn2 = column2Images
					// @ts-ignore
					.map((a) => ({ sort: Math.random(), value: a }))
					// @ts-ignore
					.sort((a, b) => a.sort - b.sort)
					// @ts-ignore
					.map(({ value }) => value);

				setColumn2(shuffledColumn2);

				setContenidoEncontrado(contenido);
				console.log("Contenido encontrado:", contenidoEncontrado);
			} else {
				console.log("No se encontró contenido para el idJuego:", idJuego);
			}
		}
	}, [data, idJuego]);

	//Finalizamos la partida al encontrar todos los pares.

	const finalizarPartida = useCallback(async () => {
		try {
			const response = await axios.post(
				"https://backend.emmagini.com/api2/fin_partida",
				{
					token: token,
					userid: userId,
					id_juego: idJuego,
					id_partida: responseApi?.id_partida,
					correctas: correctAttempts,
					incorrectas: incorrectAttempts,
					timeout: 0,
					host: HOST_URL,
					lang: lang,
				},
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					},
				}
			);

			const updatedText = response.data.texto.replace(
				"%n",
				response.data.premio
			);
			const updatedContent = { ...response.data, texto: updatedText };

			setModalContent(updatedContent);

			setModalOpen(true);
			setModalText(updatedContent.texto);
			refetchAppData();
			if (response.data.ruleta === 1) {
				setGameStarted(false);
				setButtonText("Multiplica tu premio");
				setShowRuletaButton(true);
			} else {
				setButtonText("Volver");
				setShowRuletaButton(false);
			}
			setGameStarted(false);
		} catch (error) {
			console.error("Error al finalizar la partida:", error);
		}
	}, [
		token,
		userId,
		idJuego,
		lang,
		correctAttempts,
		incorrectAttempts,
		responseApi,
		fetchData,
	]);

	//Finalizar la partida si el tiempo se termino.

	const finalizarPartidaConTimeout = useCallback(async () => {
		if (timeoutCalled) return;
		setTimeoutCalled(true);

		try {
			const response = await axios.post(
				"https://backend.emmagini.com/api2/fin_partida",
				{
					token: token,
					userid: userId,
					id_juego: idJuego,
					id_partida: responseApi?.id_partida,
					correctas: correctAttempts,
					incorrectas: incorrectAttempts,
					timeout: 0,
					host: HOST_URL,
					lang: lang,
				},
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					},
				}
			);

			const updatedText = response.data.texto;
			const updatedContent = { ...response.data, texto: updatedText };

			setModalContent(updatedContent);

			setModalOpen(true);
			setModalText("Oppss! Tiempo agotado");
			refetchAppData();

			await fetchData();
		} catch (error) {
			console.error("Error al hacer la solicitud", error);
		}
	}, [
		token,
		userId,
		idJuego,
		lang,
		responseApi,
		correctAttempts,
		incorrectAttempts,
		timeoutCalled,
		fetchData,
	]);

	const handleDivClick = (item: any, index: any) => {
		// @ts-ignore
		if (matchedDivs.includes(index) || clickedDivs.length === 2) return;

		const newClickedDivs = [...clickedDivs, { item, index }];
		// @ts-ignore
		setClickedDivs(newClickedDivs);

		if (newClickedDivs.length === 2) {
			const [firstDiv, secondDiv] = newClickedDivs;

			if (firstDiv.item.id === secondDiv.item.id) {
				// @ts-ignore
				setMatchedDivs((prev) => [...prev, firstDiv.index, secondDiv.index]);
				setCorrectAttempts((prev) => prev + 1);
			} else {
				setIncorrectAttempts((prev) => prev + 1);
				// @ts-ignore
				setWrongMatchIndices([firstDiv.index, secondDiv.index]);
			}

			setTimeout(() => {
				setClickedDivs([]);
				setWrongMatchIndices([]);
			}, 1000);

			if (matchedDivs.length + 2 === column1.length * 2) {
				finalizarPartida();
			}
		}
	};

	const renderDivs = (column: any, columnOffset: number) =>
		column.map((item: any, index: number) => {
			const realIndex = columnOffset + index;
			// @ts-ignore
			const isSelected = clickedDivs.some((div) => div.index === realIndex);
			// @ts-ignore
			const isMatched = matchedDivs.includes(realIndex);
			// @ts-ignore
			const isWrongMatch = wrongMatchIndices.includes(realIndex);

			const borderColor = isMatched
				? "border-[#1b943a]"
				: isWrongMatch
				? "border-red"
				: isSelected
				? "border-blueEmmagini"
				: "border-gray-500";

			return (
				<div
					key={realIndex}
					onClick={() => handleDivClick(item, realIndex)}
					className={`w-full h-32 rounded-lg border-8 ${borderColor} ${
						isMatched ? "cursor-not-allowed" : "cursor-pointer"
					}`}
				>
					<Image
						src={item.url}
						alt={`Image ${realIndex}`}
						className="w-full h-full object-cover"
						style={{
							pointerEvents: isMatched ? "none" : "auto",
						}}
						width={200}
						height={200}
					/>
				</div>
			);
		});

	const handleClickBack = () => {
		router.back();
	};

	//Reiniciar la partida si el usuario lo desea.

	const reiniciarPartida = useCallback(async () => {
		if (timeoutCalled) return;
		setTimeoutCalled(true);

		try {
			const response = await axios.post(
				"https://backend.emmagini.com/api2/fin_partida",
				{
					token: token,
					userid: userId,
					id_juego: idJuego,
					id_partida: responseApi?.id_partida,
					correctas: correctAttempts,
					incorrectas: incorrectAttempts,
					timeout: 0,
					host: HOST_URL,
					lang: lang,
				},
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					},
				}
			);

			setModalGameOpen(true);
			setModalText("Partida reiniciada");
			setLoading(true);

			await fetchData();

			setResetTimer(true);
			setTimeout(() => {
				setResetTimer(false);
			}, 500);

			setTimeoutCalled(false);
		} catch (error) {
			console.error("Error al hacer la solicitud", error);

			setTimeoutCalled(false);
		}
	}, [
		token,
		userId,
		idJuego,
		lang,
		responseApi,
		correctAttempts,
		incorrectAttempts,
		timeoutCalled,
		fetchData,
		setResetTimer,
	]);

	const reiniciarJuego = useCallback(async () => {
		try {
			await reiniciarPartida();

			if (modalOpen) {
				setModalOpen(false);
			}

			await fetchData();

			const contenido = data?.contenidos.find(
				(item: any) => item.id === idJuego
			);
			if (contenido && contenido.data?.images) {
				const images = contenido.data.images;

				const column1Images = images.map((image: any) => ({
					id: image.id,
					url: image.img_1,
				}));
				setColumn1(column1Images);

				const column2Images = images.map((image: any) => ({
					id: image.id,
					url: image.img_2,
				}));

				const shuffledColumn2 = column2Images
					// @ts-ignore
					.map((a) => ({ sort: Math.random(), value: a }))
					// @ts-ignore
					.sort((a, b) => a.sort - b.sort)
					// @ts-ignore
					.map(({ value }) => value);

				setColumn2(shuffledColumn2);

				setContenidoEncontrado(contenido);
			}

			setMatchedDivs([]);
			setClickedDivs([]);
			setCorrectAttempts(0);
			setIncorrectAttempts(0);
			setResetTimer(true);
		} catch (error) {
			console.error("Error al reiniciar el juego:", error);
		}
	}, [data, idJuego, finalizarPartidaConTimeout, fetchData]);

	const handleCloseModalGame = () => {
		setModalGameOpen(false);
	};
	const handleStartGame = () => {
		setIsHelpModalOpen(false);
		setGameStarted(true);
	};
	const handleModalButtonClick = () => {
		if (showRuletaButton) {
			setModalOpen(false);
			setTimeout(() => setShowRuleta(true), 200);
		} else {
			router.back();
		}
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

	if (error) {
		return console.error(error);
	}

	return (
		<>
			<ModalAyuda
				isOpen={isHelpModalOpen}
				// @ts-ignore
				text={contenidoEncontrado?.extra}
				textButton="Jugar"
				// @ts-ignore
				image={contenidoEncontrado?.imagen_ayuda}
				onClick={handleStartGame}
				idJuego={idJuego}
			/>
			<div className="mt-24 pb-32">
				<h1 className="text-white text-center text-2xl font-bold">
					{/*// @ts-ignore */}
					{contenidoEncontrado?.titulo || ""}
				</h1>
				<h1 className="text-white text-center text-base font-medium mt-4">
					{/*// @ts-ignore */}
					{contenidoEncontrado?.extra || ""}
				</h1>
				<CountdownTimer
					start={gameStarted}
					duration={300}
					onTimeOut={finalizarPartidaConTimeout}
					resetTimer={resetTimer}
				/>
				<div className="flex justify-center gap-2 md:gap-36 mt-4 p-[5px]">
					<div className="flex flex-col gap-6 w-[200px] h-auto">
						{renderDivs(column1, 0)}
					</div>

					<div className="flex flex-col gap-6 w-[200px] h-auto">
						{renderDivs(column2, column1.length)}
					</div>
				</div>
			</div>

			<DinamicButtonNav
				icon1={<GrPowerReset size={25} className="text-white" />}
				icon2={<MdWorkspacePremium size={25} className="text-white" />}
				icon3={<IoMdArrowRoundBack size={25} className="text-white" />}
				texto1="Reiniciar"
				texto2="Premium"
				texto3="Volver"
				onClick1={reiniciarJuego}
				onClick3={handleClickBack}
			/>
			{modalOpen && (
				<ModalMensajes
					message={modalText || ""}
					buttonText={buttonText}
					onButtonClick={handleModalButtonClick}
				/>
			)}
			{showRuleta && <Ruleta idPartida={responseApi?.id_partida} />}
			{modalGameOpen && (
				<ModalGame
					message={modalText}
					textButton="Jugar"
					onClick={handleCloseModalGame}
				/>
			)}
		</>
	);
};

export default Page;
