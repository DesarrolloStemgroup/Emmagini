"use client";

import { useRouter } from "next/navigation";
import { useDataAlbumContext } from "@/app/context/trivia/AlbumProvider";
import { useState, useCallback } from "react";
import Image from "next/image";
import { useAuthContext } from "@/app/context/AuthProvider";
import { useDataContext } from "@/app/context/GameDataProvider";
import ButtonNav from "@/app/components/home/ButtonNav";
import RoundButton from "@/app/components/buttons/RoundButton";
import Modal from "@/app/components/extras/Modal";
import { BsGift } from "react-icons/bs";
import { HiShoppingBag } from "react-icons/hi";
import { AiOutlineTrophy } from "react-icons/ai";
import "@/app/components/styles/loader.css";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";

interface ComponentProps {
	params: {
		idTrivia: string;
	};
}

const fetchValidateData = async (
	idTrivia: string,
	token: string,
	userId: string,
	lang: string
) => {
	const response = await axios.post(
		"https://backend.emmagini.com/api2/validate",
		{
			callback: `https://demo5.emmagini.com/home.php#v=album&id=${idTrivia}`,
			token,
			userid: userId,
			host: "demo5.emmagini.com",
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

const fetchAlbumData = async (
	idTrivia: string,
	token: string,
	userId: string,
	lang: string
) => {
	const response = await axios.post(
		"https://backend.emmagini.com/api2/get_album",
		{
			token,
			userid: userId,
			id: idTrivia,
			host: "demo5.emmagini.com",
			callback: "https://demo5.emmagini.com/home.php#v=inicio",
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

const fetchVideoData = async (
	idTrivia: string,
	token: string,
	userId: string,
	lang: string
) => {
	const response = await axios.post(
		"https://backend.emmagini.com/api2/get_video",
		{
			token,
			userid: userId,
			id: idTrivia,
			host: "demo5.emmagini.com",
			callback: "https://demo5.emmagini.com/home.php#v=inicio",
			lang: lang,
			trivia: "1",
		},
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			},
		}
	);
	return response.data;
};

const postAnswerData = async (
	preguntaId: string,
	respuestaId: string,
	idTrivia: string,
	videoId: string,
	token: string,
	userId: string,
	lang: string
) => {
	const requestBody: { [key: string]: any } = {
		id_album: idTrivia,
		id_video: videoId,
		sequencia: "0",
		host: "demo5.emmagini.com",
		lang: lang,
		trivia: "true",
		callback: `https://demo5.emmagini.com/home.php#v=album&id=${idTrivia}`,
		token,
		userid: userId,
	};
	requestBody[preguntaId] = respuestaId;

	const response = await axios.post(
		"https://backend.emmagini.com/api2/ans_video",
		requestBody,
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			},
		}
	);
	return response.data;
};

export default function Page({ params: { idTrivia } }: ComponentProps) {
	const { dataAlbum } = useDataAlbumContext();

	const { token, userId, lang } = useAuthContext();
	const { empresa } = useDataContext();
	const queryClient = useQueryClient();

	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [isAnswerLoading, setIsAnswerLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalData, setModalData] = useState({ text: "", image: "" });

	const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
	const [respuestasIncorrectas, setRespuestasIncorrectas] = useState(0);

	const { data: validateData } = useQuery(
		["validateData", idTrivia, token, userId],
		() => fetchValidateData(idTrivia, token, userId, lang),
		{
			enabled: !!token && !!userId,
		}
	);

	const { data: albumData, isLoading: isAlbumLoading } = useQuery(
		["albumData", idTrivia, token, userId],
		() => fetchAlbumData(idTrivia, token, userId, lang),
		{
			enabled: !!token && !!userId,
		}
	);

	const { data: videoData, isLoading: isVideoLoading } = useQuery(
		["videoData", idTrivia, token, userId],
		() => fetchVideoData(idTrivia, token, userId, lang),
		{
			enabled: !!token && !!userId,
		}
	);

	const mutation = useMutation(
		({
			preguntaId,
			respuestaId,
		}: {
			preguntaId: string;
			respuestaId: string;
		}) =>
			postAnswerData(
				preguntaId,
				respuestaId,
				idTrivia,
				videoData?.id || "",
				token,
				userId,
				lang
			),
		{
			onSuccess: (data) => {
				const { mensaje } = data;
				const isWrongAnswer = mensaje === "respuesta equivocada";
				const modalImage = isWrongAnswer
					? fixImageUrl(empresa.bootbox_nook_image)
					: fixImageUrl(empresa.bootbox_ok_image);
				const modalText = isWrongAnswer
					? `Opppss! ${mensaje}`
					: "Felicidades! Has respondido correctamente";

				if (isWrongAnswer) {
					setRespuestasIncorrectas((prev) => prev + 1);
				} else {
					setRespuestasCorrectas((prev) => prev + 1);
				}

				setModalData({
					image: modalImage,
					text: modalText,
				});
				setModalOpen(true);
			},
			onError: (error) => {
				console.error("Error al hacer la solicitud del video:", error);
			},
		}
	);

	const handleAnswerClick = (preguntaId: string, respuestaId: string) => {
		mutation.mutate({ preguntaId, respuestaId });
	};

	const handleModalClose = async () => {
		await queryClient.invalidateQueries(["videoData", idTrivia, token, userId]);
		setModalOpen(false);
	};

	const fixImageUrl = (url: string) => {
		if (url?.startsWith("//")) {
			return `https:${url}`;
		}
		return url;
	};

	if (isAlbumLoading || isVideoLoading) {
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

	if (mutation.isLoading) {
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
					<h1 className="text-blueEmmagini text-center mt-4 font-semibold">
						Verificando respuesta
					</h1>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				backgroundImage: `url(${dataAlbum?.imagen_0})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				minHeight: "100vh",
			}}
		>
			<h4 className="hidden md:block mt-[100px] text-center align-middle text-white mt-6">
				Sesión actual: Respuesta correctas: {respuestasCorrectas}- Respuestas
				incorrectas: {respuestasIncorrectas}
			</h4>
			<h4 className="sm:block md:hidden lg:hidden xl:hidden 2xl:hidden mt-[100px] text-center align-middle text-white mt-4">
				Sesión actual: <br /> Respuesta correctas: {respuestasCorrectas} <br />
				Respuestas incorrectas: {respuestasIncorrectas}
			</h4>

			<div className="flex flex-col lg:flex-row gap-10  w-full max-w-[1300px] lg:h-screen overflow-hidden p-2 items-center mx-auto  pb-[190px]">
				<div className="flex flex-col lg:gap-5 w-full lg:w-[705px] bg-white rounded-lg shadow-lg p-5">
					<Image
						// @ts-ignore
						src={fixImageUrl(videoData?.url || "")}
						alt="Video Thumbnail"
						className="mx-auto"
						width={400}
						height={500}
					/>
				</div>
				<div className="w-full lg:w-[537px] md:h-[542px] flex flex-col gap-5 pb-[80px]">
					{videoData?.preguntas && videoData.preguntas.length > 0
						? videoData.preguntas.map((pregunta: any, index: any) => (
								<div
									key={index}
									className="h-full flex flex-col justify-center items-center "
								>
									<h2 key={index} className="text-xl text-center mb-6">
										{pregunta.texto}
									</h2>

									{pregunta.respuestas.map((respuesta: any, index: any) => (
										<RoundButton
											buttonClassName="w-full h-[48px] bg-white rounded-[50px] border-2 border-gray-300 mb-6"
											text={respuesta.texto}
											key={index}
											onClick={() => {
												handleAnswerClick(pregunta.id, respuesta.id);
											}}
										/>
									))}
								</div>
						  ))
						: null}
				</div>
				<Modal
					text={modalData.text}
					isOpen={modalOpen}
					textButton="Siguiente"
					onClick={handleModalClose}
					image={modalData.image}
					width={450}
					height={450}
				/>
			</div>
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
		</div>
	);
}
