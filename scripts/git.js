const { exec } = require('shelljs');

function getGitRemoteRepos() {
	return exec('git remote -v', { silent: true })
		.stdout.split('\n')
		.map(x => x.trim())
		.filter(x => !!x)
		.map(remote => {
			const remoteRepos = remote.split('\t');
			const remoteUrl = remoteRepos[1].split(' ');
			const remoteType = /(?<=\()[^\(\)]*(?=\))/.exec(remoteUrl[1])[0];

			return {
				name: remoteRepos[0],
				url: remoteUrl[0],
				type: remoteType
			};
		});
}

module.exports = {
	getGitRemoteRepos
};