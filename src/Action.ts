import { Plugin } from "@rweich/streamdeck-ts";
import { Settings } from "./Settings";

export type ActionParams = {
  settings: Settings;
  context: string;
  plugin: Plugin;
  event: string;
};

export type Action = {
  prepare: (params: ActionParams) => void;
  run: (params: ActionParams) => void;
};
