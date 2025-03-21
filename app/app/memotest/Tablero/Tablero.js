import { useDataContext } from "@/app/context/GameDataProvider";
import MemoBlock from "../MemoBlock/MemoBlock";
import "./Tablero.css";

const Board = ({ animating, handleMemoClick, memoBlocks, cover }) => {
	const { data } = useDataContext();
	return (
		<main className="board">
			{memoBlocks.map((memoBlock, i) => {
				return (
					<MemoBlock
						key={`${i}_${memoBlock.emoji}`}
						animating={animating}
						handleMemoClick={handleMemoClick}
						memoBlock={memoBlock}
						cover={cover}
					/>
				);
			})}
		</main>
	);
};

export default Board;
