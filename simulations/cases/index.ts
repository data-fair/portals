/**
 * What a case is: a surface, a page, a person, and something they want. There is
 * deliberately NO expected result — a run is judged by reading its transcript, not
 * by diffing its output against a blob written by whoever wrote the case.
 *
 * A goal must be reachable with tools that exist: one no tool can satisfy measures a
 * missing capability, not the experience.
 *
 * Route tokens: {portalId} and {pageId} are replaced with the ids seeded for the run
 * (see runner/fixtures.ts). Back-office routes go through the data-fair shell; portal
 * routes are paths on the seeded portal's own domain.
 *
 * Seeded data facts the goals lean on (simulations/resources/equipements-sportifs.csv):
 * 40 facilities, 7 of them with a capacity over 500 places, 8 pools of which the two
 * largest are "Piscine Olympique" (800) and "Piscine du Centre" (520).
 */
import type { SimCase } from '../runner/surfaces.ts'

const MANAGER = 'Tu es chargé de communication dans une petite collectivité. Tu gères le portail de données de la collectivité, mais tu n\'es pas informaticien : tu ne sais pas ce qu\'est un schéma, un composant ou un JSON, et tu n\'emploieras jamais ces mots. Si on te dit que c\'est fait sans que tu voies quoi que ce soit à l\'écran, tu le dis. Tu ne prétends jamais avoir cliqué sur un bouton sans l\'avoir fait. Quand on t\'indique un bouton ou un champ, tu cliques ou tu saisis toi-même : c\'est ton outil de travail.'

const RESIDENT = 'Tu es un habitant de l\'agglomération, curieux mais pas informaticien : tu ne sais pas ce qu\'est un jeu de données, un filtre ou une API, et tu n\'emploieras jamais ces mots. Tu es sur le site de données de ta collectivité. Si une réponse est vague, ou si on te dit que c\'est fait sans que tu voies quoi que ce soit à l\'écran, tu le dis.'

export const cases: SimCase[] = [
  // Page settings through the page editor's pageConfig_* tools. Born from a real
  // report: on this editor, a request timed out (MCP -32001) because a discarded
  // frame's tools were still registered. That request asked to attach the page to a
  // topic, which pages do not have — so this case asks for what a page does have.
  {
    name: 'page-parametres',
    surface: 'backoffice',
    route: '/data-fair/pages/{pageId}/edit-config',
    persona: MANAGER,
    goal: 'Sur la page « Nos actions pour la jeunesse », tu veux que le titre devienne « Jeunesse : nos dispositifs » et que la description dise en une phrase qu\'elle présente les dispositifs pour les 16-25 ans. Tu veux voir le changement à l\'écran avant qu\'il soit enregistré, et que ce soit enregistré à la fin.',
    maxTurns: 6
  },
  // Page content: the page elements form (a oneOf over every element type) and its
  // sub-agent.
  {
    name: 'page-contenu',
    surface: 'backoffice',
    route: '/data-fair/pages/{pageId}/edit-config',
    persona: MANAGER,
    goal: 'Sur la page « Nos actions pour la jeunesse », tu veux ajouter en haut un court paragraphe d\'introduction, puis en dessous la liste des données publiées sur le portail. Tu veux voir le résultat à l\'écran avant d\'enregistrer, et que ce soit enregistré à la fin.',
    maxTurns: 8
  },
  // Portal config through the portalConfig_form sub-agent.
  {
    name: 'portail-configuration',
    surface: 'backoffice',
    route: '/data-fair/portals/{portalId}',
    persona: MANAGER,
    goal: 'Tu veux que la couleur principale du portail soit un vert foncé, et que la page « Nos actions pour la jeunesse » apparaisse dans le menu du portail. Tu veux voir les changements à l\'écran avant qu\'ils soient enregistrés, et que ce soit enregistré à la fin.',
    maxTurns: 8
  },
  // Crosses from the pages manager to the portal manager. No tool creates a page, so
  // the person presses the buttons the assistant points to; then the menu is edited
  // on the portal page. Exercises frame changes — the bug class where a discarded
  // frame's tools made the next turn time out.
  {
    name: 'page-puis-menu',
    surface: 'backoffice',
    route: '/data-fair/pages',
    persona: MANAGER + ' Tu fais toi-même les clics qu\'on te demande, un à la fois, mais tu ne cherches pas tout seul dans l\'interface.',
    goal: 'Tu veux créer une nouvelle page « Agenda des événements » sur le portail, puis qu\'elle apparaisse dans le menu du portail. Tu veux qu\'on te guide pas à pas et voir le résultat à l\'écran.',
    // 12, not 10: the 2026-10-02 baseline ran out of turns in the wizard and on the
    // validation step, every time before the menu half of the goal was reached.
    maxTurns: 12
  },
  // The navigation the PERSON performs, by opening a link the assistant produced. A
  // filtered view is not reachable by pointing at things, so asking is the only way
  // through; the last clause checks the chat still works after the navigation.
  {
    name: 'portail-lien-filtre',
    surface: 'portal',
    route: '/',
    persona: RESIDENT + ' Tu prépares une sortie avec une association et tu veux garder de quoi y revenir.',
    goal: 'Tu veux un lien vers la liste des équipements sportifs de plus de 500 places, que tu ouvriras toi-même pour vérifier qu\'il montre bien les bonnes données. Une fois que tu l\'as ouvert, tu veux encore pouvoir poser une question à l\'assistant sur ce que tu as sous les yeux.',
    maxTurns: 6
  },
  // A factual question that needs a real query, shown on screen, not recopied.
  {
    name: 'portail-question-donnees',
    surface: 'portal',
    route: '/datasets/sim-equipements-sportifs',
    persona: RESIDENT + ' Tu es pressé.',
    goal: 'Tu veux savoir combien de piscines il y a dans l\'agglomération et lesquelles sont les plus grandes, et pouvoir les voir à l\'écran — pas seulement une liste recopiée dans la discussion.',
    maxTurns: 6
  }
]
