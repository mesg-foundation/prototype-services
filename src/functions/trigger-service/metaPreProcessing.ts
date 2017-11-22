import { createContext, runInContext } from "vm";

const newRequire = (path) => {
  if (path.startsWith(".")) {
    throw new Error(`You cannot require the package ${path}`);
  }
  require(path);
};

export default async (func, event) => {
  if (!func) { return Promise.resolve(event.meta); }
  const res = await runInContext(func, createContext({
    module,
    require: newRequire,
  }))(event);
  return {
    ...event.meta,
    ...res,
  };
};
