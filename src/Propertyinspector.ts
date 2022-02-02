import { Streamdeck } from "@rweich/streamdeck-ts";
import manifest from "../assets/manifest.json";

type Settings = {
  apiEndpoint: string;
};

const pi = new Streamdeck().propertyinspector();

pi.on("didReceiveSettings", ({ settings }) => {
  console.log("got settings", settings);
  const pluginId = pi.pluginUUID ?? "";

  if (!pluginId) {
    console.log("pi has no uuid! is it registered already?");
    return;
  }

  const button = document.querySelector<HTMLButtonElement>("#save")!;
  const input = document.querySelector<HTMLInputElement>("#apiEndpoint")!;

  button.disabled = false;

  button.onclick = () => {
    const payload: Settings = { apiEndpoint: input.value ?? "" };
    pi.setSettings(pluginId, payload);
  };

  input.value = (settings as Settings).apiEndpoint ?? "";
});

pi.on("websocketOpen", ({ uuid }) => {
  pi.getSettings(uuid);
});

export default pi;
