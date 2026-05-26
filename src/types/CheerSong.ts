export type SongCategory =
  | "right_pitcher"
  | "left_pitcher"
  | "foreign_pitcher"
  | "individual_batter"
  | "pinch_hitter"
  | "catcher"
  | "right_batter"
  | "left_batter"
  | "manager"
  | "anthem"
  | "chance";

export type ApplicablePlayer = {
  name: string;
  callName: string;
  number: string;
};

export type YouTubeUrl =
  | `https://www.youtube.com/watch?v=${string}`
  | `https://www.youtube.com/shorts/${string}`
  | `https://youtu.be/${string}`;

export type CheerSongType = {
  id: string;
  title: string;
  category: SongCategory;
  year?: number;
  lyrics: string[];
  playerName?: string;
  playerNameKana?: string;
  playerNumber?: string;
  namePlaceholder?: string;
  applicablePlayers?: ApplicablePlayer[];
  url?: YouTubeUrl;
  isCommon: boolean;
};
