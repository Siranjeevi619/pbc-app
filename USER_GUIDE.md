# PBC Request Register — User Guide

A shared register for tracking documents and data an audit client needs to hand over (the "PBC" list — Prepared By Client). Instead of chasing requests over email, everyone works from one live list: auditors request items, clients respond to them, overdue items get reminded automatically, and withheld items feed straight into draft letters.

## Getting to the app

Open the application in your browser:

```
http://localhost:3000
```

(If someone has deployed this for your firm, use the URL they gave you instead.)

## Creating an account

1. Go to **Register**.
2. Enter your name, email and password.
3. Choose your role:
   - **Auditor** — day-to-day staff working the engagement.
   - **Engagement Partner** — everything an auditor can do, plus the authority to finalize letters.
   - **Admin** — manages users and schedules.
   - **Client Contact** — an external client responding to requests. Register using the **exact same email address** your auditor used when they added you as a contact (see "Adding a client contact" below) — that's how the app links your account to your items.
4. Submit. You're logged in immediately and land on the screen for your role.

Already have an account? Use **Sign in** instead.

> Registering as a Client Contact and getting "no client contact found for this email"? Your auditor hasn't added you as a contact yet, or added you under a different email — ask them to check.

---

## If you're an Auditor, Partner or Admin

### 1. Create an engagement

Everything in the app belongs to an **engagement** — one audit job, for one client, for one financial year.

- Go to **All Engagements**.
- Fill in the engagement name, client name, fiscal year and the audit team's email (used for the internal daily digest).
- Click **Create**, then **Open** it.

### 2. Add client contacts

Inside an engagement, on the **Firm Ledger** screen, click **Add Contact** and enter the client person's name, email and role (e.g. "CFO", "Finance Manager"). Tell them to register on the portal using that exact email address — the app matches new client accounts to contacts by email, so no ID needs to be shared.

### 3. Request items — Firm Ledger

This is your home screen for the engagement.

- **Stat cards** at the top show totals: pending, awaiting review, cannot provide, overdue.
- Click **New Request** to log a document you need: pick the contact, name the item, optionally categorize it, and set a due date. It's created with status **Pending**.
- Use the **filter chips** to narrow the table to one status.
- When a client submits a file, its status becomes **Awaiting Review** and **Accept** / **Resubmit** buttons appear on that row:
  - **Accept** → marks it **Reviewed** (done).
  - **Resubmit** → sends it back to the client as **Needs Resubmission**, with an optional note.

### 4. Request a sample — Samples

For items that need statistical sample testing instead of a full population request:

1. Enter the **population size**, the **sample size**, and choose **Random** or **Systematic**.
2. Click **Generate** — the app runs the sampling algorithm and shows you the picked item numbers (nothing is saved yet).
3. Pick the client contact, name the sample request, set a due date, and click **Send sample request**. This creates a normal trackable item carrying the sample numbers.
4. The **Existing sample requests** table below shows everything already sent.

### 5. Automate reminders — Automation Center

- Set the two daily trigger times: when the **internal digest** goes to your team, and when the **client end-of-day reminder** goes out. Click **Save Schedule**.
- Switch between the **Client EOD reminders** and **Internal daily digest** tabs to preview the exact email that would be sent right now, for each client/team — nothing is sent until you act.
- **Copy** copies the email body to your clipboard (paste into Outlook/Word if you'd rather send it yourself).
- **Send now** sends it immediately and logs it.
- **Send log** tab shows every reminder actually sent, with timestamps — this is your audit trail proving the chasing happened.
- The two scheduled times also fire automatically every day without anyone touching the app.

### 6. Generate letters — Letters

Once items are marked **Cannot Provide** (or rejected), this screen turns them into first drafts:

- **Management Representation Letter** — pulls every "cannot provide" item, with its reason and justification, into a client sign-off letter draft.
- **Management Letter — Deficiencies & Recommendations** — pulls cannot-provide and rejected items into a findings-and-recommendations draft.
- Click **Refresh** to regenerate from the current register state.
- Edit the text directly in the box — it saves automatically when you click away.
- Click **Copy** to paste it into Word/Outlook for the real sign-off process.
- These are always **drafts**. Only an **Engagement Partner** can click **Finalize** to lock one — after that it can no longer be edited.

**These are drafts only — never send a generated letter to a client until an Engagement Partner has reviewed and finalized it.**

---

## If you're a Client Contact

You only see the **Client Portal** — your own outstanding requests, nothing belonging to other clients.

For each item you'll see its name and due date, with two options:

### Option 1 — Upload it
Click **Upload**, choose the file from your computer, and click **Submit**. The item moves to "awaiting review" on the audit team's side.

### Option 2 — Say you can't provide it
Click **Can't provide**, then:
1. Pick the reason that applies (company policy, legal/regulatory restriction, security/confidentiality concern, or data not available).
2. Type a short justification — this is required and gets recorded on the file, so be specific (it may end up quoted in a management letter).
3. Click **Submit**.

If an item you already responded to gets sent back to you (status "Needs Resubmission"), it will reappear in your list with the auditor's note so you can fix it and resubmit.

Once an item is accepted or you've explained why it can't be provided, it drops off your outstanding list.

---

## Status meanings, in plain terms

| Status | What it means |
|---|---|
| Pending | Requested, nothing received yet |
| Awaiting Review (submitted) | Client uploaded a file; auditor hasn't reviewed it yet |
| Reviewed | Auditor accepted it — done |
| Needs Resubmission (rejected) | Auditor sent it back; client needs to act again |
| Cannot Provide | Client formally declined, with a recorded reason |
| Overdue | Past due date and still pending or needs resubmission — this is what triggers reminders |

## A few things worth knowing

- Everything you do is logged with a timestamp (who changed what, and when) — this is what makes the register usable as audit evidence, not just a to-do list.
- A client can never see another client's items, even by guessing an ID — the server enforces this, not just the screen.
- Nothing is emailed automatically to a real inbox in this environment yet — reminder "sends" are logged and printed to the server console, so you can test the whole flow safely before wiring up real email.
