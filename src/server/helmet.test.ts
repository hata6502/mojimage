import "../setup-test.js";

import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { describe, it } from "node:test";

import { helmet } from "./helmet.js";

describe("helmet", () => {
  it("セキュリティヘッダーが設定される", async (t) => {
    const req = new IncomingMessage(new Socket());
    const res = new ServerResponse(req);

    await new Promise<void>((resolve, reject) => {
      helmet(req, res, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    t.assert.snapshot(res.getHeaders());
  });
});
