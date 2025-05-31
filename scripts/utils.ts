import fs from "fs-extra";

export function fetchTargets(): string[] {
  const json = fs.readJSONSync("angular.json");
  const { projects } = json;
  const keys = Object.keys(projects);
  return keys;
}

// function fetchTopologicalSorting(targets) {
//   const nodes = new Map();
//   targets.forEach((target) => {
//     const { name, dependencies } = target;
//     if (!nodes.has(name)) {
//       nodes.set(name, { target, indegree: 0, afters: [] });
//     }
//     const keys = Object.keys(dependencies).filter((dependency) =>
//       dependency.startsWith("@powerbotkit")
//     );

//     keys.forEach((key) => {
//       if (!nodes.has(key)) {
//         nodes.set(key, {
//           target: targets.find((t) => t.name === key),
//           indegree: 0,
//           afters: [],
//         });
//       }
//       nodes.get(name).indegree = nodes.get(key).indegree + 1;
//       nodes.get(key).afters.push(target);
//     });
//   });

//   return nodes;
// }
