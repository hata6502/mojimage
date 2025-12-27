import type { FunctionComponent } from "react";

import { createApp } from "./app.js";

const App: FunctionComponent = () => {
  return (
    <img src="https://storage.googleapis.com/image-mojimage-development/695014bdf34a3c2402f76daf.jpg" />
  );
};

await createApp(<App />);
