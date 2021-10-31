const core = require("@actions/core");
const github = require("@actions/github");
const semverRcompare = require("semver/functions/rcompare");

const versionLabel = "Version: ";

(async () => {
  const githubToken = core.getInput("github-token", { required: true });
  const octokit = github.getOctokit(githubToken);

  const { owner, repo } = github.context.repo;

  const { data: releasedVersions } = await octokit.rest.repos.listReleases({
    owner,
    repo,
  });

  const versions = releasedVersions
    .map(({ tag_name }) => tag_name)
    .sort(semverRcompare);

  for (const version of versions) {
    const versionWithoutLeadingV = version.replace("v", "");
    const labelName = `${versionLabel}${versionWithoutLeadingV}`;

    try {
      const { data: label } = await octokit.rest.issues.getLabel({
        owner,
        repo,
        name: labelName,
      });

      if (label) {
        break;
      }
    } catch (_error) {
      await octokit.rest.issues.createLabel({
        owner,
        repo,
        name: labelName,
        color: "cfd3d7",
      });
    }
  }
})();
