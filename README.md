# Team Workspace Onboarding Prototype

Interactive mobile-only prototype for the Figma Team Workspace Onboarding flow.

## Stack

- Next.js App Router
- React
- Tailwind CSS with semantic CSS variables
- shadcn/ui-style primitives
- lucide-react icons
- Mocked onboarding and invite data

## Run

Install dependencies with your package manager, then start the preview:

```bash
npm install
npm run dev
```

The prototype is deployable to any standard Next.js host such as Vercel.

## Flow Coverage

- Landing, login, sign up, account exists, and email verification
- Invite link entry and invite edge cases
- Workspace creation, name check, duplicate name, creating, and failure
- Workspace configuration and saving
- Invite teammates empty, list, sending, error, and sent states
- Workspace-ready checklist and post-onboarding states

Only Admin and Team Member roles are modeled. The removed initial dashboard setup is not part of the onboarding checklist.
# launchpad-test
