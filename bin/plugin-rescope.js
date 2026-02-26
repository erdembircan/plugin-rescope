#!/usr/bin/env node
import { PluginRescope } from "../build/index.js";

const rescope = new PluginRescope(process.cwd());
rescope.rescope(process.argv.slice(2));
