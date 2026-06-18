# client/app/

## Purpose

This directory contains the Next.js App Router route structure for Wyrefy. It defines the pages, layouts, and route segments for different parts of the application.

## Important files and folders

- `layout.tsx` - Root layout wrapper.
- `page.tsx` - Public landing page.
- `login/`, `signup/`, `forgot-password/`, `reset-password/` - Auth flow screens.
- `individual/` - Workspace route segment for individual users.
- `organization/` - Workspace route segment for organizations/teams.
- `platform_admin/` - Platform admin dashboards and configuration screens.

## Used by

- Next.js development server and build compiler.

## Conventions

- Use server components for initial loading and data fetching where possible.
- Interactivity belongs in leaf-level client components. Use `"use client"` directive at the top of client files.
- Protect workspace segments using auth middleware / layout guards.
