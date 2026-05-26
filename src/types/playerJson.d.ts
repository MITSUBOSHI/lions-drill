import { PlayerType } from "@/types/Player";

// NOTE: rsolveJsonModuleがjsonl拡張子では動作しなかったため、やむを得ず拡張子を捻じ曲げることにした。
declare module "@/data/*-players.jsonl.json" {
  const data: PlayerType[];
  export default data;
}
