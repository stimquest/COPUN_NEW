/** Variantes choisies pour apporter une autre occasion de transmettre, sans multiplier les exemples.
 * Chaque fiche conserve sa proposition principale ; certaines proposent une ou deux alternatives.
 * Ce sont des occasions au choix, pas un programme d'activités à réaliser.
 */
export type OccasionTerrain = { moment: string; proposition: string };
type VariantesTerrain = { fiche: string; cas: [OccasionTerrain] | [OccasionTerrain, OccasionTerrain] };

export const VARIANTES_TERRAIN: Record<string, VariantesTerrain[]> = {
    'littoral-eau': [
        {"fiche":"Même plage, autre espace","cas":[{"moment":"Quand il faut déplacer le matériel","proposition":"Le changement de niveau vous conduit à déplacer les bateaux. Glissez : « Nous changeons de place ; qui d’autre doit adapter son activité quand l’eau arrive ? ». Faites citer un usage visible du site, puis poursuivez la préparation."}]},
        {"fiche":"Ce qui monte et ce qui nous emporte","cas":[{"moment":"Après une dérive ressentie","proposition":"Le groupe vient de corriger une trajectoire. À la pause suivante : « Le bateau a été déporté ; quel mouvement de l’eau cela nous fait-il ressentir ? ». Comparez avec un indice de surface visible, puis distinguez ce déplacement du changement de hauteur."}]},
        {"fiche":"Une plage mobile, pas un décor","cas":[{"moment":"Devant une ancienne photo du site","proposition":"Si une photo est disponible à la base : « Qu’est-ce qui semble différent ? Que faudrait-il connaître pour comparer correctement ? ». Faites chercher point de vue et niveau d’eau avant de parler de déplacement du sable."},{"moment":"Quand quelqu’un dit « la plage a disparu »","proposition":"Depuis l’accès habituel, faites préciser : « Qu’est-ce qui a disparu de notre vue : le sable lui-même ou la partie découverte ? ». Reprenez le niveau de marée et gardez ouverte la question d’une évolution durable."}]},
    ],
    'vent-meteo': [
        {"fiche":"Notre plage dans un littoral plus vaste","cas":[{"moment":"Quand le groupe découvre le site depuis l’eau","proposition":"À une pause prévue, reprenez un repère connu du groupe : « Sur la plage, nous ne voyions que ce secteur. Qu’est-ce que cette vue depuis l’eau nous permet de relier maintenant ? ». Faites retrouver un prolongement de côte ou un élément voisin."}]},
        {"fiche":"La forme du rivage raconte le lieu","cas":[{"moment":"Après un contraste ressenti sur le trajet","proposition":"Le groupe a traversé deux secteurs aux sensations différentes. À la pause suivante : « Où étions-nous par rapport à la côte dans chacun des cas ? ». Reliez le vécu à la configuration visible et aux conditions du jour."}]},
        {"fiche":"La mer est aussi reliée aux terres","cas":[{"moment":"Au retour d’une séance après la pluie","proposition":"Si le trajet habituel montre un écoulement : « Où va cette eau, et d’où peut-elle venir ? ». Reliez son chemin aux terres et à la mer. Décrivez ce que vous voyez sans conclure sur la qualité de l’eau."}]},
    ],
    'milieux-vivants': [
        {"fiche":"Changer de secteur, changer de conditions","cas":[{"moment":"Quand une plante intrigue le groupe","proposition":"Avant de chercher son nom, demandez : « Où est-elle installée ? Qu’est-ce qui distingue cet endroit du secteur voisin ? ». Partez de sa place dans le milieu pour raconter une contrainte ou une ressource."}]},
        {"fiche":"Pourquoi les rencontres changent","cas":[{"moment":"Quand un habitué dit « avant, on en voyait »","proposition":"Accueillez le souvenir : « À quelle période et à quelle marée ? Faisions-nous le même trajet ? ». Comparez les contextes et gardez plusieurs pistes. Une seule sortie ne permet pas de conclure à une disparition."},{"moment":"En préparant une nouvelle semaine","proposition":"Reprenez une observation de la semaine précédente : « Pouvons-nous promettre la même rencontre ? Qu’est-ce qui pourrait changer ? ». Proposez de retrouver un milieu ou un indice plutôt qu’un animal précis."}]},
        {"fiche":"Un lieu qui répond à un besoin","cas":[{"moment":"Quand le groupe voit des animaux regroupés","proposition":"Depuis votre position, sans rapprochement : « Qu’est-ce qu’ils font ici, et qu’est-ce que cet endroit peut leur offrir ? ». Faites distinguer le comportement observé et le besoin possible : repos, nourriture ou abri."},{"moment":"Au bilan après deux secteurs différents","proposition":"Reprenez deux lieux traversés : « Si vous cherchiez de l’eau, un abri ou un endroit pour vous poser, choisiriez-vous le même secteur ? ». Revenez ensuite à un indice réellement vu pour relier milieu et vivant."}]},
    ],
    'littoral-partage': [
        {"fiche":"Notre terrain de sport sert aussi à d’autres","cas":[{"moment":"Au bilan d’un croisement sur l’eau","proposition":"Reprenez une rencontre vécue : « Pour nous, c’était un trajet de séance. Que représentait cet endroit pour l’autre usager ? ». Donnez une autre lecture du même lieu sans transformer l’échange en jugement sur les personnes."}]},
        {"fiche":"Expliquer le besoin derrière la consigne","cas":[{"moment":"Quand un participant conteste un détour","proposition":"Au moment adapté : « Si nous passions ici maintenant, quelle activité risquerions-nous de gêner ? ». Expliquez le besoin concret derrière votre choix, avec les consignes locales comme appui."}]},
    ],
    'lire-eau': [
        {"fiche":"Donner au groupe un moyen de vérifier","cas":[{"moment":"Quand deux participants ne sont pas d’accord","proposition":"L’un perçoit un mouvement, l’autre non. Proposez : « Choisissons le même repère et regardons pendant quelques instants. Que peut-on décrire ensemble ? ». Le désaccord devient un point de départ pour observer."}]},
        {"fiche":"Une question plutôt qu’une invitation vague","cas":[{"moment":"Quand « regardez la mer » ne suscite rien","proposition":"Resserrez l’entrée : « Regardez cette écume pendant quelques secondes : reste-t-elle au même endroit par rapport au repère ? ». Une cible et une comparaison donnent au groupe quelque chose à raconter."}]},
    ],
    'reperes': [
        {"fiche":"Situer un paysage dans le temps","cas":[{"moment":"Quand le groupe raconte une autre sortie","proposition":"À « la dernière fois, ce n’était pas comme ça », demandez : « À quelle heure, à quelle marée, à quelle saison étions-nous là ? ». Faites situer le souvenir avant de discuter le changement."}]},
        {"fiche":"Distinguer changement du lieu et changement de regard","cas":[{"moment":"Quand la vue depuis l’eau surprend","proposition":"Le groupe trouve la côte différente. Proposez : « Qu’est-ce qui a changé depuis la plage : le lieu, ou notre position pour le regarder ? ». Retrouvez un élément commun aux deux vues."}]},
    ],
    'ciel-vent': [
        {"fiche":"Mettre des mots sur une variation vécue","cas":[{"moment":"Après un changement de réglage","proposition":"À la pause suivante, revenez sur le geste : « Qu’avez-vous ressenti juste avant d’adapter le réglage ? Quel indice du milieu accompagnait cette variation ? ». Faites relier corps, bateau et observation."}]},
        {"fiche":"Faire expliquer un écart entre les indices","cas":[{"moment":"Quand la manche à air ne confirme pas le vent ressenti","proposition":"Au retour à terre : « Observons-nous le même endroit, au même moment ? Qu’est-ce qui pourrait modifier ce que chacun perçoit ? ». Faites préciser où et quand chaque observation a été faite avant de les comparer."},{"moment":"Quand une prévision ne ressemble pas au vécu","proposition":"Au bilan : « Que prévoyait-on, et qu’avons-nous vraiment observé ici ? ». Faites décrire l’écart et ses limites. Une observation locale n’invalide pas à elle seule la prévision de tout le secteur."}]},
    ],
    'traces-vivant': [
        {"fiche":"Faire raisonner à partir d’une trace","cas":[{"moment":"Quand une empreinte ou une coquille intrigue","proposition":"Demandez : « Qu’est-ce que cette trace nous apprend ? Qu’est-ce qu’elle ne nous permet pas de savoir ? ». Précisez ce qui reste incertain : l’auteur de la trace, le moment du passage ou l’origine du dépôt."},{"moment":"Quand plusieurs explications sont proposées","proposition":"Plutôt que trancher par vote : « Quel détail soutient chaque idée ? Qu’aurions-nous besoin de vérifier ? ». Retenez une description commune et présentez les explications comme des hypothèses."}]},
        {"fiche":"Un comportement raconte un besoin","cas":[{"moment":"Quand le groupe demande le nom de l’espèce","proposition":"Si vous ne le connaissez pas, ouvrez une autre entrée : « Son nom reste à vérifier, mais que pouvons-nous déjà comprendre de son activité ici ? ». Donnez prise à l’échange sans inventer une identification."}]},
        {"fiche":"Répondre à « aujourd’hui, il n’y a rien »","cas":[{"moment":"Après une rencontre espérée qui n’a pas eu lieu","proposition":"Reprenez : « Rien de visible à cet instant, ou aucune trace de vivant ? ». Faites choisir un support ou un indice accessible. Une absence de rencontre n’oblige pas à chercher plus loin."},{"moment":"En comparant deux séances","proposition":"Le groupe avait vu des animaux une autre fois. Demandez : « Le lieu, le moment et notre attention étaient-ils les mêmes ? ». Faites contextualiser la différence sans conclure que le vivant a disparu."}]},
    ],
    'sans-deranger': [
        {"fiche":"Faire voir le dérangement avant la fuite","cas":[{"moment":"Quand le groupe dit « il ne s’est pas envolé »","proposition":"Répondez : « Regardions-nous seulement son départ, ou aussi son activité avant et pendant notre passage ? ». Reprenez un comportement réellement observé, sans provoquer une réaction pour illustrer votre explication."}]},
        {"fiche":"Expliquer le changement de trajectoire","cas":[{"moment":"Quand le groupe demande à mieux voir","proposition":"Proposez : « Que pouvons-nous déjà comprendre d’ici sans réduire la distance ? ». Faites décrire l’activité visible ; acceptez qu’un détail ou un nom reste incertain."}]},
        {"fiche":"Donner du sens à un contour sans animal visible","cas":[{"moment":"Quand quelqu’un dit « pourtant, il n’y a rien »","proposition":"Rebondissez : « Un espace doit-il être occupé sous nos yeux pour avoir un rôle ? ». Reliez la règle au besoin documenté du site, plutôt qu’à une présence que vous ne pouvez pas confirmer."}]},
    ],
    'plages-dunes': [
        {"fiche":"Notre passage s’ajoute aux autres","cas":[{"moment":"Quand un raccourci semble sans conséquence","proposition":"Depuis le chemin prévu : « Si tous les groupes prenaient ce raccourci, que finirait-on par voir ? ». Faites anticiper l’effet des passages répétés, puis poursuivez par l’accès existant."}]},
        {"fiche":"Une plage nette n’est pas le seul objectif","cas":[{"moment":"Quand le groupe parle d’une plage « sale »","proposition":"Faites préciser : « De quoi parlons-nous : déchets fabriqués, algues, bois ou coquilles ? Ont-ils tous la même place dans le milieu ? ». La description permet d’ouvrir la distinction sans organiser un nettoyage improvisé."}]},
    ],
    'laisse-de-mer': [
        {"fiche":"Justifier un tri plutôt que réciter une consigne","cas":[{"moment":"Quand un objet est difficile à classer","proposition":"Ne faites pas deviner à tout prix : « Qu’est-ce qui nous permet de trancher ? Que faisons-nous si le doute reste ? ». Gardez l’objet en place si l’identification ou la manipulation pose problème et demandez au référent."}]},
        {"fiche":"Trois gestes, trois raisons","cas":[{"moment":"Quand le groupe veut une règle unique","proposition":"Proposez : « Est-ce que le même geste convient à une algue, un emballage et un objet inconnu ? ». Faites dégager la nécessité d’observer avant de décider, avec les règles de la base comme appui."}]},
    ],
    'connaitre-site': [
        {"fiche":"Le contexte rend le récit utile","cas":[{"moment":"Quand le récit commence par « tout à l’heure, là-bas »","proposition":"Relancez : « Comment préciser où et quand cela s’est passé pour quelqu’un qui n’était pas là ? ». Utilisez les repères déjà partagés pendant la séance pour préciser la description."}]},
        {"fiche":"Une place dans le bilan sportif","cas":[{"moment":"À la préparation de la séance suivante","proposition":"Reprenez une observation du précédent bilan : « Quelle question nous a-t-elle laissée ? Y a-t-il une occasion de la reprendre aujourd’hui ? ». Gardez cette curiosité disponible sans imposer une collecte ou une rencontre."}]},
    ],
};

export function getOccasionsTerrain(parcoursId: string, titreFiche: string): OccasionTerrain[] {
    return VARIANTES_TERRAIN[parcoursId]?.find(item => item.fiche === titreFiche)?.cas ?? [];
}
