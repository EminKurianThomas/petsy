const fs = require('fs');
const path = require('path');
const puppeteer = require('C:/Users/Emin Kurian Thomas/AppData/Local/npm-cache/_npx/668c188756b835f3/node_modules/puppeteer');

const tables = [
    {
        title: 'TABLE 1: users (User / Customer Entity — D1 Users)',
        cols: ['Column Name', 'Data Type', 'Constraint', 'Description'],
        rows: [
            ['id', 'UUID / VARCHAR(64)', 'PRIMARY KEY', 'Unique user identifier (Firebase Auth UID)'],
            ['name', 'VARCHAR(100)', 'NOT NULL', 'Full name of the customer, owner, or admin'],
            ['email', 'VARCHAR(150)', 'UNIQUE, NOT NULL', 'Registered account email address'],
            ['role', 'VARCHAR(20)', "DEFAULT 'customer'", 'System role: customer, admin, or caregiver'],
            ['active_pet_id', 'VARCHAR(64)', 'NULLABLE', 'Foreign key pointing to currently active pet'],
            ['theme_pref', 'VARCHAR(20)', "DEFAULT 'system'", 'UI theme preference: light, dark, or system'],
            ['avatar_url', 'TEXT', 'NULLABLE', 'Profile picture storage URI / cloud URL'],
            ['created_at', 'TIMESTAMPTZ', 'DEFAULT NOW()', 'Account creation timestamp']
        ]
    },
    {
        title: 'TABLE 2: pets (Pet Profile Entity — D2 Pets)',
        cols: ['Column Name', 'Data Type', 'Constraint', 'Description'],
        rows: [
            ['id', 'UUID / VARCHAR(64)', 'PRIMARY KEY', 'Unique pet identifier (pet_id)'],
            ['user_id', 'UUID / VARCHAR(64)', 'FOREIGN KEY', 'References users(id) ON DELETE CASCADE'],
            ['name', 'VARCHAR(100)', 'NOT NULL', 'Display name of the pet'],
            ['species', 'VARCHAR(50)', 'NOT NULL', 'Primary species categorization (e.g. Dog, Cat, Bird)'],
            ['breed', 'VARCHAR(100)', 'NOT NULL', 'Pedigree or breed specification'],
            ['gender', 'VARCHAR(20)', 'NOT NULL', 'Sex of the pet (Male / Female)'],
            ['age', 'VARCHAR(20)', 'NOT NULL', 'Formatted pet age string or birthday reference'],
            ['weight', 'NUMERIC(5,2)', 'NOT NULL', 'Current recorded weight in kilograms'],
            ['weight_unit', 'VARCHAR(10)', "DEFAULT 'kg'", 'Standard measurement unit (kg / lbs)'],
            ['emoji', 'VARCHAR(10)', "DEFAULT '🐶'", 'Visual avatar emoji identifier'],
            ['microchip', 'VARCHAR(50)', 'NULLABLE', 'Official RFID microchip identification code'],
            ['insurance', 'VARCHAR(100)', 'NULLABLE', 'Pet insurance policy provider and certificate ID'],
            ['emergency_vet', 'TEXT', 'NULLABLE', 'Designated emergency veterinary contact / clinic info'],
            ['created_at', 'TIMESTAMPTZ', 'DEFAULT NOW()', 'Pet profile registration timestamp']
        ]
    },
    {
        title: 'TABLE 3: reminders (Alerts & Reminders Entity — D3 Reminders)',
        cols: ['Column Name', 'Data Type', 'Constraint', 'Description'],
        rows: [
            ['id', 'UUID / VARCHAR(64)', 'PRIMARY KEY', 'Unique reminder identifier (reminder_id)'],
            ['pet_id', 'UUID / VARCHAR(64)', 'FOREIGN KEY', 'References pets(id) ON DELETE CASCADE'],
            ['user_id', 'UUID / VARCHAR(64)', 'FOREIGN KEY', 'References users(id) (Alert creator)'],
            ['category', 'VARCHAR(50)', 'NOT NULL', 'Category: vaccine, medication, vet, grooming, food'],
            ['title', 'VARCHAR(150)', 'NOT NULL', 'Reminder task headline / procedure name'],
            ['due_date', 'VARCHAR(50)', 'NOT NULL', 'Scheduled due date string or timestamp'],
            ['recurring', 'VARCHAR(30)', "DEFAULT 'None'", 'Recurrence pattern: None, Daily, Weekly, Monthly, Yearly'],
            ['status', 'VARCHAR(20)', "DEFAULT 'upcoming'", 'Lifecycle status: upcoming, due, overdue, completed'],
            ['notes', 'TEXT', 'NULLABLE', 'Dosage, clinic location, or administration notes'],
            ['created_at', 'TIMESTAMPTZ', 'DEFAULT NOW()', 'Reminder schedule creation timestamp']
        ]
    },
    {
        title: 'TABLE 4: records (Medical & Health History Entity — D4 Records)',
        cols: ['Column Name', 'Data Type', 'Constraint', 'Description'],
        rows: [
            ['id', 'UUID / VARCHAR(64)', 'PRIMARY KEY', 'Unique health record identifier (record_id)'],
            ['pet_id', 'UUID / VARCHAR(64)', 'FOREIGN KEY', 'References pets(id) ON DELETE CASCADE'],
            ['user_id', 'UUID / VARCHAR(64)', 'FOREIGN KEY', 'References users(id) (Record author)'],
            ['type', 'VARCHAR(50)', 'NOT NULL', 'Clinical tab: vaccinations, medications, surgeries, visits'],
            ['title', 'VARCHAR(150)', 'NOT NULL', 'Diagnosis headline, vaccine name, or clinic visit'],
            ['meta', 'TEXT', 'NOT NULL', 'Clinical notes, medication dosages, or doctor remarks'],
            ['doctor', 'VARCHAR(100)', 'NULLABLE', 'Attending licensed veterinarian or clinic name'],
            ['attachment_url', 'TEXT', 'NULLABLE', 'Attached diagnostic document or certificate cloud URL'],
            ['record_date', 'TIMESTAMPTZ', 'DEFAULT NOW()', 'Clinical administration date'],
            ['created_at', 'TIMESTAMPTZ', 'DEFAULT NOW()', 'Medical log entry timestamp']
        ]
    },
    {
        title: 'TABLE 5: weight_logs (Growth & Weight Tracking Entity — D5 Weight Logs)',
        cols: ['Column Name', 'Data Type', 'Constraint', 'Description'],
        rows: [
            ['id', 'UUID / VARCHAR(64)', 'PRIMARY KEY', 'Unique weight entry identifier (log_id)'],
            ['pet_id', 'UUID / VARCHAR(64)', 'FOREIGN KEY', 'References pets(id) ON DELETE CASCADE'],
            ['user_id', 'UUID / VARCHAR(64)', 'FOREIGN KEY', 'References users(id) (Pet owner)'],
            ['weight', 'NUMERIC(5,2)', 'NOT NULL', 'Recorded weight measurement value in kg'],
            ['weight_unit', 'VARCHAR(10)', "DEFAULT 'kg'", 'Weight unit metric specification'],
            ['evaluation', 'VARCHAR(50)', 'NULLABLE', 'Growth evaluation: Underweight, Ideal, Overweight'],
            ['food_plan', 'TEXT', 'NULLABLE', 'Automated nutritional recommendations based on weight'],
            ['exercise_plan', 'TEXT', 'NULLABLE', 'Recommended daily activity and exercise target'],
            ['logged_at', 'TIMESTAMPTZ', 'DEFAULT NOW()', 'Measurement timestamp for growth charts']
        ]
    },
    {
        title: 'TABLE 6: system_audit (Master Audit & Admin Logs — Admin Managed)',
        cols: ['Column Name', 'Data Type', 'Constraint', 'Description'],
        rows: [
            ['id', 'UUID / VARCHAR(64)', 'PRIMARY KEY', 'Master audit event identifier (log_id)'],
            ['admin_id', 'UUID / VARCHAR(64)', 'FOREIGN KEY', 'References users(id) (Admin operator)'],
            ['action_type', 'VARCHAR(50)', 'NOT NULL', 'Audited operation: USER_ROLE_MOD, PET_DELETE, EXPORT'],
            ['target_user_id', 'UUID / VARCHAR(64)', 'NULLABLE', 'References target affected users(id)'],
            ['target_pet_id', 'UUID / VARCHAR(64)', 'NULLABLE', 'References target affected pets(id)'],
            ['details', 'TEXT', 'NOT NULL', 'Audit description payload and state changes'],
            ['ip_address', 'VARCHAR(50)', 'NULLABLE', 'Client network IP address of operator'],
            ['status', 'VARCHAR(20)', "DEFAULT 'SUCCESS'", 'Execution status: SUCCESS, DENIED, or ERROR'],
            ['created_at', 'TIMESTAMPTZ', 'DEFAULT NOW()', 'Immutable system audit timestamp']
        ]
    }
];

