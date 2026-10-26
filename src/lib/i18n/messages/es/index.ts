import type { Messages } from "../types";
import { auth } from "./auth";
import { browse } from "./browse";
import { common } from "./common";
import { deckOptions } from "./deckOptions";
import { decks } from "./decks";
import { discover } from "./discover";
import { exporter } from "./exporter";
import { importer } from "./importer";
import { landing } from "./landing";
import { meta } from "./meta";
import { nav } from "./nav";
import { notes } from "./notes";
import { offline } from "./offline";
import { pwa } from "./pwa";
import { settings } from "./settings";
import { stats } from "./stats";
import { study } from "./study";
import { time } from "./time";
import { validation } from "./validation";

export const es: Messages = {
  auth,
  browse,
  common,
  deckOptions,
  decks,
  discover,
  exporter,
  importer,
  landing,
  meta,
  nav,
  notes,
  offline,
  pwa,
  settings,
  stats,
  study,
  time,
  validation,
};
