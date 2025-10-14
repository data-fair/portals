export const useLocalFetch = (_url: string, _options: any): any => {
  throw new Error('useLocalFetch should only be called from portal, not portals-manager')
}

export default useLocalFetch
