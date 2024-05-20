"use client"

import Image from "next/image"
import { useState, useEffect, useMemo } from "react";
import {RoundButton} from "../../../components/buttons/RoundButton"
import {useJuegoTrucoDataContext} from "@/app/context/truco/JuegoTrucoProvider";
import "@/app/globals.css"

const tiltClasses = [
  'origin-bottom-right -rotate-[10deg]',
  '',
  'origin-bottom-left rotate-[10deg]'
]

function Page () {

    const {infoJuegoTruco, catchActions, catchParam } = useJuegoTrucoDataContext();

   

    function fixImageUrl(url: string) {
        if (url.startsWith("//")) {
          return `https:${url}`;
        }
        return url;
      }

      const gameActions = useMemo(() => {
        return infoJuegoTruco?.acciones?.filter((buttonAction) => !(buttonAction.val === "abandono" || buttonAction.val === "irme")) || [];
      }, [infoJuegoTruco]);

      const leaveActions = useMemo(() => {
        return infoJuegoTruco?.acciones?.filter((buttonAction) => buttonAction.val === "abandono" || buttonAction.val === "irme") || [];
      }, [infoJuegoTruco])
      if (!infoJuegoTruco || !infoJuegoTruco.reverso) return null;


      const ChatComponent = ({ infoJuegoTruco }) => {
        const [lastMessage, setLastMessage] = useState(null);
      
        useEffect(() => {
          if (infoJuegoTruco && infoJuegoTruco.chat) {
            const latestMessage = infoJuegoTruco.chat.slice(-1)[0];
            setLastMessage(latestMessage);
          }
        }, [infoJuegoTruco]); }


    return (
      <div className="flex flex-col lg:flex-row gap-5 pt-20 pb-5 w-screen h-screen overflow-hidden p-6">
        <div className="hidden lg:block lg:w-[200px] xl:w-[300px] flex flex-col gap-5">
          <div className="flex justify-start items-center flex-col gap-5 ">
            {gameActions.map((actionButton) => (
                 actionButton.val !== "tirar" && (
                  <RoundButton
                    key={actionButton.val}
                    buttonClassName="bg-blueEmmagini h-[32px] rounded-[11px] w-full"
                    text={actionButton.txt}
                    textClassName="text-white"
                    onClick={() => catchActions(actionButton.val)}
                      />
                    )
            ))}
          </div>

          <div className="flex-1 flex justify-end items-center flex-col gap-5">
            {leaveActions.map((actionButton) => (
                <RoundButton
                  buttonClassName="bg-red h-[32px] rounded-[11px] w-full"
                  text={actionButton.txt}
                  textClassName="text-white"
                  onClick={() => catchActions(actionButton.val)}
                />
            ))}
          </div>
        </div>

        <div className="flex-1 rounded-[11px] overflow-hidden p-5 relative w-full h-full fondo" style={{
          backgroundImage: `url(${infoJuegoTruco.tablero})`,
        }}>
          <div className="flex flex-col gap-2 flex-1 w-full h-full">
            <div className="w-full flex flex-row justify-center items-center">
              <Image src={fixImageUrl(infoJuegoTruco.reverso)} width={106} height={0} className={`w-[54px] h-[72px] md:w-[100px] md:h-[130px] lg:w-[106px] lg:h-[150px] ${tiltClasses[0]}`} alt="dorso1"/>
              <Image src={fixImageUrl(infoJuegoTruco.reverso)} width={106} height={0} className={`w-[54px] h-[72px] md:w-[100px] md:h-[130px] lg:w-[106px] lg:h-[150px] ${tiltClasses[1]}`} alt="dorso2"/>
              <Image src={fixImageUrl(infoJuegoTruco.reverso)} width={106} height={0} className={`w-[54px] h-[72px] md:w-[100px] md:h-[130px] lg:w-[106px] lg:h-[150px] ${tiltClasses[2]}`} alt="dorso3"/>
            </div>

            <div className="flex-1 flex flex-row justify-center items-center gap-5">
              {infoJuegoTruco && infoJuegoTruco.mesa && infoJuegoTruco.mesa.map((naipe) => (
                <Image src={fixImageUrl(naipe.imagen)} width={90} height={108} className="w-[54px] h-[72px] md:w-[100px] md:h-[130px] lg:w-[106px] lg:h-[150px] ml-4" alt="naipe" key={naipe.id}/>
              ))}
            </div>

            <div className="w-full flex flex-row justify-center items-center">
              {infoJuegoTruco && infoJuegoTruco.mis_cartas && infoJuegoTruco.mis_cartas.map((naipe, i) => (
                <button onClick={() => catchParam("tirar",naipe.id_naipe)}>
                  <Image src={fixImageUrl(naipe.imagen)} width={106} height={208} className={`w-[54px] h-[72px] md:w-[100px] md:h-[130px] lg:w-[106px] lg:h-[150px] ${tiltClasses[i]}`} alt="naipe" key={naipe.id}/>
                </button>
              ))}
            </div>
          </div>
        </div>

      <div className="w-full lg:w-[200px] xl:w-[300px] lg:col-span-3 flex flex-col gap-5">
        <div className="h-[39px] lg:w-full lg:min-h-[420px] lg:max-h-full flex flex-col items-center justify-center bg-zinc-300 rounded-[20px] p-2"> 
          {infoJuegoTruco && infoJuegoTruco.chat && infoJuegoTruco.chat.map((text) => {
            if (text.jugador === "system") {
              return null; 
            }
            
            const messageClass = text.jugador === "Yo" ? "text-black font-bold" : "text-black font-normal";

            return (
              <p key={text.id} className={`text-base ${messageClass}`}>
                {text.jugador === "Yo" ? "Yo: " : `${text.jugador}: `}{text.mensaje}
              </p>
            );
          })}
          
        </div>
      </div>

      <div className="lg:hidden w-full grid grid-cols-3 gap-2 min-h-[39px]">
        {gameActions.map((actionButton) => (
            actionButton.val !== "tirar" && (
                <RoundButton
                  key={actionButton.val}
                  buttonClassName="bg-blueEmmagini h-[36px] rounded-[11px] w-full"
                  text={actionButton.txt}
                  textClassName="text-white text-xs"
                  onClick={() => catchActions(actionButton.val)}
                />
              )
            )
          )
        }

        {leaveActions.map((actionButton) => (
              <RoundButton
                buttonClassName="bg-red h-[36px] rounded-[11px] w-full"
                text={actionButton.txt}
                textClassName="text-white text-xs"
                onClick={() => catchActions(actionButton.val)}
              />
            )
          )
        }
      </div>
    </div>
    
    )
} 

export default Page;