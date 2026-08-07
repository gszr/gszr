# Runta Setup

*August 7, 2026 · `runta` `agents` `security`*

I was very pleased when I learned about the launch of [Runta](https://runta.com), an execution layer for AI agents. Having worked with Guanlan Dai at Kong, I knew he was building something great.

The productivity boost from working with agents is unquestionable. What once took days can now take minutes. Teams can focus on delivering value faster while delegating formerly tedious tasks to AI.

But, as with any technology, there are tradeoffs and risks. The potential for data leaks and supply-chain attacks is real. These are some issues Runta helps you address.

In this note, I walk through the journey of creating an account, configuring a runtime, connecting it securely to GitHub, and testing it with an agent.

The commands below were checked against Runta CLI 0.1.15.

## Step by step

### 1. Create a Runta account

The sign-up experience was smooth. I used GitHub to authenticate.

### 2. Create a Runta runtime

You can create a runtime from **Dashboard → Runtimes**, or with the CLI:

```sh
runta run --cpus 1 --memory 512 --name work
```

### 3. Create a GitHub personal access token

Create a token in [GitHub's developer settings](https://github.com/settings/tokens). Grant only the permissions your agent needs and make the token available as `GITHUB_TOKEN` in your local shell. Do not commit it or put its raw value in shell history.

### 4. Store the GitHub API token in Runta

You can store the token from **Dashboard → Secrets**, or pipe it to the CLI:

```sh
printf '%s' "$GITHUB_TOKEN" | \
  runta secret set github-token --value-stdin
```

This creates a tenant-level Runta secret named `github-token`. The real value will not need to be exposed inside the runtime.

### 5. Bind the GitHub API token to the runtime

Create a runtime-scoped [secret-stub rule](https://runta.com/docs/runtime/secrets-and-secret-injection/) for the GitHub API:

```sh
runta secret rule set work \
  --host api.github.com \
  --path '*' \
  --secret github-token \
  --header Authorization \
  --template 'Bearer ${credential}'
```

The rule tells Runta to inject the stored token into matching requests from the `work` runtime to `api.github.com`.

### 6. Store a GitHub Basic authentication value

The bearer-token rule covers GitHub API requests made by tools such as `gh`. Git operations over HTTPS use Basic authentication, so we need to store an encoded `username:token` value as well:

```sh
printf 'x-access-token:%s' "$GITHUB_TOKEN" | \
  base64 | \
  tr -d '\n' | \
  runta secret set github-git-basic --value-stdin

unset GITHUB_TOKEN
```

### 7. Bind the Basic authentication value to the runtime

Bind the new secret to GitHub repository requests from `work`:

```sh
runta secret rule set work \
  --host github.com \
  --path '/JetStreamSecurity/*' \
  --secret github-git-basic \
  --header Authorization \
  --template 'Basic ${credential}'
```

This does not collide with the API rule because that rule is bound to `api.github.com`. The path also limits this rule to repositories under the `JetStreamSecurity` organization.

### 8. Test the setup

Test an authenticated GitHub API request:

```sh
runta exec work -- \
  env GH_TOKEN=runta-secret-stub gh api user --jq .login
```

Then test Git authentication against a repository you can access:

```sh
runta exec work -- \
  git ls-remote https://github.com/JetStreamSecurity/REPOSITORY.git HEAD
```

Steps 4 and 6 create tenant-level secrets, so they do not need to be repeated for every runtime unless those secrets are deleted. The runtime-scoped rules in steps 5 and 7 must still be applied to each runtime.

## Next steps

At this point, the `work` runtime can access GitHub without receiving the real GitHub token.

### Runtime dependencies

I use [mise](https://mise.jdx.dev/) to manage runtime dependencies, including agent installations:

```toml
[tools]
python = "3.12"
yq = "4"
jq = "1.7.1"
codex = "latest"
opencode = "latest"
claude = "latest"
```

Runta also supports built-in agent presets, which you can inspect with:

```sh
runta agents ls
```

### Teach agents to use Runta

The [Runta agent skills](https://runta.com/docs/reference/agent-skills/) help agents understand how to work with the platform:

```sh
npx skills add https://runta.com/docs
```

You can also update `AGENTS.md` to tell local agents to prefer a Runta runtime:

```diff
 ## Environment
 
+- Use Runta runtimes for all work in this repository. Use `work` as the
+  runtime name, and check whether it exists before creating it.
+- When creating the runtime, use 2 vCPUs and 4096 MiB of memory.
+- Once the runtime is ready, dispatch subagent work through
+  `runta exec <runtime>`.
+- Use mise to install dependencies in the Runta runtime.
```

From then on, a local agent can help guide you through setting up and working in the Runta environment.

### Configure an OpenAI provider

You could start OpenCode inside the runtime and use `/connect`, but that would store access and refresh tokens in the runtime. Instead, we can use the same Runta secret flow.

First, store your OpenAI API key:

```sh
runta secret set openai-key --prompt
```

Then bind it to the runtime:

```sh
runta secret rule set work \
  --host api.openai.com \
  --path '/v1/*' \
  --secret openai-key \
  --header Authorization \
  --template 'Bearer ${credential}'
```

Configure the placeholder value inside the runtime:

```sh
runta exec work -- \
  /root/.local/bin/mise set --global \
  OPENAI_API_KEY=runta-secret-stub
```

Now start OpenCode or Codex:

```sh
runta exec -it work -- \
  /root/.local/bin/mise exec -- opencode

# Or:
runta exec -it work -- \
  /root/.local/bin/mise exec -- codex
```

The current Runta CLI can also onboard supported agents with `runta run --agent`. I used the manual flow here to make the secret injection mechanics explicit and to keep control over the tools installed through mise.

I will write more about Runta as I use it and learn more about the platform.

> [!NOTE]
> This manual process should become simpler as Runta adds more native OAuth and provider support.

---

[← All posts](../README.md)
