INSERT INTO users (id, name, username, password, admin) VALUES (1, 'Addi', 'admin', '$2b$12$PHNN.XXbFJb.2UVvgYE7q.uwjULI8hoE7oHH100yaDh/FBq46MY8G', true);
INSERT INTO users (id, name, username, password) VALUES (2, 'Jón Gunnar', 'jon', '$2b$12$dPBhkw2H.FWPWflgPUvnSOg0jJEmzUPiadaseJL/f77EdGZx6F9ay');
INSERT INTO users (id, name, username, password) VALUES (3, 'Gunni', 'gunni', '$2b$12$dPBhkw2H.FWPWflgPUvnSOg0jJEmzUPiadaseJL/f77EdGZx6F9ay');

INSERT INTO events (id, createdBy, name, slug, description) VALUES (1, 1, 'Forritarahittingur í febrúar', 'forritarahittingur-i-februar', 'Forritarar hittast í febrúar og forrita saman eitthvað frábært.');
INSERT INTO events (id, createdBy, name, slug, description) VALUES (2, 2, 'Hönnuðahittingur í mars', 'honnudahittingur-i-mars', 'Spennandi hittingur hönnuða í Hönnunarmars.');
INSERT INTO events (id, createdBy, name, slug, description) VALUES (3, 2, 'Verkefnastjórahittingur í apríl', 'verkefnastjorahittingur-i-april', 'Virkilega vel verkefnastýrður hittingur.');

INSERT INTO registrations (comment, event, registrant) VALUES ('Hlakka til að forrita með ykkur', 1, 1);
INSERT INTO registrations (comment, event, registrant) VALUES (null, 1, 2);
INSERT INTO registrations (comment, event, registrant) VALUES ('Vá hvað ég er spenntur', 2, 3);
INSERT INTO registrations (comment, event, registrant) VALUES ('verður vefforritað?', 2, 2);
INSERT INTO registrations (comment, event, registrant) VALUES ('eg elska vefforritun?', 2, 1);
INSERT INTO registrations (comment, event, registrant) VALUES ('spennó', 3, 2);
INSERT INTO registrations (comment, event, registrant) VALUES ('elska svona', 3, 1);


-- Verð að hafa þetta fyrst ég harðkóða id á inserted hlutum í byrjun
ALTER SEQUENCE "users_id_seq" RESTART WITH 4;
ALTER SEQUENCE "events_id_seq" RESTART WITH 4;
