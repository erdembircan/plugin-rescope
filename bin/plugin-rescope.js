#!/usr/bin/env node
/* eslint-disable no-undef */

import { PluginRescope } from "../build/index.js";

const rescope = new PluginRescope(process.cwd());
rescope.rescope(process.argv.slice(2));
