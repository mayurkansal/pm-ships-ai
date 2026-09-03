# PM Skills

The same 15 PM commands, packaged as Claude Skills instead of slash commands.

**The difference:** a slash command only runs when you explicitly type `/pm-prd`. A Skill can auto-trigger — Claude reads the skill's description and decides to use it when your request matches, even if you never type a command name. Drop these into your own `.claude/skills/` folder (each skill is its own subfolder containing a `SKILL.md`) and Claude will reach for the right one on its own — e.g. paste in messy meeting notes and it'll recognize that as a job for `pm-meeting-notes` without being told.

Same content as [`../commands`](../commands), same `pm-` naming, just packaged for automatic triggering instead of manual invocation. Use whichever fits how you work — commands if you like being explicit about what runs, skills if you'd rather Claude notice on its own.

Part of the [pm-ships-ai](../../) series — **10 Years Rusty**.
