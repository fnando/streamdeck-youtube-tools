import { Streamdeck } from "@rweich/streamdeck-ts";

const plugin = new Streamdeck().plugin();
let apiEndpoint = "";
let tid: NodeJS.Timer;

type Settings = {
  apiEndpoint: string;
};

type Elapsed = {
  hours: number;
  minutes: number;
  seconds: number;
};

type ElapsedKey = keyof Elapsed;

type Broadcast = {
  id: string;
  startedAt: string;
};

function elapsed(seconds: number) {
  const state: Elapsed = { hours: 0, minutes: 0, seconds };

  if (state.seconds >= 60) {
    state.minutes = Math.floor(state.seconds / 60);
    state.seconds = state.seconds - state.minutes * 60;
  }

  if (state.minutes >= 60) {
    state.hours = Math.floor(state.minutes / 60);
    state.minutes = state.minutes - state.hours * 60;
  }

  if (state.hours === 0 && state.minutes === 0) {
    return `${Math.floor(state.seconds)}s`;
  }

  return Object.keys(state)
    .slice(0, 2)
    .map(
      (key) =>
        state[key as ElapsedKey] > 0 && state[key as ElapsedKey] + key[0],
    )
    .filter(Boolean)
    .join(" ");
}

plugin.on("willAppear", ({ context }) => {
  plugin.getSettings(context);
});

plugin.on("keyDown", ({ context }) => {
  plugin.getSettings(context);
});

plugin.on("didReceiveSettings", ({ context, settings }) => {
  console.log("got settings", { settings, context });

  apiEndpoint = (settings as Settings).apiEndpoint ?? "";

  refresh(context);
});

async function fetchBroadcasts(): Promise<Broadcast[]> {
  const endpoint = `${apiEndpoint}/broadcasts?status=active&_key=camelcase`;

  const response = await fetch(endpoint);
  const broadcasts = await response.json();

  return broadcasts;
}

async function refresh(context: string) {
  clearInterval(tid);

  if (!apiEndpoint) {
    plugin.setTitle("Need\nSetup", context);
    return;
  }

  plugin.setTitle("Loading\n", context);

  const broadcasts: Broadcast[] = await fetchBroadcasts();

  if (broadcasts.length === 0) {
    plugin.setTitle("Offline\n", context);
    return;
  }

  const startedAt = Date.parse(broadcasts[0].startedAt);

  tid = setInterval(() => {
    const now = Date.now();
    const seconds = (now - startedAt) / 1000;

    plugin.setTitle(elapsed(seconds) + "\n", context);
  }, 500);
}

export default plugin;
