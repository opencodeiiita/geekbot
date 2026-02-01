const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config();

const REPO = process.env.REPO || "opencodeiiita/SnapMap";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const STATE_FILE = "last_event.json";
const POLL_INTERVAL = 5000; // 5 seconds in ms
const COMMENT_DELAY = 5000; // 5 seconds in ms
const COMMENT_BODY = process.env.COMMENT_BODY || "Bot test 9/1/26";

const HEADERS = {
    "Authorization": `Bearer ${GITHUB_TOKEN}`,
    "Accept": "application/vnd.github+json",
    "User-Agent": "issue-monitor-bot"
};

async function loadLastEventId() {
    try {
        const data = await fs.readFile(STATE_FILE, 'utf8');
        return JSON.parse(data).last_event_id;
    } catch {
        return null;
    }
}

async function saveLastEventId(eventId) {
    await fs.writeFile(STATE_FILE, JSON.stringify({ last_event_id: eventId }));
}

async function commentOnIssue(issueNumber) {
    const url = `https://api.github.com/repos/${REPO}/issues/${issueNumber}/comments`;
    await axios.post(url, { body: COMMENT_BODY }, { headers: HEADERS });
    console.log("comment made", issueNumber);
}

async function checkEvents() {
    const res = await axios.get(`https://api.github.com/repos/${REPO}/events`, { headers: HEADERS });
    const events = res.data;
    const lastSeen = await loadLastEventId();

    for (const event of events) {
        if (event.type !== "IssuesEvent") continue;
        if (event.payload.action !== "opened") continue;
        if (event.id === lastSeen) return;
        const issue = event.payload.issue;
        if (issue.pull_request) continue;
        if (issue.comments !== 0) continue;
        console.log("New Issue");
        console.log(issue.html_url);
        await saveLastEventId(event.id);
        await new Promise(resolve => setTimeout(resolve, COMMENT_DELAY));
        await commentOnIssue(issue.number);
        return;
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("Live");
    while (true) {
        try {
            await checkEvents();
        } catch (e) {
            console.log("Err", e.message);
        }
        await sleep(POLL_INTERVAL);
    }
}

main();