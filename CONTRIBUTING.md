# Contributing Guide

This document outlines the workflow for contributing to this project. Following these guidelines ensures that new features and bug fixes can be added without disrupting the existing codebase.

## 1. Branching Strategy

We use a feature-branch workflow. The `master` branch contains the stable, production-ready code. **Never push directly to `master`.**

### Naming Conventions
- **Features:** `feature/short-description` (e.g., `feature/login-page`, `feature/payment-integration`)
- **Bug Fixes:** `fix/issue-description` (e.g., `fix/header-alignment`, `fix/api-timeout`)
- **Documentation:** `docs/update-readme`

## 2. Workflow Steps

### Step 1: Get the Latest Code
Before starting, ensure your local `master` branch is up to date.
```bash
git checkout master
git pull origin master
```

### Step 2: Create a New Branch
Create a new branch for your specific task.
```bash
git checkout -b feature/your-feature-name
```

### Step 3: Make Your Changes
Write your code. Keep your changes focused on the specific task.
- Save often.
- Test your changes locally.

### Step 4: Commit Your Changes
Stage and commit your files with a clear message.
```bash
git add .
git commit -m "Add authentication feature"
```

### Step 5: Push to GitHub
Push your branch to the remote repository.
```bash
git push origin feature/your-feature-name
```

### Step 6: Create a Pull Request (PR)
1. Go to the GitHub repository page.
2. You will see a banner asking to "Compare & pull request" for your recently pushed branch. Click it.
3. **Title:** Clear summary of the change.
4. **Description:** Explain what you changed and why. Mention any related issues.
5. **Reviewers:** Assign a team member to review your code.
6. Click **Create Pull Request**.

## 3. Code Review & Merging
- Wait for a team member to review your code.
- **Approval Requirement:** Do not merge code into `master` until **all 3 team members** agree on the changes.
- If changes are requested, make them locally, commit, and push again. The PR will update automatically.
- Once approved by all members, the reviewer or you can click **Merge Pull Request**.
- After merging, you can delete your feature branch.

## 4. Syncing Your Local Setup
After your PR is merged, switch back to master and pull the latest changes.
```bash
git checkout master
git pull origin master
git branch -d feature/your-feature-name
```

---

## Quick Summary
1. `git checkout -b feature/my-feature`
2. Code...
3. `git commit -m "Done"`
4. `git push origin feature/my-feature`
5. Open PR on GitHub
6. Merge & Pull `master`
