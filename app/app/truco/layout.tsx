//import { SeriesTrucoProvider } from "@/app/context/truco/SeriesTrucoProvider";
//import { JuegoTrucoProvider } from "@/app/context/truco/JuegoTrucoProvider";
//import { PartidasTrucoProvider } from "@/app/context/truco/PartidasTrucoProvider";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		/*
      <SeriesTrucoProvider>
        <PartidasTrucoProvider>
        <JuegoTrucoProvider>
        {children}
        </JuegoTrucoProvider>
        </PartidasTrucoProvider>
      </SeriesTrucoProvider>*/
		<p className="mt-20 text-black">
			page en construccion. Disculpe las molestias
		</p>
	);
}
