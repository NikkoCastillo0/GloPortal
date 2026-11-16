# GloPortal Coding Standards

## Purpose

These standards keep the GloPortal code consistent, readable, and easier for
team members to review and maintain.

## General Rules

- Use clear and descriptive names.
- Keep functions and components focused on one responsibility.
- Reuse existing components and styles when possible.
- Remove unused imports, variables, and commented-out code.
- Do not commit passwords, API keys, or secret environment variables.
- Test the application before creating a pull request.

## React Standards

- Use functional components.
- Component files use PascalCase.

```javascript
Header.jsx
ViewAppointments.jsx
AppointmentTable.jsx
```

- Functions and variables use camelCase.

```javascript
const appointmentList = []

function handleSubmit() {}
```

- Custom hooks must begin with `use`.

```javascript
useAppointments()
useAuth()
```

- Keep components in appropriate folders based on their purpose.
- Use descriptive event-handler names.

```javascript
handleSubmit()
handleDeleteAppointment()
handleFilterChange()
```

## File and Folder Organization

- Pages belong in `src/pages`.
- Reusable components belong in `src/components`.
- Images, logos, and icons belong in `src/assets`.
- Supabase and other service setup belongs in `src/lib`.
- Shared styles belong in the appropriate CSS or styling file.

## Styling

- Use Tailwind CSS for new styling.
- Reuse existing Tailwind classes and design patterns.
- Avoid inline styles unless they are necessary.
- Use responsive classes for different screen sizes.
- Keep class names readable and organized.

## Imports

- Keep imports at the top of the file.
- Group imports in this order:
  1. React and external packages
  2. Project components
  3. Assets
  4. Styles

## Data and Security

- Use environment variables for Supabase keys and other secrets.
- Never commit `.env` files containing private values.
- Validate user input before sending it to the database.
- Handle loading and error states for database requests.

## Git Branch Standards

Every feature branch must follow this format:

```text
feature/GP-<number>-<short-description>
```

Example:

```text
feature/GP-42-third-party-licenses
```

- Always branch from the latest `develop` branch.
- Do not branch from `main` or another feature branch.
- Every commit must reference its GP number.

Example:

```text
GP-42: Add third-party license documentation
```

## Pull Request Standards

- One GP per pull request.
- Pull request titles must use the same convention as the related GP.
- Feature pull requests must target `develop`.
- Feature pull requests should use **Squash and merge**.
- The `develop` branch should use a merge commit when merging into `main`.
- Pull requests must be reviewed before merging.

## Code Review

Reviewers should check:

- The application builds and runs.
- The change satisfies the acceptance criteria.
- The code follows these standards.
- There are no unnecessary changes.
- No secrets or sensitive information were committed.
- The feature works on different screen sizes when applicable.