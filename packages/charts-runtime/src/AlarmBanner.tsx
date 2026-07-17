"use client";

import type { ReactElement } from "react";
import { AlertPanel } from "@axicharts/charts";
import type { AlarmItem } from "./types";

export type AlarmBannerProps = {
  alarms: AlarmItem[];
  surface?: "dark" | "light";
  onAck?: (id: string) => void;
  onShelve?: (id: string) => void;
};

export function AlarmBanner({
  alarms,
  surface = "light",
  onAck,
  onShelve,
}: AlarmBannerProps): ReactElement | null {
  return (
    <AlertPanel
      alarms={alarms}
      surface={surface}
      onAck={onAck}
      onShelve={onShelve}
      style={{ marginTop: 12 }}
    />
  );
}
