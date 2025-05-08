"use client";
import { useState } from "react";
import ModalMensaje from "@/app/components/extras/ModalMensajes";
import { useDataContext } from "../../context/GameDataProvider";
import { useRouter } from "next/navigation";
import CardHome from "../cards/CardHome";
import CardTruco from "@/app/components/cards/CardTruco";
//import { useSeriesTrucoDataContext } from "@/app/context/truco/SeriesTrucoProvider";
import { useDataAlbumContext } from "@/app/context/trivia/AlbumProvider";
import WhileTap from "@/app/components/animations/WhileTap";

function Table() {
	const { infoGames, infoTruco, empresa, textos, data } = useDataContext();
	//const { setIdTorneo } = useSeriesTrucoDataContext();
	const { idAlbum, setIdAlbum } = useDataAlbumContext();
	const router = useRouter();
	const [showModal, setShowModal] = useState(false);
	const [modalMessage, setModalMessage] = useState("");
	const userModoPremium = data?.premium === true;

	console.log("infoGames", infoGames);
	console.log("Data", data);
	console.log("Empresa", empresa);

	const showModalMessage = (message) => {
		setModalMessage(message);
		setShowModal(true);
	};

	const saveTournamentIdToCache = (tournamentId) => {
		localStorage.setItem("tournamentId", tournamentId);
	};

	const handleSorteoCardClick = () => {
		router.push(`/app/sorteos`);
	};

	const handleCardClick = (id, tipo, nombre) => {
		if (tipo === "museo") {
			router.push(`/app/museo/${id}`);
		} else if (tipo === "album") {
			if (nombre === "Trivia") {
				router.push(`/app/trivia/${id}`);
				setIdAlbum(id);
			} else {
				router.push(`/app/stickers/${id}`);
			}
		} else if (tipo === "parejas") {
			router.push(`/app/parejas/${id}`);
		} else if (tipo === "memotest") {
			router.push(`/app/memotest/${id}`);
		} else if (tipo === "lineatiempo") {
			router.push(`/app/lineatiempo/${id}`);
		} else if (tipo === "torneotruco") {
			router.push(`/app/truco`);
		} else if (tipo === "mom") {
			router.push(`/app/mayor-menor/${id}`);
		} else {
			("");
		}
	};

	const fixImageUrl = (url) => {
		if (!url || typeof url !== "string") return "";
		if (url.trim() === "https:") return "";
		if (url.startsWith("//")) return `https:${url}`;
		if (url.startsWith("http://") || url.startsWith("https://")) return url;
		return "";
	};

	const isPremiumContent = (content) =>
		content?.solo_premium === true || content?.solo_premium === "1";

	const handleCardClickWithModal = (game, tipo) => {
		if (isPremiumContent(game) && !userModoPremium) {
			showModalMessage(
				"Upss! Este contenido es exclusivo para usuarios premium."
			);
		} else {
			handleCardClick(game.id, tipo, game.titulo);
		}
	};

	const handleButtonCLick = () => {
		router.push(`/app/premium`);
	};

	return (
		<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 p-10 mb-32 pb-[150px] mt-10">
			{showModal && (
				<ModalMensaje
					message={modalMessage}
					buttonText="Suscribirme"
					onButtonClick={handleButtonCLick}
				/>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
				{empresa && empresa.mostrar_sorteos === 1 && (
					<WhileTap>
						<div className="flex justify-center">
							<CardHome
								text={textos.titulo_sorteos}
								imageCard={fixImageUrl(empresa.imagen_sorteos)}
								onClick={handleSorteoCardClick}
							/>
						</div>
					</WhileTap>
				)}

				{infoGames &&
					Object.values(infoGames)
						.sort((a, b) => a.orden - b.orden)
						.map((game, index) => {
							const rawImage =
								game.imagen || game.imagen_0 || game.imagen_1 || game.image;
							const imageSrc = fixImageUrl(rawImage);

							return (
								<WhileTap key={game.id}>
									<div className="flex justify-center">
										<CardHome
											text={game.titulo}
											imageCard={imageSrc || undefined}
											imageClassName={
												isPremiumContent(game) && !userModoPremium
													? "blur-sm"
													: ""
											}
											onClick={() => handleCardClickWithModal(game, game.tipo)}
										/>
									</div>
								</WhileTap>
							);
						})}

				{/*infoTruco &&
					Object.values(infoTruco)
						.sort((a, b) => a.orden - b.orden)
						.map((torneo) => (
							<WhileTap key={torneo.id}>
								<div className="flex justify-center">
									<CardHome
										onClick={() =>
											handleCardClickWithModal(torneo, torneo.tipo)
										}
										text={torneo.titulo}
										imageCard={
											torneo.image ||
											torneo.imagen ||
											torneo.imagen_1 ||
											torneo.imagen_0
										}
										imageClassName={
											isPremiumContent(game) && !userModoPremium
												? "blur-sm"
												: ""
										}
									/>
								</div>
							</WhileTap>
						))*/}
			</div>
		</div>
	);
}

export default Table;
