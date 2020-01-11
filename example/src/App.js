import React from "react";

import { usePromiseManager } from "use-promise-manager";

const fetchStuff = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: "stuff" });
    }, 2000);
  });
};

const App = () => {
  const [state, manage] = usePromiseManager();
  const [stuff, setStuff] = React.useState("");
  React.useState(() => {
    manage(fetchStuff()).then(result => setStuff(result.data));
  }, []);

  return <div>{state.isResolving ? "isLoading" : stuff}</div>;
};
export default App;
