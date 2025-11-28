-- Fixed Peaks and Guide Diplomas Seed Data
-- These are hardcoded entries that should always exist

-- Clear existing data
DELETE FROM user_progress;
DELETE FROM guide_diplomas;
DELETE FROM peaks;

-- Insert Fixed Peaks (4 progression stages)
INSERT INTO peaks (id, name, type, description, "order") VALUES
(1, 'Υπόσχεση', 'promise', 'Η υπόσχεση του Οδηγισμού - Το πρώτο βήμα', 1),
(2, 'Χάλκινη Κορυφή', 'bronze', 'Χάλκινη Κορυφή - Δεύτερο επίπεδο προόδου', 2),
(3, 'Αργυρή Κορυφή', 'silver', 'Αργυρή Κορυφή - Τρίτο επίπεδο προόδου', 3),
(4, 'Χρυσή Κορυφή', 'gold', 'Χρυσή Κορυφή - Το υψηλότερο επίπεδο', 4);

-- Reset sequence
SELECT setval('peaks_id_seq', 4, true);

-- Insert Fixed Guide Diplomas (3 levels)
INSERT INTO guide_diplomas (id, name, level, description) VALUES
(1, '1ο Πτυχίο Οδηγισμού', 1, 'Πρώτο Πτυχίο Οδηγισμού'),
(2, '2ο Πτυχίο Οδηγισμού', 2, 'Δεύτερο Πτυχίο Οδηγισμού'),
(3, '3ο Πτυχίο Οδηγισμού', 3, 'Τρίτο Πτυχίο Οδηγισμού');

-- Reset sequence  
SELECT setval('guide_diplomas_id_seq', 3, true);
