// Texts of the events sent to the events service, in every language of the platform:
// events picks the one of each subscription (see InternationalizedTitle in lib-common-types/event)

export type EventText = { fr: string, en: string }
type Lang = keyof EventText
type Params = Record<string, string | number | undefined>

const fr = {
  'portal-create': 'Le portail {title} a été créé',
  'portal-patch': 'Le portail {title} a été modifié',
  'portal-delete': 'Le portail {title} a été supprimé',
  'portal-draft-validate': 'Le brouillon du portail {title} a été validé',
  'portal-draft-discard': 'Le brouillon du portail {title} a été annulé',
  'page-create': 'La page {title} a été créée',
  'page-patch': 'La page {title} a été modifiée',
  'page-delete': 'La page {title} a été supprimée',
  'page-publish': 'La page {title} a été publiée sur un portail',
  'page-unpublish': "La page {title} a été dépubliée d'un portail",
  'page-draft-validate': 'Le brouillon de la page {title} a été validé',
  'page-draft-discard': 'Le brouillon de la page {title} a été annulé',
  'group-create': 'Le groupe de pages {title} a été créé',
  'group-patch': 'Le groupe de pages {title} a été modifié',
  'group-delete': 'Le groupe de pages {title} a été supprimé',
  'reuse-create': 'La réutilisation {title} a été créée',
  'reuse-patch': 'La réutilisation {title} a été modifiée',
  'reuse-delete': 'La réutilisation {title} a été supprimée',
  'reuse-publish': 'La réutilisation {title} a été publiée sur un portail',
  'reuse-unpublish': "La réutilisation {title} a été dépubliée d'un portail",
  'reuse-submit': 'La réutilisation {title} a été soumise pour validation',
  'reuse-draft-validate': 'Le brouillon de la réutilisation {title} a été validé',
  'reuse-draft-discard': 'Le brouillon de la réutilisation {title} a été annulé',
  changes: 'Modifications : {keys}',
  duplicatedFromPortal: 'Dupliqué depuis le portail "{title}" ({id})',
  duplicatedFromReferencePortal: 'Dupliqué depuis le portail de référence "{title}" ({id})',
  pageType: 'Type : {type}',
  pageGroup: 'Groupe : {group}',
  duplicatedFromPage: 'Dupliquée depuis la page "{title}" ({id})',
  duplicatedFromReferencePage: 'Dupliquée depuis la page de référence "{title}" ({id})',
  pagePublished: 'La page a été publiée sur le portail : {portal}',
  pageUnpublished: 'La page a été dépubliée du portail : {portal}',
  pageReplaced: 'La page "{replaced}" a été remplacée par la page "{title}" sur le portail : {portal}',
  reusePublished: 'La réutilisation a été publiée sur le portail : {portal}',
  reuseUnpublished: 'La réutilisation a été dépubliée du portail : {portal}',
  reuseSubmitted: 'Soumise sur le portail : {portal} ({url})'
}

export type EventTextKey = keyof typeof fr

const en: Record<EventTextKey, string> = {
  'portal-create': 'The portal {title} was created',
  'portal-patch': 'The portal {title} was updated',
  'portal-delete': 'The portal {title} was deleted',
  'portal-draft-validate': 'The draft of the portal {title} was validated',
  'portal-draft-discard': 'The draft of the portal {title} was discarded',
  'page-create': 'The page {title} was created',
  'page-patch': 'The page {title} was updated',
  'page-delete': 'The page {title} was deleted',
  'page-publish': 'The page {title} was published on a portal',
  'page-unpublish': 'The page {title} was unpublished from a portal',
  'page-draft-validate': 'The draft of the page {title} was validated',
  'page-draft-discard': 'The draft of the page {title} was discarded',
  'group-create': 'The page group {title} was created',
  'group-patch': 'The page group {title} was updated',
  'group-delete': 'The page group {title} was deleted',
  'reuse-create': 'The reuse {title} was created',
  'reuse-patch': 'The reuse {title} was updated',
  'reuse-delete': 'The reuse {title} was deleted',
  'reuse-publish': 'The reuse {title} was published on a portal',
  'reuse-unpublish': 'The reuse {title} was unpublished from a portal',
  'reuse-submit': 'The reuse {title} was submitted for validation',
  'reuse-draft-validate': 'The draft of the reuse {title} was validated',
  'reuse-draft-discard': 'The draft of the reuse {title} was discarded',
  changes: 'Changes: {keys}',
  duplicatedFromPortal: 'Duplicated from the portal "{title}" ({id})',
  duplicatedFromReferencePortal: 'Duplicated from the reference portal "{title}" ({id})',
  pageType: 'Type: {type}',
  pageGroup: 'Group: {group}',
  duplicatedFromPage: 'Duplicated from the page "{title}" ({id})',
  duplicatedFromReferencePage: 'Duplicated from the reference page "{title}" ({id})',
  pagePublished: 'The page was published on the portal: {portal}',
  pageUnpublished: 'The page was unpublished from the portal: {portal}',
  pageReplaced: 'The page "{replaced}" was replaced by the page "{title}" on the portal: {portal}',
  reusePublished: 'The reuse was published on the portal: {portal}',
  reuseUnpublished: 'The reuse was unpublished from the portal: {portal}',
  reuseSubmitted: 'Submitted on the portal: {portal} ({url})'
}

const messages: Record<Lang, Record<EventTextKey, string>> = { fr, en }

/** Actions of a resource that have an event title, e.g. EventAction<'page'> = 'create' | 'publish' | … */
export type EventAction<Resource extends string, Key = EventTextKey> = Key extends `${Resource}-${infer Action}` ? Action : never

const langs = Object.keys(messages) as Lang[]

const interpolate = (message: string, params: Params) =>
  message.replace(/\{(\w+)\}/g, (match, name) => params[name] === undefined ? match : String(params[name]))

export const eventText = (key: EventTextKey, params: Params = {}): EventText =>
  Object.fromEntries(langs.map(lang => [lang, interpolate(messages[lang][key], params)])) as EventText

export const joinEventTexts = (texts: EventText[], separator: string): EventText | undefined => {
  if (!texts.length) return undefined
  return Object.fromEntries(langs.map(lang => [lang, texts.map(text => text[lang]).join(separator)])) as EventText
}
