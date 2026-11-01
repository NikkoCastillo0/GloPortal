# GloPortal Merge Conflict Guide

## Purpose

This guide explains how the GloPortal team should prevent and fix any merge conflicts that may occur.

## Branch structure

- main - this is the production branch
- develop - shared integration branch before moving to main
- feature branches - meant for individual Jira tasks

ALL FEATURE BRANCHES should be created from the LATEST version of the develop branch

## Preventing Merge Conflicts

Before starting work on tasks:

1. Make sure you have the LATEST version of the develop branch
2. Create a feature branch for your Jira task.
3. Work only on the files that need to be changed for your task.
4. Update your feature with the LATEST changes from the develop branch before making a pull request.
5. Communicate with teammates if you are editing a file that they are also editing.

## Resolving a Merge conflict

It is the responsibility of whoever causes the merge conflict to resolve it. This does not mean the team will not help them. It means if you make the merge conflict you should take charge, communicate with the team if anything is unclear, and handle the responsibility of solving the conflict.

1. Identify which files contain conflicts.
2. Open each conflicted file in your code editor.
3. Review both versions of the code.
4. Decide whether you should keep your changes, keep the incoming changes from develop, or keep both changes. If it is unclear which to do communicate with the team to make sure you dont delete someone else's important code.
5. save the files.
6. Mark conflicts as resolved.
7. commit the resolved changes.
8. push the updated feature branch.
9. Test the application with the conflicted resolved.

