import { useMemo, useReducer } from "react";

type Actions =
  | {
      type: "set_difficulty";
      payload: number;
    }
  | { type: "reveal_board" }
  | { type: "begin_play" }
  | { type: "reset_board" }
  | {
      type: "click_square";
      payload: number;
    };

type State = {
  difficulty: number;
  gameState: "idle" | "revealing" | "playing" | "celebrating";
  guesses: ("unclicked" | "correct" | "wrong")[];
  key: ("x" | "o")[];
};

function range(length: number) {
  const range = [];
  for (let i = 0; i < length; i++) range.push(i);
  return range;
}

function newBoard(difficulty: number) {
  const length = 25;
  if (difficulty < 1) throw Error("Must hide at least 1 card");
  if (difficulty >= length / 2)
    throw Error("At most only half the cards can be secret");

  const secrets = new Set();
  for (let secret = 0; secret < difficulty; ) {
    const index = Math.floor(Math.random() * length);
    if (!secrets.has(index)) {
      secrets.add(index);
      secret++;
    }
  }

  const board: ("x" | "o")[] = [];
  for (let i = 0; i < length; i++) {
    board[i] = secrets.has(i) ? "x" : "o";
  }

  return board;
}

const initialState: State = {
  difficulty: 5,
  gameState: "idle",
  guesses: range(25).map(() => "unclicked"),
  key: newBoard(5)
};

function boardReducer(state: State, action: Actions): State {
  switch (action.type) {
    case "set_difficulty":
      return { ...state, difficulty: action.payload };
    case "reveal_board":
      return { ...state, gameState: "revealing" };
    case "begin_play":
      return { ...state, gameState: "playing" };
    case "click_square": {
      if (state.gameState !== "playing") return state;
      const click = action.payload;
      const guesses = [...state.guesses];
      guesses[click] = state.key[click] === "x" ? "correct" : "wrong";
      if (
        guesses.filter((value) => value === "correct").length ===
        state.difficulty
      ) {
        return { ...state, guesses, gameState: "celebrating" };
      } else {
        return { ...state, guesses };
      }
    }
    case "reset_board":
      return {
        difficulty: state.difficulty,
        gameState: "idle",
        guesses: range(25).map(() => "unclicked"),
        key: newBoard(state.difficulty)
      };
  }

  return state;
}

export default function useGameMechanics() {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  const dispatcher = useMemo(
    () => ({
      reset_board: () => dispatch({ type: "reset_board" }),
      begin_play: async () => {
        dispatch({ type: "reveal_board" });
        setTimeout(() => dispatch({ type: "begin_play" }), 1000);
      },
      set_difficulty: (payload: number) =>
        dispatch({ type: "set_difficulty", payload }),
      click_square: (payload: number) =>
        dispatch({ type: "click_square", payload })
    }),
    [dispatch]
  );

  return [state, dispatcher] as const;
}
