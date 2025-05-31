import { exec } from "shelljs";

interface Repo {
  name: string;
  url: string;
  type: string;
}

export function getGitRemoteRepos(): Repo[] {
  return exec("git remote -v", { silent: true })
    .stdout.split("\n")
    .map((x: string) => x.trim())
    .filter((x: string) => !!x)
    .map((remote: string) => {
      const remoteRepos = remote.split("\t") as string[];
      const remoteUrl = remoteRepos[1].split(" ");
      const remoteTypes = /(?<=\()[^\(\)]*(?=\))/.exec(remoteUrl[1]);
      const remoteType = remoteTypes[0];

      return {
        name: remoteRepos[0],
        url: remoteUrl[0],
        type: remoteType,
      };
    });
}

module.exports = {
  getGitRemoteRepos,
};

