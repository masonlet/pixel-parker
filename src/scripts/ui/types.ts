export interface UIRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Button extends UIRect {
  label: string;
}

export interface Slider extends UIRect {
  label: string;
}

export interface ButtonState {
  hovered: boolean;
  clicked: boolean;
}

export interface SliderState {
  dragging: boolean;
  value:    number;
}

export interface ButtonEntry {
  btn:   Button;
  state: ButtonState;
}

export interface PauseMenuState {
  resume:  ButtonEntry;
  restart: ButtonEntry;
  quit:    ButtonEntry;
  action:  PauseAction;
}

export interface TitleMenuState {
  start:    ButtonEntry;
  settings: ButtonEntry;
}

export interface WonMenuState {
  restart: ButtonEntry;
  next:    ButtonEntry | null;
  quit:    ButtonEntry;
  action:  WonAction;
}

export interface SettingsMenuState {
  mute:  ButtonEntry;
  back:  ButtonEntry;
  vol:   SliderState;
  muted: boolean;
}

export interface LevelSelectState {
  levels:       ButtonEntry[];
  back:         ButtonEntry;
  clickedIndex: number | null;
}

export type PauseAction = "resume" | "restart" | "quit" | null;
export type WonAction   = "next"   | "restart" | "quit" | null;
