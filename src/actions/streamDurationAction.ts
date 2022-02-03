import { Action } from "../Action";
import { Broadcast } from "../Broadcast";
import { Settings } from "../Settings";
import { elapsed } from "../helpers/elapsed";
import images from "../images.json";

enum State {
  loading = 0,
  offline = 1,
  ready = 2,
  setup = 3,
}

let tid: { [key: string]: NodeJS.Timer } = {};

export async function fetchBroadcasts(
  settings: Settings,
): Promise<Broadcast[]> {
  const endpoint = settings.apiEndpoint.replace(/\/$/, "");
  const url = `${endpoint}/broadcasts?status=active&_key=camelcase`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${settings.apiKey}` },
  });
  const broadcasts = await response.json();

  return broadcasts;
}

export const streamDurationAction: Action = {
  prepare({ context, plugin }) {
    console.log("[stream-duration:prepare]", { context });

    plugin.setTitle("", context);
    plugin.setImage(images.loading, context);
  },

  async run({ context, plugin, settings }) {
    console.log("[stream-duration:run]", { context, settings });

    clearInterval(tid[context]);

    if (!settings.apiEndpoint) {
      plugin.setTitle("", context);
      plugin.setImage(images.setup, context);
      return;
    }

    plugin.setTitle("", context, { state: State.loading });

    const broadcasts: Broadcast[] = await fetchBroadcasts(settings);

    if (broadcasts.length === 0) {
      plugin.setTitle("", context);
      plugin.setImage(images.streamOffline, context);
      return;
    }

    const startedAt = Date.parse(broadcasts[0].startedAt);

    tid[context] = setInterval(() => {
      const now = Date.now();
      const seconds = (now - startedAt) / 1000;

      plugin.setTitle(elapsed(seconds) + "\n", context);
      plugin.setImage(images.streamReady, context);
    }, 500);
  },
};
