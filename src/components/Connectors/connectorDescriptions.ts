export type ConnectorId =
  | 'google_workspace'
  | 'google_services'
  | 'google_calendar'
  | 'google_drive'
  | 'google_docs'
  | 'google_sheets'
  | 'google_tasks'
  | 'gmail'
  | 'google_slides'
  | 'google_forms'
  | 'google_apps_script'
  | 'google_chat'
  | 'google_contacts'
  | 'google_home';

export interface ConnectorDescription {
  id: ConnectorId;
  title: string;
  subtitle: string;
  description: string;
  canDo: string[];
  cannotDo: string[];
  examplePrompts: string[];
}

export const CONNECTOR_DESCRIPTIONS: Record<ConnectorId, ConnectorDescription> = {
  google_workspace: {
    id: 'google_workspace',
    title: 'Google Workspace',
    subtitle: 'Productivity & collaboration suite',
    description:
      'Connects Gemma to your Google Workspace ecosystem, allowing you to seamlessly search, summarize, create, and manage your emails, documents, spreadsheets, presentations, calendar events, tasks, chat messages, and automation scripts directly from the conversation.',
    canDo: [
      'Search and summarize emails, documents, files, and chat conversations across your account',
      'Create and update calendar events, to-do tasks, Google Docs, Sheets, Slides, and Forms',
      'Draft and send emails in Gmail or post messages in Google Chat spaces upon your request',
      'Generate and manage custom Google Apps Script automation projects'
    ],
    cannotDo: [
      'Access, modify, or delete your Workspace data without an explicit request in chat',
      'Change core Google Account security settings, passwords, or billing configurations',
      'Bypass file sharing permissions or access private files from other accounts without authorization',
      'Permanently purge your entire Drive trash or wipe your mailbox automatically'
    ],
    examplePrompts: [
      'Check my Google Calendar for tomorrow and summarize my upcoming meetings.',
      'Create a new Google Doc with a project roadmap and share the link with me.',
      'Find the latest budget spreadsheet in my Google Drive and summarize the key numbers.',
      'Draft an email in Gmail to the team with the weekly status update.'
    ]
  },
  google_services: {
    id: 'google_services',
    title: 'Services Google',
    subtitle: 'Personal Google account services',
    description:
      'Integrates Gemma with personal Google services such as Google Contacts and Google Home, enabling address book management and smart home device automation directly through natural language requests.',
    canDo: [
      'Search your address book by name, email address, phone number, or organization',
      'Retrieve detailed contact information to use in emails, invites, or messages',
      'Create new contact cards with phone numbers, emails, job titles, and notes',
      'Inspect and control connected smart home devices, lights, thermostats, and switches'
    ],
    cannotDo: [
      'Modify or delete contacts without your explicit instruction',
      'Access local device contacts that are not synced with your Google Account',
      'Unlock security doors or disarm alarm systems without authorization',
      'Share your private personal data externally without your confirmation'
    ],
    examplePrompts: [
      'Find the email address and phone number for Alex in my Google Contacts.',
      'Add a new contact named Sarah Jenkins with email sarah@example.com.',
      'Turn off all smart lights in the apartment.',
      'What is the current temperature on the home thermostat?'
    ]
  },
  google_calendar: {
    id: 'google_calendar',
    title: 'Google Calendar',
    subtitle: 'Schedule & event management',
    description:
      'Allows Gemma to view your schedule, check availability, create new events, and update or cancel existing meetings in your Google Calendar.',
    canDo: [
      'List upcoming events, meetings, and reminders for any date range',
      'Create new calendar events with titles, times, locations, descriptions, and attendees',
      'Reschedule, update details, or delete existing calendar entries upon request',
      'Check your free and busy time slots to help plan your day'
    ],
    cannotDo: [
      'View private details of other people’s calendars unless shared with you',
      'Modify organization-wide resource policies or room booking administration settings',
      'Send calendar invitations without your explicit prompt'
    ],
    examplePrompts: [
      'What is on my schedule for this Friday?',
      'Schedule a 45-minute design review tomorrow at 2:00 PM.',
      'Move my 10:00 AM meeting on Monday to 11:30 AM.',
      'When do I have a free 1-hour slot this afternoon?'
    ]
  },
  google_drive: {
    id: 'google_drive',
    title: 'Google Drive',
    subtitle: 'Cloud file storage & organization',
    description:
      'Enables Gemma to search through your cloud storage, locate files and folders, read metadata, and organize your workspace by creating new folders or files.',
    canDo: [
      'Search for files and folders by title, type, or content keywords',
      'Create new folders and organize files within your Google Drive',
      'Retrieve file links, modification dates, and sharing metadata',
      'Copy or rename existing files in your Drive upon request'
    ],
    cannotDo: [
      'Permanently empty your Google Drive trash bin without restrictions',
      'Access files owned by others that have not been shared with your account',
      'Modify Google One storage subscription plans or billing settings'
    ],
    examplePrompts: [
      'Find all PDF files in my Google Drive uploaded this month.',
      'Create a new folder in my Drive called "Q4 Product Launch".',
      'Search my Drive for files mentioning "API documentation".',
      'Show me the 5 most recently modified files in my Google Drive.'
    ]
  },
  google_docs: {
    id: 'google_docs',
    title: 'Google Docs',
    subtitle: 'Document creation & editing',
    description:
      'Lets Gemma read the contents of your Google Docs, summarize long documents, generate brand-new structured documents, and append or update text.',
    canDo: [
      'Read, analyze, and summarize text from your existing Google Docs',
      'Create new Google Docs populated with formatted text, headings, and lists',
      'Append new sections, notes, or action items to existing documents',
      'Rewrite or update specific sections of a document based on your instructions'
    ],
    cannotDo: [
      'Edit password-protected external Word files that are not converted or accessible',
      'Change advanced domain-level DLP (Data Loss Prevention) policies',
      'Recover document revision history that was permanently purged by an owner'
    ],
    examplePrompts: [
      'Summarize the main points from my "Meeting Notes" Google Doc.',
      'Create a new Google Doc with a technical specification for a REST API.',
      'Append today’s action items to the end of my "Project Tracker" document.',
      'Read my draft article in Google Docs and suggest improvements.'
    ]
  },
  google_sheets: {
    id: 'google_sheets',
    title: 'Google Sheets',
    subtitle: 'Spreadsheets & data tracking',
    description:
      'Connects Gemma to your spreadsheets so you can read cell ranges, analyze tabular data, create new sheets, and append rows automatically.',
    canDo: [
      'Create new Google Sheets with custom columns, headers, and initial data',
      'Read values from specific sheets, cell ranges, and tables for analysis',
      'Append new rows of data or update existing cell values upon request',
      'Summarize financial tables, trackers, and logs stored in your spreadsheets'
    ],
    cannotDo: [
      'Execute external macros that require manual browser UI interaction',
      'Bypass protected sheet or range permissions set by another document owner',
      'Modify external database connections configured in Enterprise BigQuery links'
    ],
    examplePrompts: [
      'Create a new Google Sheet to track monthly software subscriptions.',
      'Read the first 20 rows of my "Expenses 2026" spreadsheet and calculate the total.',
      'Add a new row to my "Task Log" sheet with today’s date and status "Completed".',
      'Analyze the sales data in my latest Google Sheet and highlight top trends.'
    ]
  },
  google_tasks: {
    id: 'google_tasks',
    title: 'Google Tasks',
    subtitle: 'To-do lists & task tracking',
    description:
      'Helps you stay on top of your daily priorities by letting Gemma view your task lists, add new to-do items with due dates, and mark completed tasks.',
    canDo: [
      'View all your task lists and pending or completed to-do items',
      'Create new tasks with titles, notes, and due dates',
      'Mark tasks as completed or reopen finished items',
      'Update task details or delete obsolete tasks from your lists'
    ],
    cannotDo: [
      'Assign personal Google Tasks directly to external users outside shared spaces',
      'Configure mobile push notification settings on your physical device',
      'Recover tasks after they have been permanently deleted'
    ],
    examplePrompts: [
      'Show me all my uncompleted items in Google Tasks.',
      'Add a task "Review pull requests" due tomorrow at 5:00 PM.',
      'Mark the task "Submit monthly report" as completed.',
      'Create a new task list called "Weekend Project" and add 3 starter tasks.'
    ]
  },
  gmail: {
    id: 'gmail',
    title: 'Gmail',
    subtitle: 'Email search, drafting & sending',
    description:
      'Integrates Gemma with your Gmail inbox to search threads, summarize long email chains, prepare drafts for your review, and send messages.',
    canDo: [
      'Search emails by sender, subject, date, label, or keywords',
      'Read and summarize individual messages or entire email threads',
      'Create email drafts in your Gmail account ready for review',
      'Send new emails or replies when you explicitly ask Gemma to send them'
    ],
    cannotDo: [
      'Send emails silently in the background without your prompt',
      'Change your Gmail forwarding rules, POP/IMAP settings, or account filters',
      'Bypass attachment size limits or send executable files blocked by Gmail security'
    ],
    examplePrompts: [
      'Find recent emails from GitHub and summarize any security alerts.',
      'Create a draft in Gmail replying to the latest email from Alex.',
      'Search my inbox for flight confirmation emails from the last 30 days.',
      'Send an email to team@example.com with the subject "Release Notes".'
    ]
  },
  google_slides: {
    id: 'google_slides',
    title: 'Google Slides',
    subtitle: 'Presentations & slide decks',
    description:
      'Allows Gemma to create new Google Slides presentations, inspect existing slide decks, and help structure slide content directly from chat.',
    canDo: [
      'Initialize and create new Google Slides presentations in your Drive',
      'Read text and structure from existing presentation slides',
      'Populate slides with titles, bullet points, and structured outlines',
      'Summarize key takeaways from multi-slide presentations'
    ],
    cannotDo: [
      'Record live audio narration or video presenter feeds inside Slides',
      'Edit complex master theme animations or custom transition timelines',
      'Export video files directly from Google Slides'
    ],
    examplePrompts: [
      'Create a new Google Slides presentation titled "Q4 Product Strategy".',
      'Summarize the key points from my "Pitch Deck" presentation.',
      'Add a new slide outlining the system architecture to my presentation.',
      'Generate a 5-slide outline for our upcoming engineering demo.'
    ]
  },
  google_forms: {
    id: 'google_forms',
    title: 'Google Forms',
    subtitle: 'Surveys, quizzes & feedback forms',
    description:
      'Enables Gemma to generate new Google Forms, add survey questions, read form structure, and review collected responses.',
    canDo: [
      'Create new Google Forms with custom titles and descriptions',
      'Add multiple-choice, text, or rating questions to a form',
      'Inspect existing form questions and configuration details',
      'Retrieve and summarize submitted form responses'
    ],
    cannotDo: [
      'Submit fake responses to external forms on behalf of your account',
      'Configure third-party payment gateways inside Google Forms',
      'Bypass organization login restrictions on restricted internal forms'
    ],
    examplePrompts: [
      'Create a Google Form for collecting user feedback on the new UI.',
      'Add 5 multiple-choice questions about TypeScript to my quiz form.',
      'Summarize the responses submitted to my "Event Registration" form.',
      'Create a quick team poll in Google Forms for our next sprint retrospective.'
    ]
  },
  google_apps_script: {
    id: 'google_apps_script',
    title: 'Google Apps Script',
    subtitle: 'Workspace automation & custom code',
    description:
      'Gives Gemma the ability to create and manage Google Apps Script projects to automate repetitive workflows across your Google Workspace apps.',
    canDo: [
      'Create new standalone or bound Google Apps Script projects',
      'Write and update `.gs` script files and `appsscript.json` manifests',
      'Inspect existing script code to debug or optimize automation logic',
      'Build custom functions and workflow automations for Sheets, Docs, and Gmail'
    ],
    cannotDo: [
      'Grant OAuth consent on your behalf when a script runs for the first time',
      'Bypass Google Apps Script daily execution quotas or runtime limits',
      'Access Google Cloud IAM roles outside the script project scope'
    ],
    examplePrompts: [
      'Create a Google Apps Script project that automatically archives old calendar events.',
      'Write a custom Google Sheets script to format new rows and send an email alert.',
      'Inspect my existing Apps Script project and optimize the API calls.',
      'Generate an Apps Script automation that saves Gmail attachments to a Drive folder.'
    ]
  },
  google_chat: {
    id: 'google_chat',
    title: 'Google Chat',
    subtitle: 'Team messaging & spaces',
    description:
      'Connects Gemma to your Google Chat spaces and conversations so you can catch up on discussions, search message history, and post updates.',
    canDo: [
      'List your joined Google Chat spaces and direct message conversations',
      'Read recent messages and summarize ongoing team discussions',
      'Post new messages or updates to a specific Google Chat space',
      'Search across chat messages to find shared links or decisions'
    ],
    cannotDo: [
      'Read messages in private spaces that you are not a member of',
      'Modify Google Workspace Admin chat retention or external federation policies',
      'Initiate live audio or video huddles inside Google Chat'
    ],
    examplePrompts: [
      'List my active Google Chat spaces.',
      'Summarize the latest messages in the "Engineering" Google Chat space.',
      'Post a message to the "Announcements" space saying the deployment is complete.',
      'Find any links shared in my Google Chat spaces today.'
    ]
  },
  google_contacts: {
    id: 'google_contacts',
    title: 'Google Contacts',
    subtitle: 'Address book & contact management',
    description:
      'Allows Gemma to search your Google Contacts, view detailed contact cards, and add or update people in your address book upon request.',
    canDo: [
      'Search contacts by name, email address, phone number, or company',
      'View full contact cards including emails, phone numbers, and notes',
      'Create new contacts in your Google address book',
      'Update existing contact fields or remove duplicate entries when requested'
    ],
    cannotDo: [
      'Access contacts stored exclusively on your SIM card or local phone storage',
      'Modify your organization’s global Workspace directory without admin rights',
      'Share or export your contacts externally without your explicit action'
    ],
    examplePrompts: [
      'Search my Google Contacts for anyone named Dmitry.',
      'Create a new contact for John Doe with phone +1-555-0199 and email john@doe.com.',
      'What is the email address for Elena in my Contacts?',
      'Update Alex’s company name to "TechLabs" in my Google Contacts.'
    ]
  },
  google_home: {
    id: 'google_home',
    title: 'Google Home',
    subtitle: 'Smart home & device control',
    description:
      'Connects Gemma to your Google Home and Nest ecosystem, allowing you to check device statuses, control smart lights, thermostats, plugs, and manage home automation routines directly through natural conversation.',
    canDo: [
      'View the list of connected smart home devices and their current states',
      'Turn smart lights, plugs, and switches on or off',
      'Adjust thermostat target temperatures and HVAC modes',
      'Check sensor readings such as ambient temperature and humidity'
    ],
    cannotDo: [
      'Unlock security doors or disarm security systems without PIN authorization',
      'Access live camera video streams directly within chat messages',
      'Add or pair new physical hardware devices without the official Google Home app',
      'Modify home member permissions or account access levels'
    ],
    examplePrompts: [
      'Turn off all lights in the living room.',
      'What is the current temperature on the hallway thermostat?',
      'Set the thermostat to 22 degrees Celsius.',
      'Show me all active smart devices in my home.'
    ]
  }
};
