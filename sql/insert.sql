INSERT INTO events (id, name, slug, description) VALUES (1, 'Forritarahittingur í febrúar', 'forritarahittingur-i-februar', 'Forritarar hittast í febrúar og forrita saman eitthvað frábært.');
INSERT INTO events (id, name, slug, description) VALUES (2, 'Hönnuðahittingur í mars', 'honnudahittingur-i-mars', 'Spennandi hittingur hönnuða í Hönnunarmars.');
INSERT INTO events (id, name, slug, description) VALUES (3, 'Verkefnastjórahittingur í apríl', 'verkefnastjorahittingur-i-april', 'Virkilega vel verkefnastýrður hittingur.');

INSERT INTO users (id, name, username, password, admin) VALUES (1, 'Addi', 'admin', '$2b$12$PHNN.XXbFJb.2UVvgYE7q.uwjULI8hoE7oHH100yaDh/FBq46MY8G', true);
INSERT INTO users (id, name, username, password) VALUES (2, 'Jón Gunnar', 'jon', '$2b$12$dPBhkw2H.FWPWflgPUvnSOg0jJEmzUPiadaseJL/f77EdGZx6F9ay');

INSERT INTO registrations (comment, event, registrant) VALUES ('Hlakka til að forrita með ykkur', 1, 1);
INSERT INTO registrations (comment, event, registrant) VALUES (null, 1, 1);
INSERT INTO registrations (comment, event, registrant) VALUES ('verður vefforritað?', 1, 2);
