// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useLocalFetch = <T>(_url: string, _options?: any): any => {
  throw new Error('useLocalFetch should only be called from portal, not portals-manager')
}

export default useLocalFetch
