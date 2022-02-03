import { Streamdeck } from "@rweich/streamdeck-ts";
import { Settings } from "./Settings";

const pi = new Streamdeck().propertyinspector();

pi.on("didReceiveGlobalSettings", ({ settings }) => {
  console.log("got settings", settings);
  const pluginId = pi.pluginUUID ?? "";

  if (!pluginId) {
    console.log("pi has no uuid! is it registered already?");
    return;
  }

  document.querySelectorAll<HTMLElement>("[data-url]").forEach((node) => {
    node.onclick = () => {
      if (node.dataset.url) {
        pi.openUrl(node.dataset.url);
      }
    };
  });

  const button = document.querySelector<HTMLButtonElement>("#save")!;
  const endpointInput =
    document.querySelector<HTMLInputElement>("#apiEndpoint")!;
  const apiKeyInput = document.querySelector<HTMLInputElement>("#apiKey")!;

  button.disabled = false;

  button.onclick = () => {
    const payload: Settings = {
      apiEndpoint: endpointInput.value ?? "",
      apiKey: apiKeyInput.value,
    };
    pi.setGlobalSettings(pluginId, payload);
  };

  endpointInput.value = (settings as Settings).apiEndpoint ?? "";
  apiKeyInput.value = (settings as Settings).apiKey ?? "";
});

pi.on("websocketOpen", ({ uuid }) => {
  pi.getGlobalSettings(uuid);
});

export default pi;
