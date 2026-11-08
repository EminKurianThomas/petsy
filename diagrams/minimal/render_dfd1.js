const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/Users/Emin Kurian Thomas/AppData/Local/npm-cache/_npx/668c188756b835f3/node_modules/puppeteer');

function generateDFD1Svg() {
    const width = 1380;
    
    // Layout coordinates
    const colLeftX = 185;
    const colLeftW = 195;
    const colLeftMid = colLeftX + colLeftW / 2;
    const colLeftRight = colLeftX + colLeftW;

    const colProcX = 690;
    const procRadius = 45;

    const colRightX = 995;
    const colRightW = 235;

    // Header occupies 0..115
    const startY = 175;
    const rowSpacing = 118;

    const rows = [
        {
            id: 'row1',
            type: 'login',
            y: startY,
            module: { title: 'Login with user type', sub: 'Customer & Admin' },
            proc: { num: '1.0', l1: 'Authen', l2: '(Verify Role)' },
            db: { id: 'D1', title: 'Login / Auth Store', path: 'public.profiles & auth.users' },
            req1: 'Request (Credentials, Role)',
            res1: 'Response (Session Token, Role Grants)',
            req2: 'Request (Verify Record)',
            res2: 'Response (Profile Record & UUID)'
        },
        {
            id: 'row2',
            type: 'admin',
            y: startY + rowSpacing * 1.35,
            module: { title: 'Admin Dash', sub: '[Admin Panel Module]' },
            proc: { num: '2.0', l1: 'Admin User', l2: '& System Mgmt' },
            db: { id: 'D1', title: 'Users Store', path: 'public.users / /users/{uid}' },
            req1: 'Request (View All Users & Manage System)',
            res1: 'Response (User Management & Stats Analytics)',
            req2: 'Request (Query All Registered User Profiles)',
            res2: 'Response (User Profiles, Email & Roles)'
        },
        {
            id: 'row3',
            type: 'customer',
            y: startY + rowSpacing * 2.52,
            module: { title: 'Home Dash', sub: '[Customer Dashboard]' },
            proc: { num: '3.0', l1: 'Home Dashboard', l2: '& Active Pet' },
            db: { id: 'D2', title: 'Pets Store', path: 'public.pets / /users/{uid}/pets' },
            req1: 'Request (View Active Pet & Reminders)',
            res1: 'Response (Pet Cards, Weight Preview & Tips)',
            req2: 'Request (Read Active Pet & Upcoming Alerts)',
            res2: 'Response (Pet Details, Weight Logs, Care Tips)'
        },
        {
            id: 'row4',
            type: 'customer',
            y: startY + rowSpacing * 3.52,
            module: { title: 'Pet Profile', sub: '[Pet Management Module]' },
            proc: { num: '4.0', l1: 'Pet Profile', l2: '& Growth Logs' },
            db: { id: 'D2', title: 'Pets Store', path: 'public.pets / /users/{uid}/pets' },
            req1: 'Request (Add / Edit / Delete Pet, Log Weight)',
            res1: 'Response (Updated Pet List & Growth Chart)',
            req2: 'Request (Write / Update / Delete Pet Record)',
            res2: 'Response (Pet Record Saved / Updated / Deleted)'
        },
        {
            id: 'row5',
            type: 'customer',
            y: startY + rowSpacing * 4.52,
            module: { title: 'Reminders', sub: '[Reminders & Alerts Module]' },
            proc: { num: '5.0', l1: 'Reminders', l2: '& Due Alerts' },
            db: { id: 'D3', title: 'Reminders Store', path: 'public.reminders / /reminders' },
            req1: 'Request (Create / Filter / Cycle Reminders)',
            res1: 'Response (Alert Notifications & Status Badges)',
            req2: 'Request (Insert / Update / Query Reminders)',
            res2: 'Response (Reminder Records & Due States)'
        },
        {
            id: 'row6',
            type: 'customer',
            y: startY + rowSpacing * 5.52,
            module: { title: 'Health Records', sub: '[Medical History Module]' },
            proc: { num: '6.0', l1: 'Health Records', l2: '& Medical Logs' },
            db: { id: 'D4', title: 'Records Store', path: 'public.records / /records' },
            req1: 'Request (Add Record, Vaccines/Meds, Export)',
            res1: 'Response (Medical History View & PDF Export)',
            req2: 'Request (Insert / Delete Record / Query Logs)',
            res2: 'Response (Vaccination & Clinic Entries)'
        },
        {
            id: 'row7',
            type: 'customer',
            y: startY + rowSpacing * 6.52,
            module: { title: 'Settings', sub: '[Settings & Preferences]' },
            proc: { num: '7.0', l1: 'Settings &', l2: 'User Account' },
            db: { id: 'D1', title: 'Users Store', path: 'public.users / /users/{uid}' },
            req1: 'Request (Toggle Theme / Change Account / Logout)',
            res1: 'Response (Theme Applied / Session Revoked)',
            req2: 'Request (Clear Auth State & Revoke Session)',
            res2: 'Response (Session Cleared / Logout Confirmed)'
        }
    ];

    const totalHeight = Math.round(startY + rowSpacing * 6.52 + 130);

    // Build SVG
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalHeight}" width="${width}" height="${totalHeight}">
    <defs>
        <style>
            .header-title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; font-weight: bold; fill: #111111; text-anchor: middle; }
            .header-sub { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 600; fill: #555555; text-anchor: middle; letter-spacing: 0.5px; }
            .header-main { font-family: 'Segoe UI', Arial, sans-serif; font-size: 19px; font-weight: 800; fill: #000000; text-anchor: middle; letter-spacing: 0.5px; }
            .header-proj { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; font-style: italic; fill: #444444; text-anchor: middle; }
            
            .box-rect { fill: #ffffff; stroke: #111111; stroke-width: 1.5; rx: 4; }
            .box-title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #111111; text-anchor: middle; }
            .box-sub { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; fill: #555555; text-anchor: middle; }
            
            .proc-circle { fill: #ffffff; stroke: #111111; stroke-width: 1.5; }
            .proc-num { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13.5px; font-weight: bold; fill: #111111; text-anchor: middle; }
            .proc-title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; font-weight: 600; fill: #111111; text-anchor: middle; }
            .proc-sub { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5px; fill: #333333; text-anchor: middle; }

            .db-path-line { stroke: #111111; stroke-width: 1.5; fill: none; }
            .db-id-line { stroke: #111111; stroke-width: 1.5; }
            .db-id { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; font-weight: bold; fill: #111111; text-anchor: middle; }
            .db-title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11.5px; font-weight: bold; fill: #111111; }
            .db-path { font-family: 'Segoe UI', 'Courier New', monospace; font-size: 9.5px; fill: #0284c7; }

            .arrow-line { stroke: #111111; stroke-width: 1.3; }
            .arrow-text-top { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; font-weight: 500; fill: #111111; text-anchor: middle; }
            .arrow-text-bot { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; font-weight: 500; fill: #111111; text-anchor: middle; }

            .branch-line { stroke: #0284c7; stroke-width: 1.5; fill: none; }
            .branch-badge { fill: #f0f9ff; stroke: #0284c7; stroke-width: 1.2; rx: 3; }
            .branch-text { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; font-weight: bold; fill: #0284c7; }
            .branch-label { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; font-weight: 600; font-style: italic; fill: #0284c7; }

            .group-bracket { stroke: #7c3aed; stroke-width: 1.5; fill: none; }
            .group-label { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; font-weight: bold; fill: #7c3aed; letter-spacing: 0.8px; }

            .footer-line { stroke: #111111; stroke-width: 1.5; }
            .footer-text1 { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; font-weight: 600; fill: #333333; text-anchor: middle; }
            .footer-text2 { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5px; fill: #666666; text-anchor: middle; }
        </style>

        <!-- Arrowhead Markers -->
        <marker id="arrow-right" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#111111" />
        </marker>
        <marker id="arrow-left" viewBox="0 0 10 10" refX="1.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 8.5 1.5 L 0 5 L 8.5 8.5 z" fill="#111111" />
        </marker>
        <marker id="branch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#0284c7" />
        </marker>
    </defs>

    <!-- Canvas Background -->
    <rect width="${width}" height="${totalHeight}" fill="#ffffff" />

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- HEADER -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <text x="${width/2}" y="32" class="header-title">Kristu Jayanti College (Autonomous) · Bengaluru</text>
    <text x="${width/2}" y="48" class="header-sub">DEPARTMENT OF COMPUTER SCIENCE — ACADEMIC PROJECT DOCUMENTATION</text>
    <text x="${width/2}" y="74" class="header-main">3.3.2 DATA FLOW DIAGRAM (DFD) — LEVEL 1</text>
    <text x="${width/2}" y="92" class="header-proj">Project: Petsy (Pet Care &amp; Health Management Platform) · Teacher Model Implementation</text>
    <line x1="50" y1="104" x2="${width - 50}" y2="104" stroke="#111111" stroke-width="1.8" />
`;

    // ══════════════════════════════════════════════════════════════════════
    // ROWS
    // ══════════════════════════════════════════════════════════════════════
    const arrowOffset = 17;
    // Calculate exact contact point with circle at y +/- arrowOffset
    const dxContact = Math.sqrt(procRadius * procRadius - arrowOffset * arrowOffset);

    rows.forEach(r => {
        const y = r.y;
        const boxH = 48;
        const dbH = 46;
        const dbIdW = 34;

        // Left Module Box
        svg += `
    <!-- ${r.id} : Module Box -->
    <rect x="${colLeftX}" y="${y - boxH/2}" width="${colLeftW}" height="${boxH}" class="box-rect" />
    <text x="${colLeftMid}" y="${y - 4}" class="box-title">${r.module.title}</text>
    <text x="${colLeftMid}" y="${y + 12}" class="box-sub">${r.module.sub}</text>

    <!-- ${r.id} : Arrows Module <-> Process -->
    <!-- Top Arrow: Module -> Process (Request) -->
    <line x1="${colLeftRight}" y1="${y - arrowOffset}" x2="${colProcX - dxContact}" y2="${y - arrowOffset}" class="arrow-line" marker-end="url(#arrow-right)" />
    <text x="${(colLeftRight + colProcX - dxContact)/2}" y="${y - arrowOffset - 5}" class="arrow-text-top">${r.req1}</text>

    <!-- Bottom Arrow: Process -> Module (Response) -->
    <line x1="${colProcX - dxContact}" y1="${y + arrowOffset}" x2="${colLeftRight}" y2="${y + arrowOffset}" class="arrow-line" marker-end="url(#arrow-left)" />
    <text x="${(colLeftRight + colProcX - dxContact)/2}" y="${y + arrowOffset + 12}" class="arrow-text-bot">${r.res1}</text>

    <!-- ${r.id} : Process Circle -->
    <circle cx="${colProcX}" cy="${y}" r="${procRadius}" class="proc-circle" />
    <text x="${colProcX}" y="${y - 12}" class="proc-num">${r.proc.num}</text>
    <text x="${colProcX}" y="${y + 3}" class="proc-title">${r.proc.l1}</text>
    <text x="${colProcX}" y="${y + 17}" class="proc-sub">${r.proc.l2}</text>

    <!-- ${r.id} : Arrows Process <-> Data Store -->
    <!-- Top Arrow: Process -> DB (Request) -->
    <line x1="${colProcX + dxContact}" y1="${y - arrowOffset}" x2="${colRightX}" y2="${y - arrowOffset}" class="arrow-line" marker-end="url(#arrow-right)" />
    <text x="${(colProcX + dxContact + colRightX)/2}" y="${y - arrowOffset - 5}" class="arrow-text-top">${r.req2}</text>

    <!-- Bottom Arrow: DB -> Process (Response) -->
    <line x1="${colRightX}" y1="${y + arrowOffset}" x2="${colProcX + dxContact}" y2="${y + arrowOffset}" class="arrow-line" marker-end="url(#arrow-left)" />
    <text x="${(colProcX + dxContact + colRightX)/2}" y="${y + arrowOffset + 12}" class="arrow-text-bot">${r.res2}</text>

    <!-- ${r.id} : Data Store (Gane-Sarson open-ended rectangle notation) -->
    <g>
        <!-- Top line, bottom line, left vertical line -->
        <path d="M ${colRightX + colRightW} ${y - dbH/2} H ${colRightX} V ${y + dbH/2} H ${colRightX + colRightW}" class="db-path-line" />
        <!-- Vertical divider line separating ID from Title -->
        <line x1="${colRightX + dbIdW}" y1="${y - dbH/2}" x2="${colRightX + dbIdW}" y2="${y + dbH/2}" class="db-id-line" />
        <!-- ID text -->
        <text x="${colRightX + dbIdW/2}" y="${y + 5}" class="db-id">${r.db.id}</text>
        <!-- Store Name and Path -->
        <text x="${colRightX + dbIdW + 12}" y="${y - 4}" class="db-title">${r.db.title}</text>
        <text x="${colRightX + dbIdW + 12}" y="${y + 12}" class="db-path">${r.db.path}</text>
    </g>
`;
    });

    // ══════════════════════════════════════════════════════════════════════
    // BRANCHING LOGIC & BRACKETS (as in reference model)
    // ══════════════════════════════════════════════════════════════════════
    const yRow1 = rows[0].y;
    const yRow2 = rows[1].y;
    const yRow3 = rows[2].y;
    const yRow7 = rows[6].y;

    // Login success badge below Login box
    const badgeX = colLeftX + 35;
    const badgeY = yRow1 + 32;
    const branchLineX = 55;

    svg += `
    <!-- Login Success Branching -->
    <rect x="${badgeX}" y="${badgeY}" width="98" height="19" class="branch-badge" />
    <text x="${badgeX + 8}" y="${badgeY + 14}" class="branch-text">login success:</text>

    <!-- Cyan branching line from Login down to Admin & Customer -->
    <path d="
        M ${badgeX} ${badgeY + 9.5}
        H ${branchLineX}
        V ${yRow2}
        H ${colLeftX}
    " class="branch-line" marker-end="url(#branch-arrow)" />
    <text x="${branchLineX + 6}" y="${yRow2 - 6}" class="branch-label">if admin login success:</text>

    <path d="
        M ${branchLineX} ${yRow2}
        V ${yRow3}
        H ${colLeftX}
    " class="branch-line" marker-end="url(#branch-arrow)" />
    <text x="${branchLineX + 6}" y="${yRow3 - 6}" class="branch-label">if customer login success:</text>

    <!-- Customer Modules Grouping Bracket on Left -->
    <path d="
        M ${colLeftX - 10} ${yRow3 - 22}
        H ${colLeftX - 22}
        V ${yRow7 + 22}
        H ${colLeftX - 10}
    " class="group-bracket" />
    <text x="${colLeftX - 28}" y="${(yRow3 + yRow7)/2}" class="group-label" transform="rotate(-90 ${colLeftX - 28} ${(yRow3 + yRow7)/2})" text-anchor="middle">CUSTOMER MODULES</text>
`;

    // ══════════════════════════════════════════════════════════════════════
    // FOOTER
    // ══════════════════════════════════════════════════════════════════════
    const footerY = totalHeight - 45;
    svg += `
    <!-- FOOTER -->
    <line x1="50" y1="${footerY}" x2="${width - 50}" y2="${footerY}" class="footer-line" />
    <text x="${width/2}" y="${footerY + 18}" class="footer-text1">Kristu Jayanti College Autonomous · Bengaluru | Department of Computer Science | Petsy Project Documentation</text>
    <text x="${width/2}" y="${footerY + 32}" class="footer-text2">Notation Standard: Gane-Sarson / Yourdon Level-1 DFD · Direct Faithful Transcription of Teacher's Architectural Model</text>
</svg>`;

    return svg;
}

async function render() {
    const svgContent = generateDFD1Svg();
    const svgPath = path.resolve('diagrams/minimal/dfd_1.svg');
    const pngPath = path.resolve('diagrams/minimal/dfd_1.png');

    fs.writeFileSync(svgPath, svgContent, 'utf-8');
    console.log('Saved SVG to:', svgPath);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1380, height: 1100, deviceScaleFactor: 2.5 });
    
    await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { background: #ffffff; display: flex; justify-content: center; }
            </style>
        </head>
        <body>
            ${svgContent}
        </body>
        </html>
    `, { waitUntil: 'networkidle0' });

    const element = await page.$('svg');
    await element.screenshot({ path: pngPath });
    await browser.close();

    console.log('Rendered ultra-crisp PNG to:', pngPath);
}

render().catch(err => {
    console.error('Error during rendering:', err);
    process.exit(1);
});
