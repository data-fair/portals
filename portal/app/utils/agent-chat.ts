export type AgentChatViewer = 'admin' | 'contrib' | 'user' | 'external' | 'anonymous'

// the portal's agent chat is shown to the viewers listed in visibleTo, to everyone when unset
export const canSeeAgentChat = (visibleTo: AgentChatViewer[] | undefined, viewer: AgentChatViewer) =>
  !visibleTo || visibleTo.includes(viewer)
