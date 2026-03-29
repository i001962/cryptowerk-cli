import { Command, flags } from "@oclif/command";
var cwapi = require("../cwapiregister.js");
import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, "../../.env") });

export default class Register extends Command {
  static description = `Register hash(es) to several blockchains and obtain retrievalIDs.
Use the retrieve command to poll for the seal, then verify to confirm the proof.`;

  static flags = {
    help: flags.help({ char: "h" }),
    hash: flags.string({
      char: "H",
      description:
        "SHA256 hash to register. For multiple hashes, separate with commas (no spaces).",
      required: true
    }),
    json: flags.boolean({
      description: "Output result as JSON (machine-readable).",
      default: false
    })
  };

  async run() {
    const { flags: parsedFlags } = this.parse(Register);
    const hashValue = parsedFlags.hash as string;

    if (!parsedFlags.json) {
      this.log(`Registering hash: ${hashValue}`);
    }

    try {
      const retval = await cwapi.register(
        hashValue,
        process.env.APIKEYS,
        process.env.ENDPOINT
      );
      if (parsedFlags.json) {
        this.log(JSON.stringify({ hash: hashValue, documents: retval }));
      } else {
        this.log("Registration result: " + JSON.stringify(retval, null, 2));
      }
    } catch (err) {
      this.error("Registration failed: " + err);
    }
  }
}
