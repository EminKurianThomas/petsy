const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/Users/Emin Kurian Thomas/AppData/Local/npm-cache/_npx/668c188756b835f3/node_modules/puppeteer');

function generateGanttSvg() {
    const width = 1440;
    
    // Geometry
    const tableX = 30;
    const tableW = width - tableX * 2; // 1380
    const colLeftW = 505;
    const gridX = tableX + colLeftW; // 535
    const gridW = tableW - colLeftW; // 875
    const numWeeks = 12;
    const weekW = gridW / numWeeks; // ~72.9px

    // Headers
    const startY = 115;
    const monthHeaderH = 22;
    const weekHeaderH = 22;
    const headerTotalH = monthHeaderH + weekHeaderH; // 44

    // Data definition
    const phases = [
        {
            phaseTitle: 'PHASE 1: PROJECT PLANNING & FEASIBILITY ANALYSIS',
            phaseColor: '#0284c7',
            tasks: [
                {
                    wbs: '1.1',
                    title: 'Project Planning & Feasibility Study',
                    desc: 'Project Charter, Scope, Technical & Operational Feasibility Analysis',
                    role: 'PLANNING',
                    roleColor: '#0284c7',
                    startWeek: 1.0,
                    duration: 1.0,
                    text: '1.0 Wk [100% Done]',
                    barColor: '#0284c7'
                }
            ]
        },
        {
            phaseTitle: 'PHASE 2: REQUIREMENT ANALYSIS & SPECIFICATION',
            phaseColor: '#0284c7',
            tasks: [
                {
                    wbs: '2.1',
                    title: 'Requirements Gathering & IEEE SRS Specification',
                    desc: 'Functional & Non-Functional Specs, Pet Parent Personas & System Constraints',
                    role: 'ANALYSIS',
                    roleColor: '#0284c7',
                    startWeek: 2.0,
                    duration: 1.0,
                    text: '1.0 Wk [100% Done]',
                    barColor: '#0369a1'
                }
            ]
        },
        {
            phaseTitle: 'PHASE 3: SYSTEM DESIGN & DATABASE ARCHITECTURE',
            phaseColor: '#0d9488',
            tasks: [
                {
                    wbs: '3.1',
                    title: 'System Architecture, ERD & Level-0/1 DFD Design',
                    desc: 'High-Level Mobile Architecture, Firestore NoSQL Collections & DFD Models',
                    role: 'DESIGN',
                    roleColor: '#0d9488',
                    startWeek: 3.0,
                    duration: 1.0,
                    text: '1.0 Wk [100% Done]',
                    barColor: '#0f766e'
                }
            ]
        },
        {
            phaseTitle: 'PHASE 4: CODING & MODULE IMPLEMENTATION (CORE APPLICATION LOGIC)',
            phaseColor: '#2563eb',
            tasks: [
                {
                    wbs: '4.1',
                    title: 'Module 1: User Auth & Multi-Role Access (Customer & Admin)',
                    desc: 'AuthScreen.js, Firebase Auth, Session Persistence, Role Verification Logic',
                    role: 'CODING',
                    roleColor: '#2563eb',
                    startWeek: 3.8,
                    duration: 2.0,
                    text: '2.0 Wks [100% Done]',
                    barColor: '#2563eb'
                },
                {
                    wbs: '4.2',
                    title: 'Module 2: Admin Dashboard & System Management',
                    desc: 'Admin Panel, User Accounts Management, System Analytics & Auditing',
                    role: 'CODING',
                    roleColor: '#4f46e5',
                    startWeek: 4.8,
                    duration: 2.0,
                    text: '2.0 Wks [100% Done]',
                    barColor: '#4f46e5'
                },
                {
                    wbs: '4.3',
                    title: 'Module 3: Customer Home Dashboard & Active Pet Switching',
                    desc: 'HomeScreen.js, Active Pet Selector, Weight Preview, Care Tips & Dynamic Banner',
                    role: 'CODING',
                    roleColor: '#7c3aed',
                    startWeek: 5.4,
                    duration: 2.4,
                    text: '2.4 Wks [100% Done]',
                    barColor: '#7c3aed'
                },
                {
                    wbs: '4.4',
                    title: 'Module 4: Pet Profile Management & Multi-Pet CRUD',
                    desc: 'ProfileScreen.js, AddPetForm.js, Breed/Species/DOB Details, Profile Cards',
                    role: 'CODING',
                    roleColor: '#059669',
                    startWeek: 6.0,
                    duration: 2.4,
                    text: '2.4 Wks [100% Done]',
                    barColor: '#059669'
                },
                {
                    wbs: '4.5',
                    title: 'Module 5: Weight Tracker & Interactive Growth Charts',
                    desc: 'LogWeightForm.js, Historical Weight Tracking, Chart Visualization, Ideal Range',
                    role: 'CODING',
                    roleColor: '#dc2626',
                    startWeek: 6.8,
                    duration: 2.2,
                    text: '2.2 Wks [100% Done]',
                    barColor: '#dc2626'
                },
                {
                    wbs: '4.6',
                    title: 'Module 6: Reminders & Alerts Management System',
                    desc: 'RemindersScreen.js, AddReminderForm.js, Date/Time Picker, Category Filter, Due States',
                    role: 'CODING',
                    roleColor: '#0284c7',
                    startWeek: 7.4,
                    duration: 2.4,
                    text: '2.4 Wks [100% Done]',
                    barColor: '#0284c7'
                },
                {
                    wbs: '4.7',
                    title: 'Module 7: Health & Medical Records Management',
                    desc: 'RecordsScreen.js, AddRecordForm.js, Vaccinations, Medications, Vet Visits, Data Export',
                    role: 'CODING',
                    roleColor: '#d97706',
                    startWeek: 8.2,
                    duration: 2.2,
                    text: '2.2 Wks [100% Done]',
                    barColor: '#d97706'
                },
                {
                    wbs: '4.8',
                    title: 'Module 8: Settings, Theme Engine & User Account',
                    desc: 'SettingsScreen.js, Dark/Light/System Mode, Profile Updates, Secure Sign-Out',
                    role: 'CODING',
                    roleColor: '#9333ea',
                    startWeek: 9.0,
                    duration: 2.0,
                    text: '2.0 Wks [100% Done]',
                    barColor: '#9333ea'
                }
            ]
        },
        {
            phaseTitle: 'PHASE 5: TESTING & QUALITY ASSURANCE',
            phaseColor: '#ea580c',
            tasks: [
                {
                    wbs: '5.1',
                    title: 'Unit & Component Testing (React Native & Forms)',
                    desc: 'Jest Test Suites, Input Validations, Firestore Mock Testing, State Flows',
                    role: 'TESTING',
                    roleColor: '#ea580c',
                    startWeek: 9.6,
                    duration: 2.0,
                    text: '2.0 Wks [100% Done]',
                    barColor: '#ea580c'
                },
                {
                    wbs: '5.2',
                    title: 'User Acceptance Testing (UAT) & Performance Audit',
                    desc: 'End-to-End User Journeys, Expo Mobile Device Testing, Accessibility & UI QA',
                    role: 'TESTING',
                    roleColor: '#ea580c',
                    startWeek: 10.4,
                    duration: 1.6,
                    text: '1.6 Wks [100% Done]',
                    barColor: '#c2410c'
                }
            ]
        },
        {
            phaseTitle: 'PHASE 6: DEPLOYMENT & EXPO BUILD INFRASTRUCTURE',
            phaseColor: '#1e293b',
            tasks: [
                {
                    wbs: '6.1',
                    title: 'Mobile Build & Production Setup (EAS / Web Build)',
                    desc: 'Expo EAS Build, Android APK Generation, Firebase Cloud Rules & Web Hosting',
                    role: 'DEPLOYMENT',
                    roleColor: '#334155',
                    startWeek: 11.0,
                    duration: 1.0,
                    text: '1.0 Wk [100% Done]',
                    barColor: '#334155'
                }
            ]
        },
        {
            phaseTitle: 'PHASE 7: MAINTENANCE, FINAL DOCUMENTATION & VIVA-VOCE DEFENSE',
            phaseColor: '#15803d',
            tasks: [
                {
                    wbs: '7.1',
                    title: 'Final Project Documentation & Viva-Voce Defense',
                    desc: 'Kristu Jayanti Academic Report Binding, Level-1 DFD, ERD, Presentation Deck & Defense',
                    role: 'DOCUMENTATION',
                    roleColor: '#15803d',
                    startWeek: 11.5,
                    duration: 1.0,
                    text: '1.0 Wk [100% Done]',
                    barColor: '#15803d'
                }
            ]
        }
    ];

    // Compute row heights and offsets
    const phaseBannerH = 26;
    const taskRowH = 35;

    let currentY = startY + headerTotalH;
    const renderItems = [];

    phases.forEach(p => {
        renderItems.push({ type: 'phase', y: currentY, h: phaseBannerH, phase: p });
        currentY += phaseBannerH;
        p.tasks.forEach(t => {
            renderItems.push({ type: 'task', y: currentY, h: taskRowH, task: t, phaseColor: p.phaseColor });
            currentY += taskRowH;
        });
    });

    const tableBottomY = currentY;

    // Milestones block
    const milestonesY = tableBottomY + 16;
    const milestonesH = 82;

    // Footer
    const footerY = milestonesY + milestonesH + 24;
    const totalHeight = footerY + 45;

    // Month headers definition
    const months = [
        { name: 'AUGUST 2026 (Weeks 1 - 4)', startW: 0, weeks: 4, bg: '#0b2341' },
        { name: 'SEPTEMBER 2026 (Weeks 5 - 8)', startW: 4, weeks: 4, bg: '#06373a' },
        { name: 'OCTOBER 2026 (Weeks 9 - 12)', startW: 8, weeks: 4, bg: '#1c1f38' }
    ];

    const weekDates = [
        { w: 'W1', d: 'Aug 01-07' },
        { w: 'W2', d: 'Aug 08-14' },
        { w: 'W3', d: 'Aug 15-21' },
        { w: 'W4', d: 'Aug 22-28' },
        { w: 'W5', d: 'Sep 01-07' },
        { w: 'W6', d: 'Sep 08-14' },
        { w: 'W7', d: 'Sep 15-21' },
        { w: 'W8', d: 'Sep 22-28' },
        { w: 'W9', d: 'Oct 01-07' },
        { w: 'W10', d: 'Oct 08-14' },
        { w: 'W11', d: 'Oct 15-21' },
        { w: 'W12', d: 'Oct 22-28' }
    ];

    // Build SVG
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalHeight}" width="${width}" height="${totalHeight}">
    <defs>
        <style>
            .header-title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; font-weight: bold; fill: #111111; text-anchor: middle; }
            .header-sub { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; font-weight: 600; fill: #555555; text-anchor: middle; letter-spacing: 0.5px; }
            .header-main { font-family: 'Segoe UI', Arial, sans-serif; font-size: 20px; font-weight: 800; fill: #000000; text-anchor: middle; letter-spacing: 0.5px; }
            .header-proj { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11.5px; font-style: italic; fill: #444444; text-anchor: middle; }
            
            .th-left-title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #ffffff; text-anchor: middle; letter-spacing: 0.5px; }
            .th-left-sub { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; font-weight: 500; fill: #cbd5e1; text-anchor: middle; letter-spacing: 0.3px; }
            
            .th-month { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: bold; fill: #ffffff; text-anchor: middle; letter-spacing: 0.4px; }
            .th-week { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; font-weight: bold; fill: #ffffff; text-anchor: middle; }
            .th-date { font-family: 'Segoe UI', Arial, sans-serif; font-size: 7.5px; fill: #cbd5e1; text-anchor: middle; }

            .phase-title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; font-weight: 800; fill: #0f172a; letter-spacing: 0.3px; }
            
            .wbs-badge { fill: #0f172a; rx: 2; }
            .wbs-text { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; font-weight: bold; fill: #ffffff; text-anchor: middle; }
            .task-title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; font-weight: bold; fill: #0f172a; }
            .task-desc { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5px; fill: #64748b; }

            .role-badge { fill: #ffffff; stroke-width: 1; rx: 3; }
            .role-text { font-family: 'Segoe UI', Arial, sans-serif; font-size: 7.5px; font-weight: bold; text-anchor: middle; }

            .bar-rect { rx: 3; stroke-width: 0.5; stroke: rgba(0,0,0,0.25); }
            .bar-text { font-family: 'Arial Narrow', 'Segoe UI', Arial, sans-serif; font-size: 7.2px; font-weight: bold; fill: #ffffff; text-anchor: middle; letter-spacing: -0.15px; }

            .grid-line { stroke: #e2e8f0; stroke-width: 0.8; }
            .month-sep-line { stroke: #94a3b8; stroke-width: 1.2; }
            .row-line { stroke: #f1f5f9; stroke-width: 0.8; }

            .ms-header { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5px; font-weight: 800; fill: #0f172a; letter-spacing: 0.5px; }
            .ms-card-bg { fill: #ffffff; stroke: #e2e8f0; stroke-width: 1; rx: 4; }
            .ms-tag { rx: 2; }
            .ms-tag-text { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8px; font-weight: bold; fill: #ffffff; text-anchor: middle; }
            .ms-title { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9.5px; font-weight: bold; fill: #0f172a; }
            .ms-desc { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8px; fill: #64748b; }

            .footer-line { stroke: #111111; stroke-width: 1.5; }
            .footer-text1 { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; font-weight: 600; fill: #333333; text-anchor: middle; }
            .footer-text2 { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; fill: #666666; text-anchor: middle; }
        </style>
    </defs>

    <!-- Canvas Background -->
    <rect width="${width}" height="${totalHeight}" fill="#ffffff" />

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- HEADER -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <text x="${width/2}" y="30" class="header-title">Kristu Jayanti College (Autonomous) · Bengaluru</text>
    <text x="${width/2}" y="46" class="header-sub">DEPARTMENT OF COMPUTER SCIENCE — ACADEMIC PROJECT DOCUMENTATION</text>
    <text x="${width/2}" y="72" class="header-main">PROJECT GANTT CHART &amp; COMPLETE SDLC IMPLEMENTATION SCHEDULE</text>
    <text x="${width/2}" y="90" class="header-proj">Project: Petsy (Pet Care &amp; Health Management Platform) · Planning, Requirement Analysis, Design, Coding (All Modules), Testing &amp; Deployment</text>
    <line x1="${tableX}" y1="102" x2="${tableX + tableW}" y2="102" stroke="#111111" stroke-width="1.8" />

    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- TABLE HEADER BAR -->
    <!-- ══════════════════════════════════════════════════════════════════════ -->
    <!-- Left Column Header -->
    <rect x="${tableX}" y="${startY}" width="${colLeftW}" height="${headerTotalH}" fill="#0f172a" />
    <text x="${tableX + colLeftW/2}" y="${startY + 18}" class="th-left-title">SDLC PHASES &amp; FUNCTIONAL MODULE WORK PACKAGES</text>
    <text x="${tableX + colLeftW/2}" y="${startY + 34}" class="th-left-sub">WBS Code  ·  SDLC Phase / Module Name  ·  Component Reference  ·  Role</text>

    <!-- Month Headers -->
`;

    // Render 3 month headers
    months.forEach(m => {
        const mx = gridX + m.startW * weekW;
        const mw = m.weeks * weekW;
        svg += `
    <rect x="${mx}" y="${startY}" width="${mw}" height="${monthHeaderH}" fill="${m.bg}" stroke="#ffffff" stroke-width="0.5" />
    <text x="${mx + mw/2}" y="${startY + 15}" class="th-month">${m.name}</text>
`;
    });

    // Render 12 week headers
    weekDates.forEach((w, i) => {
        const wx = gridX + i * weekW;
        const parentMonth = months[Math.floor(i / 4)];
        svg += `
    <rect x="${wx}" y="${startY + monthHeaderH}" width="${weekW}" height="${weekHeaderH}" fill="${parentMonth.bg}" opacity="0.88" stroke="#ffffff" stroke-width="0.4" />
    <text x="${wx + weekW/2}" y="${startY + monthHeaderH + 11}" class="th-week">${w.w}</text>
    <text x="${wx + weekW/2}" y="${startY + monthHeaderH + 19}" class="th-date">${w.d}</text>
`;
    });

    // Outer table border & vertical grid lines behind the rows
    svg += `
    <!-- Outer Table Frame -->
    <rect x="${tableX}" y="${startY}" width="${tableW}" height="${tableBottomY - startY}" fill="none" stroke="#0f172a" stroke-width="1.2" />
    <line x1="${gridX}" y1="${startY}" x2="${gridX}" y2="${tableBottomY}" stroke="#0f172a" stroke-width="1.2" />
`;

    // Vertical grid lines across all rows
    for (let i = 1; i < numWeeks; i++) {
        const gx = gridX + i * weekW;
        const isMonthSep = (i % 4 === 0);
        svg += `
    <line x1="${gx}" y1="${startY + headerTotalH}" x2="${gx}" y2="${tableBottomY}" class="${isMonthSep ? 'month-sep-line' : 'grid-line'}" />
`;
    }

    // Render Rows
    renderItems.forEach(item => {
        if (item.type === 'phase') {
            svg += `
    <!-- Phase Banner: ${item.phase.phaseTitle} -->
    <rect x="${tableX}" y="${item.y}" width="${colLeftW}" height="${item.h}" fill="#f0f9ff" stroke="#e0f2fe" stroke-width="0.8" />
    <rect x="${gridX}" y="${item.y}" width="${gridW}" height="${item.h}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.8" />
    <line x1="${tableX}" y1="${item.y}" x2="${tableX}" y2="${item.y + item.h}" stroke="${item.phase.phaseColor}" stroke-width="4.5" />
    <text x="${tableX + 12}" y="${item.y + 17}" class="phase-title" fill="${item.phase.phaseColor}">${item.phase.phaseTitle}</text>
    <line x1="${tableX}" y1="${item.y + item.h}" x2="${tableX + tableW}" y2="${item.y + item.h}" stroke="#cbd5e1" stroke-width="0.8" />
`;
        } else if (item.type === 'task') {
            const t = item.task;
            const rowMidY = item.y + item.h / 2;

            svg += `
    <!-- Task: ${t.wbs} ${t.title} -->
    <rect x="${tableX}" y="${item.y}" width="${colLeftW}" height="${item.h}" fill="#ffffff" />
    <line x1="${tableX}" y1="${item.y + item.h}" x2="${tableX + tableW}" y2="${item.y + item.h}" class="row-line" />

    <!-- WBS Badge -->
    <rect x="${tableX + 10}" y="${rowMidY - 9}" width="22" height="18" class="wbs-badge" />
    <text x="${tableX + 21}" y="${rowMidY + 3.5}" class="wbs-text">${t.wbs}</text>

    <!-- Task Title & Desc -->
    <text x="${tableX + 38}" y="${rowMidY - 2}" class="task-title">${t.title}</text>
    <text x="${tableX + 38}" y="${rowMidY + 10}" class="task-desc">${t.desc}</text>

    <!-- Role Badge -->
    <rect x="${gridX - 78}" y="${rowMidY - 8}" width="68" height="16" class="role-badge" stroke="${t.roleColor}" />
    <text x="${gridX - 44}" y="${rowMidY + 3.5}" class="role-text" fill="${t.roleColor}">${t.role}</text>
`;

            // Gantt Bar on grid
            const barStartX = gridX + (t.startWeek - 1.0) * weekW;
            const barW = t.duration * weekW;
            const barH = 18;
            const barY = rowMidY - barH / 2;

            svg += `
    <!-- Gantt Bar -->
    <rect x="${barStartX}" y="${barY}" width="${barW}" height="${barH}" fill="${t.barColor}" class="bar-rect" />
    <text x="${barStartX + barW/2}" y="${barY + 11.5}" class="bar-text">${t.text}</text>
`;
        }
    });

    // ══════════════════════════════════════════════════════════════════════
    // BOTTOM MILESTONES BLOCK (SDLC GATES)
    // ══════════════════════════════════════════════════════════════════════
    const milestones = [
        {
            tag: 'M1 (Aug W2)',
            tagColor: '#0284c7',
            title: 'Planning & SRS Sign-Off',
            desc: 'Feasibility & IEEE Specification Approved'
        },
        {
            tag: 'M2 (Aug W4)',
            tagColor: '#0f766e',
            title: 'Architecture & Schema Frozen',
            desc: 'Firestore Collections, ERD & Level-0/1 DFD Deployed'
        },
        {
            tag: 'M3 (Sep W4)',
            tagColor: '#dc2626',
            title: 'Core Pet Profile & Weight Engine',
            desc: 'Multi-Pet CRUD, Profile Cards & Growth Chart Done'
        },
        {
            tag: 'M4 (Oct W2)',
            tagColor: '#059669',
            title: 'Feature Complete / Code Freeze',
            desc: 'Reminders, Health Records, Settings & UAT Passed'
        },
        {
            tag: 'M5 (Oct W4)',
            tagColor: '#d97706',
            title: 'Mobile APK Release & Viva Defense',
            desc: 'Expo Mobile Build, Bound Report & Final Defense'
        }
    ];

    svg += `
    <!-- Milestones Outer Box -->
    <rect x="${tableX}" y="${milestonesY}" width="${tableW}" height="${milestonesH}" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" rx="5" />
    <text x="${tableX + 16}" y="${milestonesY + 17}" class="ms-header">KEY ACADEMIC MILESTONES &amp; SPRINT DELIVERABLES (SDLC GATES)</text>
`;

    const msCardW = (tableW - 32 - 4 * 12) / 5;
    milestones.forEach((m, idx) => {
        const mx = tableX + 16 + idx * (msCardW + 12);
        const my = milestonesY + 26;
        const mh = 46;

        svg += `
    <g>
        <rect x="${mx}" y="${my}" width="${msCardW}" height="${mh}" class="ms-card-bg" />
        <rect x="${mx + 7}" y="${my + 6}" width="68" height="13" fill="${m.tagColor}" class="ms-tag" />
        <text x="${mx + 41}" y="${my + 15.5}" class="ms-tag-text">${m.tag}</text>
        <text x="${mx + 7}" y="${my + 29}" class="ms-title">${m.title}</text>
        <text x="${mx + 7}" y="${my + 40}" class="ms-desc">${m.desc}</text>
    </g>
`;
    });

    // ══════════════════════════════════════════════════════════════════════
    // FOOTER
    // ══════════════════════════════════════════════════════════════════════
    svg += `
    <!-- Footer -->
    <line x1="${tableX}" y1="${footerY}" x2="${tableX + tableW}" y2="${footerY}" class="footer-line" />
    <text x="${width/2}" y="${footerY + 18}" class="footer-text1">Kristu Jayanti College Autonomous · Bengaluru | Department of Computer Science | Petsy Project Documentation</text>
    <text x="${width/2}" y="${footerY + 32}" class="footer-text2">Methodology: Agile/Scrum SDLC Lifecycle with Bi-Weekly Sprints · Total Project Duration: 12 Calendar Weeks</text>
</svg>`;

    return svg;
}

async function render() {
    const svgContent = generateGanttSvg();
    const svgPath = path.resolve('diagrams/minimal/gantt_chart.svg');
    const pngPath = path.resolve('diagrams/minimal/gantt_chart.png');

    fs.writeFileSync(svgPath, svgContent, 'utf-8');
    console.log('Saved SVG to:', svgPath);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1050, deviceScaleFactor: 2.5 });
    
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
