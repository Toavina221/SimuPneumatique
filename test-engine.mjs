// Test isolé du moteur de simulation PneumaSim
import { readFileSync } from "fs";
import tsx from "tsx/esm/api";
void tsx;

// On charge les modules TS directement via tsx register
import("./client/src/lib/pneusim/test-runner.ts");
