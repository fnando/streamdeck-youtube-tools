import { Streamdeck } from "@rweich/streamdeck-ts";
import { Settings } from "./Settings";
import { Action } from "./Action";
import { streamDurationAction } from "./actions/streamDurationAction";
import { liveChatAction } from "./actions/liveChatAction";
import { subscribersAction } from "./actions/subscribersAction";

let didSettingsLoad = false;
const plugin = new Streamdeck().plugin();
let settings: Settings = { apiEndpoint: "", apiKey: "" };

function loadSettings(context: string, actionId: string, event: string) {
  didSettingsLoad = false;

  const action = getAction(actionId);

  action.prepare({ context, settings, plugin, event });

  plugin.getGlobalSettings(plugin.pluginUUID!);

  const timer = () => {
    setTimeout(() => {
      if (didSettingsLoad) {
        action.run({ context, settings, plugin, event });
      } else {
        timer();
      }
    }, 100);
  };

  timer();
}

plugin.on("willAppear", ({ context, action }) => {
  loadSettings(context, action, "willAppear");
});

plugin.on("keyDown", ({ context, action }) => {
  loadSettings(context, action, "keyDown");
});

plugin.on("didReceiveGlobalSettings", ({ settings: rawSettings }) => {
  settings = {
    apiEndpoint: (rawSettings as Settings).apiEndpoint ?? "",
    apiKey: (rawSettings as Settings).apiKey ?? "",
  };

  console.log("did receive settings", { settings });
  didSettingsLoad = true;
});

function getAction(actionId: string): Action {
  const name: string = actionId.split(".").pop() ?? "";

  if (name === "stream-duration") {
    return streamDurationAction;
  }

  if (name === "subscribers") {
    return subscribersAction;
  }

  if (name === "live-chat") {
    return liveChatAction;
  }

  throw new Error(`No action found for ${name} (${actionId})`);
}

export default plugin;
