import { registeredYears } from "@/constants/player";

export type Year = (typeof registeredYears)[number];
export enum Role {
  Coach = "coach",
  Roster = "roster",
  Training = "training",
}
export type PlayerType = {
  year: Year;
  name: string;
  name_kana: string;
  uniform_name: string;
  number_calc: number;
  number_disp: string;
  role: Role;
  url: string;
  date_of_birth: string;
  height_cm: number | null;
  weight_kg: number | null;
};
