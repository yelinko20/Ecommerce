module.exports = {
  types: [
    { value: ":sparkles: feat", name: "✨ feat:\tAdding a new feature" },
    { value: ":bug: fix", name: "🐛 fix:\tFixing a bug" },
    { value: ":memo: docs", name: "📝 docs:\tAdd or update documentation" },
    {
      value: ":lipstick: style",
      name: "💄 style:\tAdd or update styles, ui or ux",
    },
    {
      value: ":recycle: refactor",
      name: "♻️ refactor:\tCode change that neither fixes a bug nor adds a feature",
    },
    {
      value: ":zap: perf",
      name: "⚡️perf:\tCode change that improves performance",
    },
    {
      value: ":white_check_mark: test",
      name: "✅ test:\tAdding tests cases",
    },
    {
      value: ":truck: chore",
      name: "🚚 chore:\tChanges to the build process or auxiliary tools\n\t\tand libraries such as documentation generation",
    },
    { value: ":rewind: revert", name: "⏪️revert:\tRevert to a commit" },
    { value: ":construction: wip", name: "🚧 wip:\tWork in progress" },
    {
      value: ":construction_worker: build",
      name: "👷 build:\tAdd or update regards to build process",
    },
    {
      value: ":green_heart: ci",
      name: "💚 ci:\tAdd or update regards to build process",
    },
    {
      value: ":page_facing_up: docs-update",
      name: "📄 docs-update:\tUpdate or improve existing documentation",
    },
  ],

  scopes: [
    { name: "dev" }, // General development tasks or updates.
    { name: "ui" }, // User interface related updates.
    { name: "server" }, // Server-side code changes.
    { name: "api" }, // Changes to API endpoints or services.
    { name: "docs" }, // Documentation updates.
    { name: "tests" }, // Updates related to testing or test cases.
    { name: "build" }, // Changes related to the build process.
    { name: "config" }, // Updates to configuration files.
    { name: "scripts" }, // Changes to utility scripts.
    { name: "ci" }, // Continuous integration related changes.
  ],

  scopeOverrides: {
    fix: [
      { name: "merge" },
      { name: "style" },
      { name: "test" },
      { name: "hotfix" },
    ],
  },

  allowCustomScopes: true,
  allowBreakingChanges: ["feat", "fix"],
  skipQuestions: ["body"],
  subjectLimit: 100,
};
