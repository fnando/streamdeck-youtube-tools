import { Action } from "../Action";
import { Settings } from "../Settings";
import { i18n } from "../config/i18n";
import images from "../images.json";

enum State {
  loading = 0,
  ready = 1,
  setup = 2,
}

type Channel = {
  subscriberCount: number;
};

let tid: { [key: string]: NodeJS.Timer } = {};

export async function fetchChannel(settings: Settings): Promise<Channel> {
  const endpoint = settings.apiEndpoint.replace(/\/$/, "");
  const url = `${endpoint}/channel?_key=camelcase`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${settings.apiKey}` },
  });
  const channel = await response.json();

  return channel;
}

export const subscribersAction: Action = {
  prepare({ context, plugin }) {
    console.log("[subscribers:prepare]", { context });

    plugin.setTitle(" ", context);
    plugin.setImage(images.loading, context);
  },

  run({ context, plugin, settings }) {
    console.log("[subscribers:run]", { context, settings });

    clearInterval(tid[context]);

    if (!settings.apiEndpoint) {
      plugin.setTitle("", context);
      plugin.setImage(images.setup, context);
      return;
    }

    const update = async () => {
      plugin.setTitle("", context);
      plugin.setImage(images.loading, context);

      const channel: Channel = await fetchChannel(settings);
      console.log("[subscribers:channel]", channel);

      plugin.setImage(images.subscribersReady, context);
      plugin.setTitle(
        i18n.numberToHuman(channel.subscriberCount, {
          format: "%n%u",
          units: {
            million: "M",
            thousand: "K",
            unit: "",
          },
        }) + "\n",
        context,
      );
    };

    tid[context] = setInterval(update, 10 * 60 * 1000);
    update();
  },
};
