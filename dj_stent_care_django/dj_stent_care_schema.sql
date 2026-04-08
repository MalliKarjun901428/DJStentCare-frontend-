-- ============================================================
-- DJ Stent Care - Database Schema
-- Database: dj_stent_care
-- Compatible with: MariaDB 10.4+ / MySQL 5.7+
-- 
-- HOW TO IMPORT:
--   In phpMyAdmin → Select database → Import → Choose this file
--   OR via command line:
--   mysql -u root -p dj_stent_care < dj_stent_care_schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS `dj_stent_care`
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `dj_stent_care`;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
    `id`            INT             NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `role`          ENUM('doctor','patient','admin') NOT NULL DEFAULT 'patient',
    `email`         VARCHAR(100)    NOT NULL UNIQUE,
    `password`      VARCHAR(255)    NOT NULL,
    `full_name`     VARCHAR(100)    NOT NULL,
    `phone`         VARCHAR(20)     NULL,
    `profile_image` VARCHAR(255)    NULL,
    `is_verified`   TINYINT(1)      NOT NULL DEFAULT 0,
    `is_approved`   TINYINT(1)      NOT NULL DEFAULT 1,
    `otp_code`      VARCHAR(6)      NULL,
    `otp_expiry`    DATETIME        NULL,
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- HOSPITALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `hospitals` (
    `id`         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name`       VARCHAR(200) NOT NULL,
    `address`    TEXT         NULL,
    `phone`      VARCHAR(20)  NULL,
    `email`      VARCHAR(100) NULL,
    `is_active`  TINYINT(1)   NOT NULL DEFAULT 1,
    `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DOCTORS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `doctors` (
    `id`              INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id`         INT          NOT NULL UNIQUE,
    `specialization`  VARCHAR(100) NULL,
    `hospital_id`     INT          NULL,
    `license_number`  VARCHAR(50)  NULL,
    `total_patients`  INT          NOT NULL DEFAULT 0,
    `active_stents`   INT          NOT NULL DEFAULT 0,
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`)     REFERENCES `users`(`id`)     ON DELETE CASCADE,
    FOREIGN KEY (`hospital_id`) REFERENCES `hospitals`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PATIENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `patients` (
    `id`                INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id`           INT          NOT NULL UNIQUE,
    `patient_id`        VARCHAR(20)  NULL UNIQUE,
    `age`               INT          NULL,
    `gender`            ENUM('Male','Female','Other') NULL,
    `doctor_id`         INT          NULL,
    `emergency_contact` VARCHAR(20)  NULL,
    `blood_group`       VARCHAR(10)  NULL,
    `created_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`)   REFERENCES `users`(`id`)   ON DELETE CASCADE,
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- STENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `stents` (
    `id`                   INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `stent_id`             VARCHAR(20)  NOT NULL UNIQUE,
    `patient_id`           INT          NOT NULL,
    `doctor_id`            INT          NOT NULL,
    `insertion_date`       DATE         NOT NULL,
    `expected_removal_date` DATE        NOT NULL,
    `actual_removal_date`  DATE         NULL,
    `status`               ENUM('active','removed','overdue') NOT NULL DEFAULT 'active',
    `notes`                TEXT         NULL,
    `created_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`doctor_id`)  REFERENCES `doctors`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SYMPTOM LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `symptom_logs` (
    `id`                 INT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `patient_id`         INT      NOT NULL,
    `log_date`           DATE     NOT NULL,
    `pain_level`         INT      NOT NULL DEFAULT 0,
    `water_intake`       INT      NOT NULL DEFAULT 0,
    `blood_in_urine`     TINYINT  NOT NULL DEFAULT 0,
    `frequent_urination` TINYINT  NOT NULL DEFAULT 0,
    `additional_notes`   TEXT     NULL,
    `created_at`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- MEDICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `medications` (
    `id`             INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `patient_id`     INT          NOT NULL,
    `name`           VARCHAR(100) NOT NULL,
    `dosage`         VARCHAR(50)  NULL,
    `frequency`      VARCHAR(50)  NULL,
    `next_dose_time` TIME         NULL,
    `is_active`      TINYINT(1)   NOT NULL DEFAULT 1,
    `created_at`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- MEDICATION LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `medication_logs` (
    `id`            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `medication_id` INT          NOT NULL,
    `patient_id`    INT          NOT NULL,
    `taken_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status`        ENUM('taken','missed','skipped') NOT NULL DEFAULT 'taken',
    FOREIGN KEY (`medication_id`) REFERENCES `medications`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`patient_id`)    REFERENCES `patients`(`id`)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- HYDRATION LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `hydration_logs` (
    `id`         INT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `patient_id` INT      NOT NULL,
    `log_date`   DATE     NOT NULL,
    `glasses`    INT      NOT NULL DEFAULT 0,
    `daily_goal` INT      NOT NULL DEFAULT 8,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `patient_date` (`patient_id`, `log_date`),
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `messages` (
    `id`          INT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `sender_id`   INT      NOT NULL,
    `receiver_id` INT      NOT NULL,
    `message`     TEXT     NOT NULL,
    `is_read`     TINYINT  NOT NULL DEFAULT 0,
    `sent_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`sender_id`)   REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- CONSULTATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `consultations` (
    `id`                INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `patient_id`        INT          NOT NULL,
    `doctor_id`         INT          NOT NULL,
    `consultation_type` VARCHAR(50)  NULL,
    `scheduled_date`    DATE         NOT NULL,
    `scheduled_time`    TIME         NOT NULL,
    `status`            ENUM('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
    `meeting_link`      VARCHAR(255) NULL,
    `notes`             TEXT         NULL,
    `created_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`doctor_id`)  REFERENCES `doctors`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
    `id`         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id`    INT          NOT NULL,
    `title`      VARCHAR(200) NOT NULL,
    `message`    TEXT         NULL,
    `type`       VARCHAR(50)  NOT NULL DEFAULT 'info',
    `is_read`    TINYINT      NOT NULL DEFAULT 0,
    `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- EDUCATION CONTENT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS `education_content` (
    `id`           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title`        VARCHAR(200) NOT NULL,
    `description`  TEXT         NULL,
    `content_type` ENUM('video','article','faq') NOT NULL,
    `content_url`  VARCHAR(255) NULL,
    `content_body` TEXT         NULL,
    `read_time`    VARCHAR(20)  NULL,
    `is_active`    TINYINT(1)   NOT NULL DEFAULT 1,
    `created_at`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEED DATA — Admin user + Sample hospitals
-- Password: admin123  (bcrypt hash, generated with PHP password_hash)
-- ============================================================
INSERT IGNORE INTO `users` (`role`, `email`, `password`, `full_name`, `is_verified`, `is_approved`)
VALUES ('admin', 'admin@stentcare.com',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'System Admin', 1, 1);

INSERT IGNORE INTO `hospitals` (`name`, `address`, `phone`, `email`) VALUES
('City General Hospital',    '123 Main Street, Downtown',      '9876543210', 'contact@cityhospital.com'),
('Apollo Medical Center',    '456 Health Ave, Uptown',         '9876543211', 'info@apollo.com'),
('Sunshine Healthcare',      '789 Wellness Road, Midtown',     '9876543212', 'info@sunshine.com'),
('National Urology Institute','1 Kidney Lane, Medical District','9876543213', 'info@nui.com');

INSERT IGNORE INTO `education_content` (`title`, `description`, `content_type`, `content_body`, `read_time`) VALUES
('What is a DJ Stent?', 'Learn about ureteral DJ stents and their purpose', 'article',
 'A DJ stent (also called a double-J stent or ureteral stent) is a thin, flexible tube placed in the ureter to allow urine to flow from the kidney to the bladder. It is used after kidney stone procedures, ureter surgery, or when there is a blockage.',
 '3 min'),
('Post-Stent Care Instructions', 'Essential care tips after stent insertion', 'article',
 'After your stent insertion: Drink 8-10 glasses of water daily. You may experience mild discomfort or blood in urine — this is normal. Avoid strenuous exercise for 1 week. Take prescribed medications on time. Report severe pain, fever, or inability to urinate immediately.',
 '5 min'),
('Hydration & Recovery', 'Why staying hydrated is critical with a DJ stent', 'article',
 'Drinking plenty of water helps flush bacteria and reduces the risk of infections. Aim for at least 8 glasses (2 liters) per day. Clear or light yellow urine is a sign of good hydration.',
 '2 min'),
('FAQ: DJ Stent Common Questions', 'Most frequently asked questions about DJ stents', 'faq',
 'Q: How long will the stent stay in? A: Typically 2-6 weeks, your doctor will advise.\nQ: Can I feel the stent? A: Some patients feel mild discomfort or a need to urinate more often.\nQ: What should I report to my doctor? A: Fever, severe pain, inability to urinate, or heavy bleeding.',
 '4 min');
