"use client";

import { useRouter } from "next/navigation";
import { useMemo, useEffect } from "react";
import Image from "next/image";
import { useDataContext } from "@/app/context/GameDataProvider";
import { Carousel } from "flowbite-react";
import ButtonNav from "@/app/components/home/ButtonNav";
import CardHome from "@/app/components/cards/CardHome";
import { BsGift } from "react-icons/bs";
import { BsCartCheck } from "react-icons/bs";
import { AiOutlineTrophy } from "react-icons/ai";
import "@/app/components/styles/loader.css";
import "@/app/globals.css";

interface ComponentProps {
	params: {
		idMuseo: string;
		idCategoria: string;
		idProducto: string;
		lang: string;
	};
}

export default function Page({
	params: { idMuseo, idCategoria, idProducto, lang },
}: ComponentProps) {
	const { infoGames, empresa } = useDataContext();
	const router = useRouter();

	const extractImageUrls = () => {
		const imageUrls: string[] = [];
		if (infoGames) {
			const museo = infoGames.find(
				(museoItem: any) => museoItem.id === idMuseo
			);
			const product = museo?.productos.find(
				(productItem: any) => productItem.id === idProducto
			);
			if (product) {
				for (let i = 1; i <= 10; i++) {
					const imageUrl = product[`imagen_${i}`];
					if (imageUrl) {
						imageUrls.push(imageUrl);
					}
				}
			}
		}
		return imageUrls;
	};

	const imageUrls = useMemo(extractImageUrls, [infoGames, idMuseo, idProducto]);

	useEffect(() => {
		const museo = infoGames?.find((museoItem: any) => museoItem.id === idMuseo);
		const product = museo?.productos.find(
			(productItem: any) => productItem.id === idProducto
		);

		if (product?.imagen_0 && product.imagen_0 !== "") {
			document.body.style.backgroundImage = `url(${product.imagen_0})`;
			document.body.style.backgroundSize = "cover";
			document.body.style.backgroundPosition = "center";
			document.body.style.backgroundRepeat = "no-repeat";
		} else if (empresa?.fondo) {
			document.body.style.backgroundImage = `url(https://backend.emmagini.com/uploads/${empresa.fondo})`;
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
	}, [infoGames, idMuseo, idProducto]);

	if (!infoGames) {
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

	const museo = infoGames.find((museoItem: any) => museoItem.id === idMuseo);
	if (!museo) {
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
						Museo no encontrado
					</h1>
				</div>
			</div>
		);
	}

	const categoria = museo.categorias.find(
		// @ts-ignore
		(categoria) => categoria.id === idCategoria
	);
	if (!categoria) {
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
						CATEGORIA NO ENCONTRADA
					</h1>
				</div>
			</div>
		);
	}

	const product = museo.productos.find(
		(productItem: any) => productItem.id === idProducto
	);
	if (!product) {
		return <div className="mt-20 text-black">Producto no encontrado.</div>;
	}

	const relatedProducts = museo.productos.filter(
		(item: any) =>
			item.id !== idProducto &&
			(product.rel_1 === item.id ||
				product.rel_2 === item.id ||
				product.rel_3 === item.id)
	);

	const fixImageUrl = (url: string) => {
		if (url?.startsWith("//")) {
			return `https:${url}`;
		}
		return url;
	};

	const handleCardClick = (idCategoria: string, idProducto: string) => {
		router.push(`/${lang}/${idCategoria}/${idProducto}`);
	};

	return (
		<>
			<div className="flex flex-col items-center">
				<div className="w-full max-w-[900px] px-4 sm:px-6 lg:px-8 mt-20 pb-20">
					{museo?.estructura
						// @ts-ignore
						.filter((item) => item.p === product?.id)
						// @ts-ignore
						.map((item, index) => {
							switch (parseInt(item.c)) {
								case 1:
									return null;
								case 2:
									return (
										<section
											key={index}
											className="descripcion text-white mt-6 mx-auto p-4 rounded"
											dangerouslySetInnerHTML={{ __html: product?.descripcion }}
										></section>
									);
								case 3:
									return (
										product?.video && (
											<section
												key={index}
												className="video w-full h-auto relative mt-6 mx-auto mb-8 p-4 rounded"
											>
												<video className="w-full h-full" controls>
													<source src={product.video} type="video/mp4" />
												</video>
											</section>
										)
									);
								case 4:
									return (
										product?.audio && (
											<section
												key={index}
												className="audio w-full h-auto p-4 rounded bg-gray-200"
											>
												<audio className="w-full" id="pista_audio" controls>
													<source src={product.audio} type="audio/mpeg" />
												</audio>
											</section>
										)
									);
								case 5:
									const shouldShowGallery = imageUrls.length > 0;
									const shouldShowCarousel = imageUrls.length > 1;

									return (
										shouldShowGallery && (
											<section key={index} className="galeria">
												<div className="w-full sm:w-[480px] md:w-[836px] h-[900px] relative mt-6 mx-auto mb-8">
													{shouldShowCarousel ? (
														<Carousel>
															{imageUrls.map((url, imgIndex) => (
																<div key={imgIndex} className="h-[900px]">
																	<Image
																		src={fixImageUrl(url)}
																		alt={`product image ${imgIndex}`}
																		className="w-full h-full object-cover"
																		fill
																	/>
																</div>
															))}
														</Carousel>
													) : (
														<Image
															src={fixImageUrl(imageUrls[0])}
															alt={`product image 0`}
															className="w-full h-full object-cover"
															fill
														/>
													)}
												</div>
											</section>
										)
									);
								case 6:
									return (
										<section
											key={index}
											className="contenido text-black mt-6  mx-auto p-4 rounded"
											dangerouslySetInnerHTML={{ __html: product?.contenido }}
										></section>
									);
								case 7:
									return (
										<section key={index} className="relacionado mt-6">
											<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
												{relatedProducts.map(
													(relatedProduct: any, relatedIndex: any) => (
														<div
															key={relatedIndex}
															className="flex justify-center"
														>
															<CardHome
																text={relatedProduct.titulo}
																imageCard={
																	fixImageUrl(relatedProduct.imagen_0) ||
																	fixImageUrl(relatedProduct.imagen_1) ||
																	fixImageUrl(relatedProduct.imagen_2) ||
																	fixImageUrl(relatedProduct.imagen_3) ||
																	fixImageUrl(relatedProduct.imagen_4) ||
																	fixImageUrl(relatedProduct.imagen_5) ||
																	fixImageUrl(relatedProduct.imagen_6) ||
																	fixImageUrl(relatedProduct.imagen_7) ||
																	fixImageUrl(relatedProduct.imagen_8) ||
																	fixImageUrl(relatedProduct.imagen_9) ||
																	fixImageUrl(relatedProduct.imagen_10) ||
																	fixImageUrl(relatedProduct.imagen) ||
																	fixImageUrl(relatedProduct.image)
																}
																onClick={() =>
																	handleCardClick(
																		relatedProduct.id_categoria,
																		relatedProduct.id
																	)
																}
															/>
														</div>
													)
												)}
											</div>
										</section>
									);
								default:
									return <p key={index}>Sin contenido</p>;
							}
						})}
				</div>
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
						icon: <BsCartCheck size={22} className="text-white" />,
						texto: "Productos",
					},
					{
						link: "/app/premium",
						icon: <AiOutlineTrophy size={22} className="text-white" />,
						texto: "Premium",
					},
				]}
			/>
		</>
	);
}
