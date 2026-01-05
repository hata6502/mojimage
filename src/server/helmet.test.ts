import "../setup-test.js";

import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { describe, it } from "node:test";

import { helmet } from "./helmet.js";

describe("helmet", () => {
  for (const args of [
    { corp: "same-origin", embed: false },
    { corp: "cross-origin", embed: false },
    { corp: "same-origin", embed: true },
  ] as const) {
    it(JSON.stringify(args), async (t) => {
      const req = new IncomingMessage(new Socket());
      const res = new ServerResponse(req);

      await new Promise<void>((resolve, reject) => {
        helmet(args)(req, res, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });

      t.assert.snapshot(res.getHeaders());
    });
  }
});
