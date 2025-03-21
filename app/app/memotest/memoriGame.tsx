import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useDataContext } from "@/app/context/GameDataProvider";
import { useAuthContext } from "@/app/context/AuthProvider";
import Board from "@/app/app/memotest/Tablero/Tablero";
import CountdownTimer from "@/app/components/extras/CountdownTimer";
import ModalMensajes from "@/app/components/extras/ModalMensajes";
import DinamicButtonNav from "@/app/components/home/DinamicButtonNav";
import Ruleta from "@/app/components/ruleta/Ruleta";
import ModalAyuda from "@/app/components/extras/modalAyuda";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdWorkspacePremium } from "react-icons/md";
import { GrPowerReset } from "react-icons/gr";
import "./styles.css";

interface AppProps {
	idDelJuego: string;
	idPartida: string;
	iniciarPartida: () => Promise<any>;
}

const App: React.FC<AppProps> = ({ idDelJuego, idPartida, iniciarPartida }) => {
	const router = useRouter();
	const { data, refetchAppData } = useDataContext();
	const { token, userId, lang } = useAuthContext();
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(true);
	const [shuffledMemoBlocks, setShuffledMemoBlocks] = useState<any[]>([]);
	const [selectedMemoBlock, setSelectedMemoBlock] = useState<any | null>(null);
	const [animating, setAnimating] = useState(false);
	const [successfulAttempts, setSuccessfulAttempts] = useState(0);
	const [failedAttempts, setFailedAttempts] = useState(0);
	const [pairsFound, setPairsFound] = useState(0);
	const [modalOpen, setModalOpen] = useState(false);
	const [timeoutCalled, setTimeoutCalled] = useState(false);
	const [resetTimer, setResetTimer] = useState(false);
	const [modalContent, setModalContent] = useState<any>(null);
	const [modalText, setModalText] = useState<any>(null);
	const [showRuleta, setShowRuleta] = useState(false);
	const [buttonText, setButtonText] = useState<string>("Volver");
	const [showRuletaButton, setShowRuletaButton] = useState<boolean>(false);
	const [cover, setCover] = useState<string>("");
	const [gameStarted, setGameStarted] = useState(false);
	const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

	useEffect(() => {
		const hideModal = localStorage.getItem(`hideModal_${idDelJuego}`);
		if (hideModal === "true") {
			setIsHelpModalOpen(false);
			setGameStarted(true);
		}
	}, [idDelJuego]);

	useEffect(() => {
		if (data && data.contenidos) {
			const contenido = data.contenidos.find(
				(contenido: any) => contenido.id === idDelJuego
			);

			if (contenido && contenido.data && contenido.data.images) {
				const imagesList = contenido.data.images.map((image: any) => ({
					id: image.id,
					img: image.img,
				}));

				const shuffledImageList = shuffleArray([...imagesList, ...imagesList]);

				setShuffledMemoBlocks(
					shuffledImageList.map((image, i) => ({
						index: i,
						id: image.id,
						img: image.img,
						flipped: false,
					}))
				);

				setCover(contenido.data.cover);
			}
		}
	}, [data, idDelJuego]);
	const shuffleArray = (array: any[]) => {
		let currentIndex = array.length,
			randomIndex;

		while (currentIndex !== 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			[array[currentIndex], array[randomIndex]] = [
				array[randomIndex],
				array[currentIndex],
			];
		}

		return array;
	};

	const handleMemoClick = (memoBlock: any) => {
		if (animating || memoBlock.flipped) return;

		const flippedMemoBlock = { ...memoBlock, flipped: true };
		let shuffledMemoBlocksCopy = [...shuffledMemoBlocks];
		shuffledMemoBlocksCopy.splice(memoBlock.index, 1, flippedMemoBlock);
		setShuffledMemoBlocks(shuffledMemoBlocksCopy);

		if (selectedMemoBlock === null) {
			setSelectedMemoBlock(memoBlock);
		} else if (selectedMemoBlock.id === memoBlock.id) {
			setSelectedMemoBlock(null);
			// @ts-ignore
			setSuccessfulAttempts((prev) => prev + 1);
			// @ts-ignore
			setPairsFound((prev) => prev + 1);

			if (pairsFound + 1 === shuffledMemoBlocks.length / 2) {
				finalizarPartida();
			}
		} else {
			setAnimating(true);
			setTimeout(() => {
				shuffledMemoBlocksCopy.splice(memoBlock.index, 1, {
					...memoBlock,
					flipped: false,
				});
				shuffledMemoBlocksCopy.splice(selectedMemoBlock.index, 1, {
					...selectedMemoBlock,
					flipped: false,
				});
				setShuffledMemoBlocks(shuffledMemoBlocksCopy);
				setSelectedMemoBlock(null);
				setAnimating(false);
				// @ts-ignore
				setFailedAttempts((prev) => prev + 1);
			}, 1000);
		}
	};

	const finalizarPartida = useCallback(async () => {
		try {
			const response = await axios.post(
				"https://backend.emmagini.com/api2/fin_partida",
				{
					token: token,
					userid: userId,
					id_juego: idDelJuego,
					id_partida: idPartida,
					correctas: successfulAttempts,
					incorrectas: failedAttempts,
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
				setButtonText("Multiplica tu premio");
				setShowRuletaButton(true);
				setGameStarted(false);
			} else {
				setButtonText("Volver");
				setShowRuletaButton(false);
			}
			setGameStarted(false);
		} catch (error) {
			console.error("Error al hacer la solicitud", error);
		}
	}, [
		token,
		userId,
		idDelJuego,
		idPartida,
		lang,
		successfulAttempts,
		failedAttempts,
		refetchAppData,
	]);

	const finalizarPartidaConTimeout = useCallback(async () => {
		if (timeoutCalled) return;
		setTimeoutCalled(true);

		try {
			const response = await axios.post(
				"https://backend.emmagini.com/api2/fin_partida",
				{
					token: token,
					userid: userId,
					id_juego: idDelJuego,
					id_partida: idPartida,
					correctas: successfulAttempts,
					incorrectas: failedAttempts,
					timeout: 1,
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
		} catch (error) {
			console.error("Error al hacer la solicitud", error);
		}
	}, [
		token,
		userId,
		idDelJuego,
		idPartida,
		lang,
		successfulAttempts,
		failedAttempts,
		timeoutCalled,
		refetchAppData,
	]);

	const reiniciarJuego = async () => {
		try {
			await finalizarPartidaConTimeout();

			const nuevaPartida = await iniciarPartida();

			if (nuevaPartida && nuevaPartida.id_partida) {
				const imagesList =
					data?.contenidos
						.find((contenido: any) => contenido.id === idDelJuego)
						?.data?.images.map((image: any) => ({
							id: image.id,
							img: image.img,
						})) || [];

				const shuffledImageList = shuffleArray([...imagesList, ...imagesList]);

				setShuffledMemoBlocks(
					shuffledImageList.map((image, i) => ({
						index: i,
						id: image.id,
						img: image.img,
						flipped: false,
					}))
				);

				setSelectedMemoBlock(null);
				setSuccessfulAttempts(0);
				setFailedAttempts(0);
				setPairsFound(0);
				setAnimating(false);
				setModalOpen(false);
				setTimeoutCalled(false);
				setResetTimer(true);
				setTimeout(() => setResetTimer(false), 100);
				refetchAppData();
			}
		} catch (error) {
			console.error("Error al reiniciar la partida", error);
		}
	};

	const handleClickBack = () => {
		router.back();
	};
	const handleModalButtonClick = () => {
		if (showRuletaButton) {
			setModalOpen(false);
			setTimeout(() => setShowRuleta(true), 200);
		} else {
			router.back();
		}
	};

	const handleStartGame = () => {
		setIsHelpModalOpen(false);
		setGameStarted(true);
	};
	return (
		<div>
			<ModalAyuda
				isOpen={isHelpModalOpen}
				text={
					data?.contenidos.find((contenido: any) => contenido.id === idDelJuego)
						?.extra
				}
				textButton="Jugar"
				image={
					data?.contenidos.find((contenido: any) => contenido.id === idDelJuego)
						?.imagen_ayuda
				}
				onClick={handleStartGame}
				idJuego={idDelJuego}
			/>
			<h1 className="mt-20 text-white text-center text-2xl font-bold">
				{
					data?.contenidos.find((contenido: any) => contenido.id === idDelJuego)
						?.nombre
				}
			</h1>
			<h2 className="mt-6 text-white text-center">
				{
					data?.contenidos.find((contenido: any) => contenido.id === idDelJuego)
						?.extra
				}
			</h2>

			<CountdownTimer
				start={gameStarted}
				duration={300}
				onTimeOut={finalizarPartidaConTimeout}
				resetTimer={resetTimer}
			/>
			<Board
				memoBlocks={shuffledMemoBlocks}
				animating={animating}
				handleMemoClick={handleMemoClick}
				cover={cover}
			/>
			<DinamicButtonNav
				// @ts-ignore
				icon1={<GrPowerReset size={25} className="text-white" />}
				// @ts-ignore
				icon2={<MdWorkspacePremium size={25} className="text-white" />}
				// @ts-ignore
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
			{showRuleta && <Ruleta idPartida={idPartida} />}
		</div>
	);
};

export default App;
