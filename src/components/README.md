# client/src/components/

## Purpose

This folder hosts reusable React UI components, organized by domain and feature set.

## Important files and folders

- `ui/` - Low-level primitive components built with Radix / shadcn/ui.
- `layout/` - Shell structures, navigation sidebars, and header wrappers.
- `auth/` - Authentication forms and session helpers.
- `sandbox/` - Terminal consoles, code editors, and live preview frames.
- `project/` - Project creation cards, project status, and file viewers.
- `billing/` - Stripe checkout widgets, credit balance sheets, and transaction logs.
- `admin/` - Platform administration panels and analytics metrics.

## Used by

- Next.js pages in [client/app/](file:///home/arwin/selsoftinc/Wyrefy/client/app/)

## Conventions

- Keep components modular and focused. Break large components down early.
- Mark props as `Readonly<Props>` to adhere to Sonar rules.
- Prefer Tailwind CSS classes and avoid inline styling.
