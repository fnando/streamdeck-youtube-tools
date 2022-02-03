import { Action } from "../Action";
import { Settings } from "../Settings";
import { elapsed } from "../helpers/elapsed";

enum State {
  loading = 0,
  offline = 1,
  ready = 2,
  setup = 3,
}

type Broadcast = {
  id: string;
  startedAt: string;
};

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

    plugin.setTitle("", context, { state: State.loading });
  },

  async run({ context, plugin, settings }) {
    console.log("[stream-duration:run]", { context, settings });

    clearInterval(tid[context]);

    if (!settings.apiEndpoint) {
      plugin.setTitle("", context, { state: State.setup });
      return;
    }

    plugin.setTitle("", context, { state: State.loading });

    const broadcasts: Broadcast[] = await fetchBroadcasts(settings);

    if (broadcasts.length === 0) {
      plugin.setTitle("", context, { state: State.offline });
      return;
    }

    const startedAt = Date.parse(broadcasts[0].startedAt);

    tid[context] = setInterval(() => {
      const now = Date.now();
      const seconds = (now - startedAt) / 1000;

      plugin.setTitle(elapsed(seconds) + "\n", context, { state: State.ready });
    }, 500);
  },
};
