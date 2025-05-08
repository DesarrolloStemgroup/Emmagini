import { useEffect, useState } from "react";
import Image from "next/image";

interface ModalAyudaProps {
	text?: string;
	onClick?: () => void;
	isOpen: boolean;
	textButton: string;
	image: string;

	idJuego: string;
}

const ModalAyuda = ({
	text,
	onClick,
	isOpen,
	textButton,
	image,
	idJuego,
}: ModalAyudaProps) => {
	const [showModal, setShowModal] = useState(isOpen);

	useEffect(() => {
		const hideModalForGame = localStorage.getItem(`hideModal_${idJuego}`);
		if (hideModalForGame === "true") {
			setShowModal(false);
		}
	}, [idJuego]);

	const handlePlayClick = () => {
		setShowModal(false);
		if (onClick) {
			onClick();
		}
	};

	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const isChecked = event.target.checked;

		localStorage.setItem(`hideModal_${idJuego}`, isChecked.toString());
	};

	if (!showModal) {
		return null;
	}

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-lg bg-opacity-50 bg-gray-400">
			<div className="bg-white w-full max-w-[482px] h-auto mx-6 sm:mx-[24px] p-3 sm:p-6 flex items-center flex-col relative rounded-lg">
				<div className="bg-gradient-to-r from-[#f70aff] to-[#430df5] border-[12px] border-white w-[160px] h-[160px] rounded-full absolute -top-[15%] flex items-center justify-center">
					<div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-[176px] h-[239px]">
						<Image
							src={image}
							className="w-full h-full object-cover rounded-lg"
							alt="imagen ayuda del juego"
							style={{ objectFit: "cover" }}
							width={176}
							height={239}
						/>
					</div>
				</div>
				<h1 className="text-center font-bold mb-4 mt-[200px] text-[#430df5] text-3xl">
					Reglas del juego
				</h1>
				<p className="text-center text-sm sm:text-base mb-6">{text}</p>
				<div className="flex items-center mb-2">
					<input
						type="checkbox"
						id="terms"
						className="mr-2"
						onChange={handleCheckboxChange}
					/>
					<label htmlFor="terms" className="text-black">
						No volver a mostrar
					</label>
				</div>
				<button
					className="bg-[#430df5] w-full h-[44px] text-white text-center rounded-[32px]"
					onClick={handlePlayClick}
				>
					{textButton}
				</button>
			</div>
		</div>
	);
};

export default ModalAyuda;
