import { Action } from "../Action";
import { Settings } from "../Settings";

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

  const response = await fetch(url);
  const channel = await response.json();

  return channel;
}

export const subscribersAction: Action = {
  prepare({ context, plugin }) {
    console.log("[subscribers:prepare]", { context });

    plugin.setTitle(" ", context, { state: State.loading });
  },

  run({ context, plugin, settings }) {
    console.log("[subscribers:run]", { context, settings });

    clearInterval(tid[context]);

    if (!settings.apiEndpoint) {
      plugin.setTitle(" ", context, { state: State.setup });
      return;
    }

    const update = async () => {
      const channel: Channel = await fetchChannel(settings);
      console.log({ channel });

      plugin.setTitle(String(channel.subscriberCount) + "\n", context, {
        state: State.ready,
      });
    };

    plugin.setTitle(" ", context, { state: State.loading });
    tid[context] = setInterval(update, 10 * 60 * 1000);
    update();
  },
};
