# Contributing to CoreDev

Thank you for your interest in contributing to **CoreDev**, our Next.js-powered team portfolio showcase! We value contributions from the community and are excited to collaborate with you to make this project even better. This guide outlines how you can contribute, from reporting issues to submitting code changes.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Code Changes](#submitting-code-changes)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Contact Us](#contact-us)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to fostering an inclusive and respectful community. Please treat everyone with respect and kindness.

## 🚀 How to Contribute

There are several ways to contribute to CoreDev, whether you're a developer, designer, or just have great ideas.

### 🐞 Reporting Bugs

If you find a bug, please report it to help us improve the project:

1. Check the [GitHub Issues](https://github.com/kyy-95631488/CoreDev/issues) to ensure the bug hasn't already been reported.
2. Open a new issue with a clear title and description, including:
   - A detailed description of the bug.
   - Steps to reproduce the issue.
   - Expected behavior and actual behavior.
   - Screenshots or logs (if applicable).
   - Your environment (e.g., browser, OS, Node.js version).

### 💡 Suggesting Features

We welcome ideas for new features or improvements! To suggest a feature:

1. Check the [GitHub Issues](https://github.com/kyy-95631488/CoreDev/issues) to see if your idea has already been proposed.
2. Open a new issue with the `[Feature Request]` prefix in the title.
3. Provide a clear description of the feature, why it's valuable, and any relevant examples or mockups.

### 💻 Submitting Code Changes

To contribute code (e.g., bug fixes, new features, or improvements):

1. Fork the repository.
2. Create a new branch for your changes (`git checkout -b feat/your-feature-name` or `git checkout -b fix/bug-name`).
3. Make your changes, following our [Code Style Guidelines](#code-style-guidelines).
4. Write or update tests if applicable.
5. Commit your changes with a clear message following our [Commit Message Guidelines](#commit-message-guidelines).
6. Push your branch to your fork (`git push origin feat/your-feature-name`).
7. Open a Pull Request (PR) to the `main` branch of the CoreDev repository.

## 🛠️ Development Setup

To set up the project locally for development:

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- A modern code editor like [VS Code](https://code.visualstudio.com/)

### Steps

1. **Clone Your Fork**:
   ```bash
   git clone https://github.com/kyy-95631488/CoreDev
   cd coredev
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app.

5. **Run Linting**:
   Ensure your code adheres to our style guidelines:
   ```bash
   npm run lint
   # or
   yarn lint
   ```

## 📝 Code Style Guidelines

To maintain consistency across the codebase, please adhere to the following:

- **JavaScript/TypeScript**: Follow the rules defined in `.eslintrc.json`. Use ESLint to check for issues:
  ```bash
  npm run lint
  ```
- **Formatting**: Use [Prettier](https://prettier.io/) for consistent code formatting. Run:
  ```bash
  npm run format
  ```
- **CSS**: Use [Tailwind CSS](https://tailwindcss.com/) for styling. Avoid inline styles unless absolutely necessary.
- **Components**: Write reusable, modular React components in the `components/` directory.
- **File Naming**: Use `kebab-case` for file names (e.g., `my-component.tsx`).
- **Husky**: Pre-commit hooks are set up to run linting and formatting automatically.

## ✍️ Commit Message Guidelines

We follow a consistent commit message format to keep the project history clear:

- Use the format: `[type](scope): short description`
  - **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - **Scope**: The part of the project affected (e.g., `components`, `pages`, `styles`)
  - **Example**: `feat(components): add new project card component`
- Keep messages concise but descriptive.
- Use present tense (e.g., "add" instead of "added").

## 🔄 Pull Request Process

1. Ensure your code follows the [Code Style Guidelines](#code-style-guidelines).
2. Update the `README.md` or other documentation if your changes affect it.
3. Submit a Pull Request to the `main` branch with:
   - A clear title and description of your changes.
   - Reference any related issues (e.g., `Fixes #123`).
   - Screenshots or GIFs for UI changes (if applicable).
4. Wait for a review from the CoreDev team. Address any feedback promptly.
5. Once approved, your PR will be merged!

## 📬 Contact Us

Have questions or need help? Reach out to us:

- **GitHub Issues**: [Open an Issue](https://github.com/kyy-95631488/CoreDevissues)
- **Email**: coredev.c@gmail.com

Thank you for contributing to CoreDev! Let's build something amazing together! 🚀