function generateHtml() {
    let tablesHtml = '';

    tables.forEach(t => {
        let rowsHtml = '';
        t.rows.forEach(r => {
            rowsHtml += `
                <tr>
                    <td class="col-name">${r[0]}</td>
                    <td class="col-type">${r[1]}</td>
                    <td class="col-const">${r[2]}</td>
                    <td class="col-desc">${r[3]}</td>
                </tr>
            `;
        });

        tablesHtml += `
            <div class="table-block">
                <div class="table-title">${t.title}</div>
                <table class="spec-table">
                    <thead>
                        <tr>
                            <th style="width: 17%;">${t.cols[0]}</th>
                            <th style="width: 17%;">${t.cols[1]}</th>
                            <th style="width: 19%;">${t.cols[2]}</th>
                            <th style="width: 47%;">${t.cols[3]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                background: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                color: #000000;
                display: flex;
                justify-content: center;
                padding: 30px 40px;
            }
            .container {
                width: 900px;
            }
            .doc-header {
                text-align: center;
                margin-bottom: 22px;
            }
            .doc-title {
                font-size: 17px;
                font-weight: 800;
                letter-spacing: 0.5px;
                color: #000000;
                margin-bottom: 3px;
            }
            .doc-sub {
                font-size: 10px;
                font-style: italic;
                color: #555555;
            }
            .table-block {
                margin-bottom: 18px;
            }
            .table-title {
                font-size: 11px;
                font-weight: 800;
                color: #000000;
                margin-bottom: 4px;
                letter-spacing: 0.2px;
            }
            .spec-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #71717a;
                font-size: 9.2px;
            }
            .spec-table th {
                border: 1px solid #71717a;
                padding: 4px 6px;
                font-weight: 800;
                font-size: 9.5px;
                text-align: center;
                background: #ffffff;
                color: #000000;
            }
            .spec-table td {
                border: 1px solid #71717a;
                padding: 3px 6px;
                line-height: 1.25;
            }
            .col-name {
                font-weight: 700;
                font-family: 'Segoe UI', Arial, sans-serif;
            }
            .col-type {
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 8.8px;
                letter-spacing: -0.1px;
            }
            .col-const {
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 8.8px;
                letter-spacing: -0.1px;
            }
            .col-desc {
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 9px;
                color: #111111;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="doc-header">
                <div class="doc-title">3.2 PETSY — DATA DICTIONARY &amp; TABLE SPECIFICATIONS</div>
                <div class="doc-sub">Comprehensive Column Constraints, Data Types, and Schema Rules</div>
            </div>
            ${tablesHtml}
        </div>
    </body>
    </html>
    `;
}

function generateMarkdown() {
    let md = `# 3.2 PETSY — DATA DICTIONARY & TABLE SPECIFICATIONS\n*Comprehensive Column Constraints, Data Types, and Schema Rules*\n\n`;
    tables.forEach(t => {
        md += `### ${t.title}\n\n`;
        md += `| ${t.cols.join(' | ')} |\n`;
        md += `| ${t.cols.map(() => '---').join(' | ')} |\n`;
        t.rows.forEach(r => {
            md += `| **${r[0]}** | \`${r[1]}\` | ${r[2]} | ${r[3]} |\n`;
        });
        md += `\n`;
    });
    return md;
}

async function render() {
    const html = generateHtml();
    const md = generateMarkdown();
    
    const htmlPath = path.resolve('diagrams/minimal/data_dictionary.html');
    const mdPath = path.resolve('diagrams/minimal/data_dictionary.md');
    const pngPath = path.resolve('diagrams/minimal/data_dictionary.png');

    fs.writeFileSync(htmlPath, html, 'utf-8');
    fs.writeFileSync(mdPath, md, 'utf-8');
    console.log('Saved HTML & Markdown specifications.');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 980, height: 1600, deviceScaleFactor: 2.5 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const element = await page.$('.container');
    await element.screenshot({ path: pngPath });
    await browser.close();

    console.log('Rendered ultra-crisp PNG to:', pngPath);
}

render().catch(err => {
    console.error('Error rendering:', err);
    process.exit(1);
});
