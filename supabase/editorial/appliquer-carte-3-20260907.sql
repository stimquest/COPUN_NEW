BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
DO $$
BEGIN
  UPDATE public.pedagogical_content
  SET explication='La Lune et le Soleil déforment légèrement les masses d’eau en créant des zones où le niveau de la mer est plus élevé. Avec la rotation de la Terre, ces bourrelets se déplacent par rapport aux côtes : c’est ce mouvement qui produit les marées. Mais les océans ne sont pas un bassin uniforme ; la profondeur, les continents, les baies et les estuaires ralentissent ou décalent localement cette onde. C’est pourquoi la pleine mer n’arrive pas à la même heure partout.', tip='Présentez le « bourrelet » comme une image simplifiée : les bassins et les fonds transforment la propagation de l’onde.'
  WHERE id='3'
    AND explication='La marée se propage sous forme d’ondes dans les bassins océaniques. Leur progression dépend de la profondeur et de la forme des côtes : dans une baie ou un estuaire, le niveau ne suit donc pas exactement le même rythme qu’au large. C’est pourquoi deux ports peuvent avoir des horaires de pleine mer différents, même pour la même marée.'
    AND tip='Choisissez deux ports dont les prévisions montrent réellement un décalage à la date étudiée.';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'La fiche 3 a changé depuis la lecture';
  END IF;
END $$;
COMMIT;
