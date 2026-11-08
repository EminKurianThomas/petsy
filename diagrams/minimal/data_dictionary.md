# 3.2 PETSY — DATA DICTIONARY & TABLE SPECIFICATIONS
*Comprehensive Column Constraints, Data Types, and Schema Rules*

### TABLE 1: users (User / Customer Entity — D1 Users)

| Column Name | Data Type | Constraint | Description |
| --- | --- | --- | --- |
| **id** | `UUID / VARCHAR(64)` | PRIMARY KEY | Unique user identifier (Firebase Auth UID) |
| **name** | `VARCHAR(100)` | NOT NULL | Full name of the customer, owner, or admin |
| **email** | `VARCHAR(150)` | UNIQUE, NOT NULL | Registered account email address |
| **role** | `VARCHAR(20)` | DEFAULT 'customer' | System role: customer, admin, or caregiver |
| **active_pet_id** | `VARCHAR(64)` | NULLABLE | Foreign key pointing to currently active pet |
| **theme_pref** | `VARCHAR(20)` | DEFAULT 'system' | UI theme preference: light, dark, or system |
| **avatar_url** | `TEXT` | NULLABLE | Profile picture storage URI / cloud URL |
| **created_at** | `TIMESTAMPTZ` | DEFAULT NOW() | Account creation timestamp |

### TABLE 2: pets (Pet Profile Entity — D2 Pets)

| Column Name | Data Type | Constraint | Description |
| --- | --- | --- | --- |
| **id** | `UUID / VARCHAR(64)` | PRIMARY KEY | Unique pet identifier (pet_id) |
| **user_id** | `UUID / VARCHAR(64)` | FOREIGN KEY | References users(id) ON DELETE CASCADE |
| **name** | `VARCHAR(100)` | NOT NULL | Display name of the pet |
| **species** | `VARCHAR(50)` | NOT NULL | Primary species categorization (e.g. Dog, Cat, Bird) |
| **breed** | `VARCHAR(100)` | NOT NULL | Pedigree or breed specification |
| **gender** | `VARCHAR(20)` | NOT NULL | Sex of the pet (Male / Female) |
| **age** | `VARCHAR(20)` | NOT NULL | Formatted pet age string or birthday reference |
| **weight** | `NUMERIC(5,2)` | NOT NULL | Current recorded weight in kilograms |
| **weight_unit** | `VARCHAR(10)` | DEFAULT 'kg' | Standard measurement unit (kg / lbs) |
| **emoji** | `VARCHAR(10)` | DEFAULT '🐶' | Visual avatar emoji identifier |
| **microchip** | `VARCHAR(50)` | NULLABLE | Official RFID microchip identification code |
| **insurance** | `VARCHAR(100)` | NULLABLE | Pet insurance policy provider and certificate ID |
| **emergency_vet** | `TEXT` | NULLABLE | Designated emergency veterinary contact / clinic info |
| **created_at** | `TIMESTAMPTZ` | DEFAULT NOW() | Pet profile registration timestamp |

### TABLE 3: reminders (Alerts & Reminders Entity — D3 Reminders)

| Column Name | Data Type | Constraint | Description |
| --- | --- | --- | --- |
| **id** | `UUID / VARCHAR(64)` | PRIMARY KEY | Unique reminder identifier (reminder_id) |
| **pet_id** | `UUID / VARCHAR(64)` | FOREIGN KEY | References pets(id) ON DELETE CASCADE |
| **user_id** | `UUID / VARCHAR(64)` | FOREIGN KEY | References users(id) (Alert creator) |
| **category** | `VARCHAR(50)` | NOT NULL | Category: vaccine, medication, vet, grooming, food |
| **title** | `VARCHAR(150)` | NOT NULL | Reminder task headline / procedure name |
| **due_date** | `VARCHAR(50)` | NOT NULL | Scheduled due date string or timestamp |
| **recurring** | `VARCHAR(30)` | DEFAULT 'None' | Recurrence pattern: None, Daily, Weekly, Monthly, Yearly |
| **status** | `VARCHAR(20)` | DEFAULT 'upcoming' | Lifecycle status: upcoming, due, overdue, completed |
| **notes** | `TEXT` | NULLABLE | Dosage, clinic location, or administration notes |
| **created_at** | `TIMESTAMPTZ` | DEFAULT NOW() | Reminder schedule creation timestamp |

