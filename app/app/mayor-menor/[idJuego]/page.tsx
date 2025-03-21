"use client";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { useDataContext } from "@/app/context/GameDataProvider";
import { useAuthContext } from "@/app/context/AuthProvider";
import MemoBlock from "../MemoBlock/MemoBlock";
import RoundButton from "@/app/components/buttons/RoundButton";
import { useRouter } from "next/navigation";
const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;
interface ComponentProps {
	params: {
		idJuego: string;
	};
}

const fetchGetGame = async (
	token: string,
	userId: string,
	idJuego: string,
	lang: string
) => {
	const response = await axios.post(
		"https://backend.emmagini.com/api2/mom_jugar",
		{
			id: idJuego,
			action: "get",
			host: HOST_URL,
			callback: `https://${HOST_URL}/home.php#v=mom&id=${idJuego}`,
			token,
			userid: userId,
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

const fetchStartGame = async (
	token: string,
	userId: string,
	idJuego: string,
	lang: string
) => {
	const response = await axios.post(
		"https://backend.emmagini.com/api2/mom_jugar",
		{
			id: idJuego,
			action: "start",
			host: HOST_URL,
			callback: `https://${HOST_URL}/home.php#v=mom&id=${idJuego}`,
			token,
			userid: userId,
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

const fetchActionGame = async (
	token: string,
	userId: string,
	idJuego: string,
	action: string,
	lang: string
) => {
	const response = await axios.post(
		"https://backend.emmagini.com/api2/mom_jugar",
		{
			id: idJuego,
			action,
			host: HOST_URL,
			callback: `https://${HOST_URL}/home.php#v=mom&id=${idJuego}`,
			token,
			userid: userId,
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

function useBannerDimensions() {
	const [dimensions, setDimensions] = useState({ width: 480, height: 360 });

	useEffect(() => {
		function handleResize() {
			const windowWidth = window.innerWidth;
			if (windowWidth >= 1280) {
				setDimensions({ width: 480, height: 360 });
			} else if (windowWidth >= 1024) {
				setDimensions({ width: 400, height: 300 });
			} else if (windowWidth >= 768) {
				setDimensions({ width: 360, height: 270 });
			} else {
				setDimensions({ width: 320, height: 240 });
			}
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return dimensions;
}

function Page({ params: { idJuego } }: ComponentProps) {
	const { infoGames, empresa, refetchAppData } = useDataContext();
	const { token, userId, lang } = useAuthContext();
	const router = useRouter();

	const {
		data: startGameData,
		isLoading,
		refetch,
	} = useQuery(
		["startGameData", token, userId, idJuego],
		async () => {
			const getData = await fetchGetGame(token, userId, idJuego, lang);
			if (getData?.id === null && getData?.error === 0) {
				return await fetchStartGame(token, userId, idJuego, lang);
			}
			return getData;
		},
		{
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
		}
	);

	const [cardFlip, setCardFlip] = useState(false);
	const [cardDirection, setCardDirection] = useState(1);
	const [actionFlip, setActionFlip] = useState(false);
	const [actionDirection, setActionDirection] = useState(1);
	const [bannerFlip, setBannerFlip] = useState(false);
	const [bannerDirection, setBannerDirection] = useState(-1);
	const [actionGameData, setActionGameData] = useState<any>(null);
	const [resultImage, setResultImage] = useState<string | null>(null);
	const [mayorText, setMayorText] = useState("Mayor");
	const [menorText, setMenorText] = useState("Menor");
	const [mayorBgColor, setMayorBgColor] = useState("bg-blueEmmagini");
	const [gameKey, setGameKey] = useState(0);

	const bannerDimensions = useBannerDimensions();

	useEffect(() => {
		if (startGameData) {
			setCardDirection(-1);
			setActionDirection(-1);
			setBannerDirection(-1);
			setCardFlip(false);
			setActionFlip(false);
			setBannerFlip(false);

			const timer = setTimeout(() => {
				setCardDirection(1);
				setCardFlip(true);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [startGameData]);

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

	async function handleActionClick(newAction: string) {
		try {
			const data = await fetchActionGame(
				token,
				userId,
				idJuego,
				newAction,
				lang
			);
			setTimeout(() => {
				setActionGameData(data);
				setActionDirection(1);
				setActionFlip(true);
				setBannerDirection(1);
				setBannerFlip(true);
				if (data?.win !== undefined) {
					const currentJuego = infoGames.find(
						(juegoItem: any) => juegoItem.id === idJuego
					);
					setResultImage(
						data.win ? currentJuego.imagen_ok : currentJuego.imagen_fail
					);
					if (data.win) {
						setMayorText("Cobrar y salir");
						setMenorText("Continuar");
						setMayorBgColor("bg-[#ea9a45]");
						setOnClickMayor(() => () => handleCobrar());
						setOnClickMenor(() => () => resetGame());
					} else {
						setMayorText("Salir");
						setMenorText("Volver a jugar");
						setMayorBgColor("bg-[#ea9a45]");
						setOnClickMayor(() => () => router.push("/app"));
						setOnClickMenor(() => () => resetGame());
					}
				}
			}, 1000);
		} catch (error) {
			console.error("Error en handleActionClick:", error);
		}
	}

	async function handleCobrar() {
		try {
			await fetchActionGame(token, userId, idJuego, "cobrar", lang);
		} catch (error) {
			console.error("Error en handleCobrar:", error);
		}
		setTimeout(() => {
			router.push("/app");
			refetchAppData();
		}, 300);
	}

	async function resetGame() {
		try {
			setCardDirection(-1);
			setActionDirection(-1);
			setBannerDirection(-1);
			setCardFlip(false);
			setActionFlip(false);
			setBannerFlip(false);
			setActionGameData(null);
			setResultImage(null);
			setMayorText("Mayor");
			setMenorText("Menor");
			setMayorBgColor("bg-blueEmmagini");
			refetchAppData();

			await refetch();
			setOnClickMayor(() => () => handleActionClick("mayor"));
			setOnClickMenor(() => () => handleActionClick("menor"));
			setGameKey((prev) => prev + 1);

			const timer = setTimeout(() => {
				setCardDirection(1);
				setCardFlip(true);
			}, 500);
			return () => clearTimeout(timer);
		} catch (error) {
			console.error("Error en resetGame:", error);
		}
	}

	const [onClickMayor, setOnClickMayor] = useState<() => void>(
		() => () => handleActionClick("mayor")
	);
	const [onClickMenor, setOnClickMenor] = useState<() => void>(
		() => () => handleActionClick("menor")
	);

	if (!infoGames || isLoading || !startGameData) {
		return (
			<div className="mt-20 text-blueEmmagini">
				<div className="mt-96">
					<h1 className="text-blueEmmagini text-center mt-4 font-bold text-xl">
						CARGANDO
					</h1>
				</div>
			</div>
		);
	}

	const juego = infoGames.find((juegoItem: any) => juegoItem.id === idJuego);

	return (
		<div className="mt-20 flex flex-col items-center gap-8 px-4">
			<h1 className="text-white text-center text-xl font-medium">
				{juego.nombre}
			</h1>
			<div className="flex justify-center gap-4">
				<p className="text-center text-white text-base font-extrabold">
					Pozo: {juego.precio}
				</p>
				<p className="text-center text-white text-base font-extrabold">
					Ronda: {startGameData?.ronda || 0} / {juego.rondas}
				</p>
			</div>
			<div className="flex flex-wrap justify-center gap-6">
				<div className="w-[220px] h-[165px] sm:w-[180px] sm:h-[135px] md:w-[220px] md:h-[165px]">
					<MemoBlock
						key={`card-${gameKey}`}
						memoBlock={{ img: startGameData?.img_carta }}
						cover={juego.reverso}
						controlledFlip={cardFlip}
						flipDirection={cardDirection}
						width={220}
						height={165}
					/>
				</div>
				<div className="w-[220px] h-[165px] sm:w-[180px] sm:h-[135px] md:w-[220px] md:h-[165px]">
					<MemoBlock
						key={`action-${gameKey}`}
						memoBlock={{ img: actionGameData?.img_carta }}
						cover={juego.reverso}
						controlledFlip={actionFlip}
						flipDirection={actionDirection}
						width={220}
						height={165}
					/>
				</div>
			</div>
			<div className="w-full max-w-[200px] flex flex-col gap-2">
				<RoundButton
					text={mayorText}
					buttonClassName={`w-full h-full ${mayorBgColor} text-white`}
					onClick={onClickMayor}
				/>
				<RoundButton
					text={menorText}
					buttonClassName="w-full h-full bg-blueEmmagini text-white"
					onClick={onClickMenor}
				/>
			</div>

			<div
				className="rounded-lg"
				style={{
					width: bannerDimensions.width,
					height: bannerDimensions.height,
				}}
			>
				<MemoBlock
					key={`banner-${gameKey}`}
					memoBlock={{ img: resultImage || undefined }}
					cover={juego.banner}
					controlledFlip={bannerFlip}
					flipDirection={bannerDirection}
					width={bannerDimensions.width}
					height={bannerDimensions.height}
				/>
			</div>
		</div>
	);
}

export default Page;
