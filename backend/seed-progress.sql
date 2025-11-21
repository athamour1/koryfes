-- Fixed Peaks and Scout Diplomas Seed Data
-- These are hardcoded entries that should always exist

-- Clear existing data
DELETE FROM user_progress;
DELETE FROM scout_diplomas;
DELETE FROM peaks;

-- Insert Fixed Peaks (4 progression stages)
INSERT INTO peaks (id, name, type, description, "order") VALUES
(1, 'Υπόσχεση', 'promise', 'Η υπόσχεση του Προσκόπου - Το πρώτο βήμα', 1),
(2, 'Χάλκινη Κορυφή', 'bronze', 'Χάλκινη Κορυφή - Δεύτερο επίπεδο προόδου', 2),
(3, 'Αργυρή Κορυφή', 'silver', 'Αργυρή Κορυφή - Τρίτο επίπεδο προόδου', 3),
(4, 'Χρυσή Κορυφή', 'gold', 'Χρυσή Κορυφή - Το υψηλότερο επίπεδο', 4);

-- Reset sequence
SELECT setval('peaks_id_seq', 4, true);

-- Insert Fixed Scout Diplomas (3 levels)
INSERT INTO scout_diplomas (id, name, level, description) VALUES
(1, '1ο Πτυχίο Προσκόπου', 1, 'Πρώτο Πτυχίο Προσκόπου'),
(2, '2ο Πτυχίο Προσκόπου', 2, 'Δεύτερο Πτυχίο Προσκόπου'),
(3, '3ο Πτυχίο Προσκόπου', 3, 'Τρίτο Πτυχίο Προσκόπου');

-- Reset sequence  
SELECT setval('scout_diplomas_id_seq', 3, true);
