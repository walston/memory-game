import useGameMechanics from "./useGameMechanics";
import "./styles.css";

export default function App() {
  const [state, dispatch] = useGameMechanics();

  return (
    <div className="App">
      <form>
        <label htmlFor="difficulty-slider">
          Difficulty:{" "}
          <code>
            {state.difficulty < 10 ? "0" + state.difficulty : state.difficulty}
          </code>
        </label>
        <input
          disabled={state.gameState === "playing"}
          id="difficulty-slider"
          type="range"
          min={1}
          max={25}
          value={state.difficulty}
          onChange={(e) =>
            dispatch.set_difficulty(parseInt(e.target.value, 10))
          }
        />
      </form>
      <div className="board">
        {state.gameState === "revealing"
          ? state.key.map((value) => {
              switch (value) {
                case "x":
                  return <div className="card" />;
                case "o":
                default:
                  return <div className="unclicked" />;
              }
            })
          : state.guesses.map((value, i) => {
              switch (value) {
                case "correct":
                  return <div className="correct" />;
                case "wrong":
                  return <div className="wrong" />;
                case "unclicked":
                default:
                  return (
                    <div
                      className="unclicked"
                      onClick={() => dispatch.click_square(i)}
                    />
                  );
              }
            })}
      </div>
      {state.gameState === "idle" && (
        <div className="cover" onClick={() => dispatch.begin_play()}>
          Play
        </div>
      )}
      {state.gameState === "celebrating" && (
        <div className="cover" onClick={() => dispatch.reset_board()}>
          Congrats!
        </div>
      )}
    </div>
  );
}