### TABLE 4: records (Medical & Health History Entity — D4 Records)

| Column Name | Data Type | Constraint | Description |
| --- | --- | --- | --- |
| **id** | `UUID / VARCHAR(64)` | PRIMARY KEY | Unique health record identifier (record_id) |
| **pet_id** | `UUID / VARCHAR(64)` | FOREIGN KEY | References pets(id) ON DELETE CASCADE |
| **user_id** | `UUID / VARCHAR(64)` | FOREIGN KEY | References users(id) (Record author) |
| **type** | `VARCHAR(50)` | NOT NULL | Clinical tab: vaccinations, medications, surgeries, visits |
| **title** | `VARCHAR(150)` | NOT NULL | Diagnosis headline, vaccine name, or clinic visit |
| **meta** | `TEXT` | NOT NULL | Clinical notes, medication dosages, or doctor remarks |
| **doctor** | `VARCHAR(100)` | NULLABLE | Attending licensed veterinarian or clinic name |
| **attachment_url** | `TEXT` | NULLABLE | Attached diagnostic document or certificate cloud URL |
| **record_date** | `TIMESTAMPTZ` | DEFAULT NOW() | Clinical administration date |
| **created_at** | `TIMESTAMPTZ` | DEFAULT NOW() | Medical log entry timestamp |

### TABLE 5: weight_logs (Growth & Weight Tracking Entity — D5 Weight Logs)

| Column Name | Data Type | Constraint | Description |
| --- | --- | --- | --- |
| **id** | `UUID / VARCHAR(64)` | PRIMARY KEY | Unique weight entry identifier (log_id) |
| **pet_id** | `UUID / VARCHAR(64)` | FOREIGN KEY | References pets(id) ON DELETE CASCADE |
| **user_id** | `UUID / VARCHAR(64)` | FOREIGN KEY | References users(id) (Pet owner) |
| **weight** | `NUMERIC(5,2)` | NOT NULL | Recorded weight measurement value in kg |
| **weight_unit** | `VARCHAR(10)` | DEFAULT 'kg' | Weight unit metric specification |
| **evaluation** | `VARCHAR(50)` | NULLABLE | Growth evaluation: Underweight, Ideal, Overweight |
| **food_plan** | `TEXT` | NULLABLE | Automated nutritional recommendations based on weight |
| **exercise_plan** | `TEXT` | NULLABLE | Recommended daily activity and exercise target |
| **logged_at** | `TIMESTAMPTZ` | DEFAULT NOW() | Measurement timestamp for growth charts |

### TABLE 6: system_audit (Master Audit & Admin Logs — Admin Managed)

| Column Name | Data Type | Constraint | Description |
| --- | --- | --- | --- |
| **id** | `UUID / VARCHAR(64)` | PRIMARY KEY | Master audit event identifier (log_id) |
| **admin_id** | `UUID / VARCHAR(64)` | FOREIGN KEY | References users(id) (Admin operator) |
| **action_type** | `VARCHAR(50)` | NOT NULL | Audited operation: USER_ROLE_MOD, PET_DELETE, EXPORT |
| **target_user_id** | `UUID / VARCHAR(64)` | NULLABLE | References target affected users(id) |
| **target_pet_id** | `UUID / VARCHAR(64)` | NULLABLE | References target affected pets(id) |
| **details** | `TEXT` | NOT NULL | Audit description payload and state changes |
| **ip_address** | `VARCHAR(50)` | NULLABLE | Client network IP address of operator |
| **status** | `VARCHAR(20)` | DEFAULT 'SUCCESS' | Execution status: SUCCESS, DENIED, or ERROR |
| **created_at** | `TIMESTAMPTZ` | DEFAULT NOW() | Immutable system audit timestamp |

