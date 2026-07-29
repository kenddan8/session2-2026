# UI Guidelines

## Purpose

These guidelines define the core user interface expectations for the TODO app. They ensure the app is simple to use, visually consistent, and accessible across desktop and mobile.

## Core UI Principles

- Keep interactions obvious and low-friction
- Prioritize readability of item titles and metadata
- Use clear visual hierarchy for primary and secondary actions
- Maintain consistency in spacing, typography, and control behavior

## Layout and Structure

- Display the TODO list inside a single, prominent container
- Use a hot pink background for the list container
- Keep adequate internal padding so list items do not feel crowded
- Maintain responsive behavior for small screens (minimum width support for mobile devices)

## Item Presentation

- Show each item title as the primary text
- Show timestamp as subtext directly below the item title
- Use a smaller, lower-emphasis style for timestamp text than for title text
- Keep item rows visually separated for easy scanning

## Timestamp Rules

- Generate a timestamp when an item is added
- Display timestamps in 12-hour format with lowercase meridiem, for example: "05:35 pm"
- Keep timestamp formatting consistent across all list items

## Item Ordering

- Insert new items in ascending order by their added timestamp
- Preserve stable ordering when timestamps are identical

## Editing Behavior

- Provide a pencil icon button to edit the item title
- Entering edit mode should clearly indicate which item is being edited
- Save edited titles without changing the original added timestamp

## Action Controls

- Place the "add item" and "clear" actions next to each other
- Ensure the clear action removes all list items in a single interaction
- Provide immediate UI feedback after add, edit, and clear actions

## Accessibility and Usability

- Ensure sufficient color contrast for text over the hot pink container
- Make all interactive controls keyboard accessible
- Include descriptive labels or aria-labels for icon-only buttons such as the pencil button
- Ensure tap targets are large enough for touch devices

## Visual Consistency

- Use consistent button styles for all primary actions
- Reserve a distinct visual treatment for destructive actions such as clear all
- Keep typography scale and spacing uniform across screens

## Error and Empty States

- Show a clear empty-state message when no list items exist
- Prevent empty item titles from being added or saved
- Communicate validation issues with concise, user-friendly messages
