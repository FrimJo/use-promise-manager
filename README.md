# use-promise-manager

>

[![NPM](https://img.shields.io/npm/v/use-promise-manager.svg)](https://www.npmjs.com/package/use-promise-manager) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save use-promise-manager
```

## Usage

```tsx
import * as React from "react";

import { usePromiseManager } from "use-promise-manager";
import { fetchStuff } from "fetchStuff";

const Example = () => {
  const [state, manage] = usePromiseManager();
  const [stuff, setStuff] = React.useState("");
  React.useState(() => {
    manage(fetchStuff()).then(result => setStuff(result.data));
  }, []);

  return <div>{state.isResolving ? "isLoading" : stuff}</div>;
};
```

## License

MIT © [FrimJo](https://github.com/FrimJo)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).
