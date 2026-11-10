# Essen für Alle – Administration Platform

Administration system for **Essen für Alle** (food distribution). It manages
recipients ("Bezüger:innen"), volunteers ("Freiwillige Helfer:innen"), entry
scanning, volunteer shift planning and statistics.

This is the **third generation** of the EfA system.

> **Status:** archived / not in active use or deployed anywhere.

## Features

- **Recipient registration & maintenance** – register recipients, issue cards, edit and search records
- **Entry control** – QR / barcode scanning of recipient cards at distribution, with entry logs
- **Volunteer management** – volunteer records, volunteer cards and card log
- **Shift planning (timetable)** – public sign-up / sign-out for shifts, QR confirmation, and a volunteer "pass" with login, settings and password reset
- **Statistics** – charts over distribution and registration data
- **Printing** – printable recipient and volunteer cards
- **Admin accounts** – permission-based admin users, JWT-based password reset
- **Emails** – registration confirmation, shift sign-up/sign-out, password reset, support requests
- **Multilingual** – German and English (`i18n/`)
- **PWA** – web manifests and service workers for installable apps

## Tech stack

- Node.js, Express 4, EJS templates
- MySQL (`mysql2`)
- Sessions via `express-session` (optionally Memcached)
- `nodemailer` for email, `jsonwebtoken` for tokens
- `bwip-js` / `qr` for barcodes and QR codes, `sharp` for image handling
- Jest for tests

## Getting started

### Requirements

- Node.js 18+
- MySQL 8
- (Optional) Memcached, used for sessions when `PORT=4090`
- An SMTP server for outgoing mail

### Install

```bash
npm install
```

### Database

Create the schema from the provided dump. It creates a database called `EfA`
and contains table definitions only, no data:

```bash
mysql -u <user> -p -e "CREATE DATABASE EfA"
mysql -u <user> -p EfA < schema.sql
```

### Configuration

Create a `.env` file in the project root (it is gitignored):

```env
PORT=3000

# Database
dbHost=localhost
dbPort=3306
dbUsername=
dbPassword=

# Email (SMTP)
emailUser=
emailPassword=
emailUserName=

# Secrets – use long random values (e.g. `openssl rand -hex 32`)
jwtSecret=
salt=
sessionSecret=
```

> The SMTP host (`javascript/mailer.js`), sender/reply-to addresses and the
> `admin.essenfueralle.org` / `system.essenfueralle.org` URLs are currently
> hardcoded for the original deployment. Change them before running your own
> instance.

### Run

```bash
npm start
```

The app listens on `PORT` (see `bin/www`).

### Test

```bash
npm test
```

## Project structure

```
app.js                 Express app setup and route mounting
bin/www                Server entry point
routes/                Route handlers (admin, entry, statistics, timetable, ...)
javascript/            Business logic (auth, db, mailer, i18n, timetable, ...)
views/                 EJS templates (admin/ and public/)
mailTemplates/         EJS email templates
i18n/                  de.json / en.json translations
public/                Static assets, stylesheets, PWA manifests, service workers
Card/                  Card layout used for printing
schema.sql             MySQL schema
```

### Routes

| Path                              | Purpose                          |
| --------------------------------- | -------------------------------- |
| `/admin`                          | Admin login and home             |
| `/admin/receiverRegistration`     | Register recipients              |
| `/admin/receiverMaintenance`      | Edit / search recipients         |
| `/admin/entry`                    | Entry scanning                   |
| `/admin/statistics`               | Statistics                       |
| `/admin/print`                    | Card printing                    |
| `/admin/volunteers`               | Volunteer management             |
| `/admin/volunteers/volunteerCards`| Volunteer cards                  |
| `/timetable`                      | Public shift sign-up             |
| `/timetable/pass`                 | Volunteer pass (login, settings) |

## License

No license has been specified yet. Without one, all rights are reserved.
