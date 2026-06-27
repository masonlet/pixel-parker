import type { MenuLayout, ButtonEntry, SliderEntry } from "@starweb-libs/ui/types.js";

export interface PauseMenuState extends MenuLayout {
  resume:  ButtonEntry;
  restart: ButtonEntry;
  quit:    ButtonEntry;
  action:  PauseAction;
}

export interface FailedMenuState extends MenuLayout {
  restart: ButtonEntry;
  quit:    ButtonEntry;
  action:  FailedAction;
}

export interface TitleMenuState extends MenuLayout {
  start:    ButtonEntry;
  settings: ButtonEntry;
}

export interface CompleteMenuState extends MenuLayout {
  restart: ButtonEntry;
  next:    ButtonEntry | null;
  quit:    ButtonEntry;
  action:  CompleteAction;
}

export interface SettingsMenuState extends MenuLayout {
  mute:  ButtonEntry;
  back:  ButtonEntry;
  vol:   SliderEntry;
  muted: boolean;
}

export interface LevelSelectState extends MenuLayout {
  levels:       ButtonEntry[];
  back:         ButtonEntry;
  clickedIndex: number | null;
}

export type PauseAction    = "resume" | "restart" | "quit" | null;
export type CompleteAction = "next"   | "restart" | "quit" | null;
export type FailedAction   =            "restart" | "quit" | null;
