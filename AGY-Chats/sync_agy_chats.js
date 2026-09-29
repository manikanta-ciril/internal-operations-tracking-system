const fs = require('fs');
const path = require('path');

const CONVERSATION_ID = '92cb7572-74bd-48d5-b9f1-f75b13419768';
const RESUME_CMD = `agy --conversation=${CONVERSATION_ID}`;
const inputPath = 'C:\\Users\\ciril\\.gemini\\antigravity-cli\\brain\\92cb7572-74bd-48d5-b9f1-f75b13419768\\.system_generated\\logs\\transcript_full.jsonl';

// Output directory (strictly single folder in internal-operations-tracking-system)
const targets = [
    'C:\\Users\\ciril\\OneDrive\\Desktop\\Manikanta-Files\\Git\\monitoring-portal\\internal-operations-tracking-system\\AGY-Chats'
];

function escapeCSV(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
}

function toLocalIST(isoStr) {
    if (!isoStr) return '';
    try {
        const d = new Date(isoStr);
        return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    } catch (_) {
        return isoStr;
    }
}

function processTranscript() {
    if (!fs.existsSync(inputPath)) {
        console.warn(`[AGY-Chats] Transcript not found at: ${inputPath}`);
        return;
    }

    const raw = fs.readFileSync(inputPath, 'utf8');
    const lines = raw.split(/\r?\n/);

    const turnsByDate = {}; // 'YYYY-MM-DD': [ { sender, time, localTime, text, summary } ]
    let turnCount = 0;

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const entry = JSON.parse(line);
            let sender = null;
            let content = '';

            if (entry.type === 'USER_INPUT' && entry.content) {
                sender = 'USER';
                const match = entry.content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
                content = match ? match[1].trim() : entry.content.trim();
            } else if (entry.type === 'PLANNER_RESPONSE' && entry.content) {
                sender = 'ASSISTANT';
                content = entry.content.trim();
            }

            if (sender && content) {
                turnCount++;
                const isoTime = entry.created_at || new Date().toISOString();
                const dateKey = isoTime.substring(0, 10);
                const localTime = toLocalIST(isoTime);

                const summary = content.replace(/\r?\n/g, ' ').substring(0, 120) + (content.length > 120 ? '...' : '');

                if (!turnsByDate[dateKey]) turnsByDate[dateKey] = [];
                turnsByDate[dateKey].push({
                    turn: turnCount,
                    isoTime,
                    localTime,
                    sender,
                    content,
                    summary
                });
            }
        } catch (_) {}
    }

    for (const outDir of targets) {
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        // Write batch resume launcher script
        const batPath = path.join(outDir, 'RESUME_SESSION.bat');
        const batContent = `@echo off\r\necho ================================================================================\r\necho  RESUMING ANTIGRAVITY CONVERSATION: ${CONVERSATION_ID}\r\necho ================================================================================\r\n${RESUME_CMD}\r\npause\r\n`;
        fs.writeFileSync(batPath, batContent, 'utf8');

        // Write day-to-day CSV and Markdown logs
        for (const [dateKey, turns] of Object.entries(turnsByDate)) {
            // 1. CSV for Excel
            const csvPath = path.join(outDir, `AGY_Chat_Log_${dateKey}.csv`);
            const csvRows = [
                ['Turn', 'Timestamp_UTC', 'Local_Time_IST', 'Sender', 'Conversation_ID', 'Resume_Command', 'Summary', 'Full_Message'].map(escapeCSV).join(',')
            ];

            for (const t of turns) {
                csvRows.push([
                    t.turn,
                    t.isoTime,
                    t.localTime,
                    t.sender,
                    CONVERSATION_ID,
                    RESUME_CMD,
                    t.summary,
                    t.content
                ].map(escapeCSV).join(','));
            }
            fs.writeFileSync(csvPath, csvRows.join('\r\n'), 'utf8');

            // 2. Markdown log for human reading
            const mdPath = path.join(outDir, `AGY_Chat_Log_${dateKey}.md`);
            const mdLines = [
                `# AGY Chat Audit Log — ${dateKey}`,
                `**Conversation ID**: \`${CONVERSATION_ID}\``,
                `**Resume Command**: \`${RESUME_CMD}\``,
                `**Date**: ${dateKey}`,
                `**Total Turns Recorded**: ${turns.length}`,
                `\n---\n`
            ];

            for (const t of turns) {
                mdLines.push(`### [Turn ${t.turn}] ${t.sender} — ${t.localTime} (${t.isoTime})`);
                mdLines.push(`**Resume Command**: \`${RESUME_CMD}\``);
                mdLines.push(`\n\`\`\`text\n${t.content}\n\`\`\`\n`);
            }
            fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
        }

        // Master Index CSV
        const indexCsv = path.join(outDir, 'SESSIONS_INDEX.csv');
        const indexRows = [
            ['Conversation_ID', 'Resume_Command', 'Total_Turns', 'Latest_Activity_IST', 'CSV_Logs', 'Markdown_Logs'].map(escapeCSV).join(',')
        ];
        const dates = Object.keys(turnsByDate);
        const latestTurn = dates.length ? turnsByDate[dates[dates.length - 1]].slice(-1)[0] : null;
        indexRows.push([
            CONVERSATION_ID,
            RESUME_CMD,
            turnCount,
            latestTurn ? latestTurn.localTime : '',
            dates.map(d => `AGY_Chat_Log_${d}.csv`).join('; '),
            dates.map(d => `AGY_Chat_Log_${d}.md`).join('; ')
        ].map(escapeCSV).join(','));
        fs.writeFileSync(indexCsv, indexRows.join('\r\n'), 'utf8');
    }

    console.log(`[AGY-Chats] Synced ${turnCount} turns across ${Object.keys(turnsByDate).length} day(s) into CSV & Markdown logs.`);
}

// Initial full sync
processTranscript();

// Continuous watcher
fs.watchFile(inputPath, { interval: 1500 }, () => {
    try {
        processTranscript();
    } catch (e) {
        console.error('[AGY-Chats] Watcher sync error:', e);
    }
});

console.log('[AGY-Chats] Active real-time Excel CSV and Markdown logger is running.');
