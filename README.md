# Explain Tickets

![Node.js](https://img.shields.io/badge/node-%3E%3D16.9.0-339933?logo=node.js&logoColor=white)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)

Explain Tickets is a configurable Discord ticket bot built on `discord.js`.
It provides ticket panels, category-based ticket creation, staff controls, transcripts, activity tracking, suggestions, and optional payment helpers for service-oriented Discord servers.

The project is designed around YAML configuration instead of hard-coded guild behavior.
Server owners can tune command availability, ticket limits, embeds, categories, permissions, transcripts, logs, and payment settings without changing the command handlers.

## Table of Contents

1. [What It Does](#what-it-does)
2. [Feature Overview](#feature-overview)
3. [Requirements](#requirements)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Commands](#commands)
7. [Project Structure](#project-structure)
8. [Runtime Data](#runtime-data)
9. [Deployment Notes](#deployment-notes)
10. [Security](#security)
11. [Roadmap](#roadmap)
12. [License](#license)

## What It Does

Explain Tickets gives a Discord server a structured support workflow.
Users open tickets from a panel, the bot creates private channels with the correct permission overwrites, and staff can manage the ticket lifecycle through commands and buttons.

The bot supports both slash commands and prefix commands, allowing servers to migrate toward slash commands without losing message-command support immediately.
Ticket behavior is controlled from `config.yml`, while command availability and command descriptions are controlled from `commands.yml`.

## Feature Overview

### Ticket Panels

The panel command publishes an embed with ticket categories.
Depending on configuration, the panel can use Discord buttons or a select menu.
Each category can define its own label, description, channel name format, Discord category, support roles, and ticket open message.

### Ticket Lifecycle

Tickets are stored with user, channel, category, status, claim, message, and close metadata.
Staff can add or remove users, rename tickets, pin tickets, alert inactive users, close tickets, delete tickets, and optionally archive closed tickets for later transcript generation or reopening.

### Transcripts and Logs

The transcript system can generate HTML or TXT exports.
When enabled, transcripts are saved in the local `transcripts` folder and can include message attachments and images.
Operational events are written to `logs.txt` and Discord log channels configured in `config.yml`.

### Staff Controls

The bot supports role-based access for ticket categories, blacklisted roles, blacklisted users, maximum open-ticket limits, ticket creation cooldowns, and optional ticket claiming.
These controls help keep ticket volume manageable and reduce channel spam.

### Service Utilities

Utility commands include basic calculations, user blacklist management, crypto payment messages, PayPal invoice helpers, and Stripe invoice helpers.
Payment integrations require valid provider credentials in the private runtime configuration.

## Requirements

- Node.js `16.9.0` or newer.
- A Discord bot application with the `bot` and `applications.commands` scopes.
- A Discord server where the bot role is above the support roles it manages.
- Permission to manage channels, messages, embeds, and role-based channel overwrites.

## Installation

Install dependencies:

```bash
npm install
```

Create your runtime configuration:

```bash
cp config.example.yml config.yml
```

Then edit `config.yml` with your bot token, guild ID, channel IDs, role IDs, and enabled integrations.

Start the bot:

```bash
npm start
```

The start script runs `node index.js`.
On startup, the bot loads command handlers, event handlers, addon files, Enmap stores, and slash command definitions.

## Configuration

The bot expects two YAML files in the project root:

| File | Purpose |
| --- | --- |
| `config.example.yml` | Sanitized configuration template safe to keep in Git. |
| `config.yml` | Private runtime configuration for the bot token, guild ID, embed styling, ticket categories, permissions, logging, transcripts, locale text, and payment settings. |
| `commands.yml` | Command enablement and command descriptions for general, ticket, and utility commands. |

At minimum, configure:

- `Token`
- `GuildID`
- `TicketSettings.LogsChannelID`
- Ticket category IDs for enabled ticket buttons/categories
- Support role IDs for enabled ticket categories
- Transcript and archive behavior
- Payment provider keys only if payment commands are enabled

Keep production `config.yml` private.
It contains fields for Discord tokens and payment provider credentials, so it should not be committed to a public repository.

## Commands

### General

| Command | Description |
| --- | --- |
| `help` | Display available commands. |
| `ping` | Check bot latency. |
| `stats` | Show server or ticket statistics. |
| `suggest` | Submit a suggestion. |

### Tickets

| Command | Description |
| --- | --- |
| `add` | Add a user to the current ticket. |
| `remove` | Remove a user from the current ticket. |
| `close` | Close a ticket, optionally with confirmation or archive behavior. |
| `delete` | Delete a ticket and optionally create a transcript. |
| `panel` | Send the ticket creation panel. |
| `pin` | Pin ticket content. |
| `rename` | Rename the ticket channel. |
| `alert` | Warn the ticket creator that the ticket may be closed after inactivity. |

### Utility

| Command | Description |
| --- | --- |
| `blacklist` | Prevent a user from opening tickets. |
| `unblacklist` | Remove a user from the ticket blacklist. |
| `calculate` | Run a simple math calculation. |
| `crypto` | Send a crypto payment request. |
| `paypal` | Create or send a PayPal invoice flow. |
| `stripe` | Create or send a Stripe invoice flow. |

Command availability is controlled from `commands.yml`.
Some commands may exist in both `commands/` and `slashCommands/` to support message-command and slash-command workflows.

## Project Structure

```text
.
|-- addons/              # Optional addon/event and addon command files
|-- commands/            # Prefix command handlers
|-- events/              # Discord client event handlers
|-- slashCommands/       # Slash command handlers
|-- commands.yml         # Command enablement and descriptions
|-- config.yml           # Private runtime configuration
|-- index.js             # Bot entry point
|-- package.json         # Node package metadata and scripts
`-- utils.js             # Shared bot setup, stores, command loading, and helpers
```

## Runtime Data

The bot writes local runtime artifacts while it runs:

- `logs.txt` for startup messages, warnings, command usage, and errors.
- `data/` for Enmap-backed ticket, stats, suggestion, blacklist, review, panel, and invoice stores.
- `transcripts/` for generated ticket transcripts when folder saving is enabled.
- `node_modules/` for installed dependencies.

These files are intentionally ignored by Git because they are environment-specific and can grow over time.

## Deployment Notes

- Run `npm install` on the server instead of committing `node_modules`.
- Keep the bot process supervised with a process manager such as PM2, systemd, Docker, or the hosting provider's native process runner.
- Back up `data/` if ticket history, statistics, blacklists, invoice records, or review data must survive server moves.
- Re-send the ticket panel after changing category configuration if the existing panel no longer matches the current settings.
- Confirm that the bot role is higher than every support role used in ticket permission overwrites.

## Security

- Never commit real Discord bot tokens, PayPal credentials, Stripe keys, or server-specific IDs intended to remain private.
- Regenerate any credential that was previously pushed to a public repository.
- Restrict payment commands to trusted staff roles.
- Review transcript retention before enabling image downloads, because HTML transcripts can include user-provided content and attachments.

## Roadmap

- Add command permission documentation per role.
- Add setup screenshots for ticket panel creation and category configuration.
- Add automated linting and startup validation checks.
- Add deployment examples for PM2 and Docker.

## License

This project is licensed under the ISC license.
