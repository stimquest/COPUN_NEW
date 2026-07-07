-- Un compte créé par invitation/magic link obtient une session valide dès le clic sur le
-- lien, avant même que l'utilisateur ait défini un mot de passe. S'il quitte l'app à ce
-- moment-là (ferme l'onglet, navigue ailleurs), il se retrouve avec un compte actif mais
-- sans mot de passe enregistré — impossible de se reconnecter une fois la session expirée.
-- Ce flag permet au middleware de forcer le passage par /auth/reset-password tant que le
-- mot de passe n'a pas été explicitement défini.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS password_set BOOLEAN NOT NULL DEFAULT false;

-- Les comptes déjà utilisés normalement (connexion par mot de passe déjà fonctionnelle)
-- ne doivent pas se retrouver bloqués par ce nouveau garde-fou.
UPDATE public.profiles SET password_set = true;
