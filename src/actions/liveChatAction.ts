import { Action } from "../Action";
import { Settings } from "../Settings";
import { Broadcast } from "../Broadcast";

enum State {
  loading = 0,
  offline = 1,
  ready = 2,
  setup = 3,
}

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

export const liveChatAction: Action = {
  prepare({ context, plugin }) {
    console.log("[live-chat:prepare]", { context });

    plugin.setTitle("", context, { state: State.loading });
  },

  async run({ context, plugin, settings, event }) {
    console.log("[live-chat:run]", { context, settings });

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

    const id = broadcasts[0].id;
    plugin.setTitle("", context, { state: State.ready });

    if (event === "keyDown") {
      plugin.openUrl(`${settings.apiEndpoint}/open-chat?id=${id}`);
    }
  },
};
