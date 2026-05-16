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
  value: number;
}

export type PauseAction = "resume" | "restart" | "quit" | null;
export type WonAction   = "next"   | "restart" | "quit" | null;
