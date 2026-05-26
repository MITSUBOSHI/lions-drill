import { Role } from "@/types/Player";

export const registeredYears = [
  2020, 2021, 2022, 2023, 2024, 2025, 2026,
] as const;
export const NameByRole: Record<Role, string> = {
  [Role.Coach]: "監督・コーチ",
  [Role.Roster]: "支配下登録",
  [Role.Training]: "育成枠",
};
