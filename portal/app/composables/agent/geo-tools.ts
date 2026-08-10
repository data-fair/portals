import type { Ref } from 'vue'
import { useAgentTool } from '@data-fair/lib-vue-agents'
import * as geocodeAddress from '@data-fair/agent-tools-data-fair/geocode-address'

const getUserGeolocationTitle: Record<string, string> = {
  fr: 'Obtenir la géolocalisation de l\'utilisateur',
  en: 'Get user geolocation'
}

export function useAgentGeoTools (locale: Ref<string>) {
  useAgentTool({
    ...geocodeAddress.schema,
    annotations: { title: geocodeAddress.annotations[locale.value as keyof typeof geocodeAddress.annotations]?.title ?? geocodeAddress.annotations.en.title, readOnlyHint: true },
    execute: async (params) => {
      let url: string
      try {
        url = geocodeAddress.buildUrl(params)
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: err instanceof Error ? err.message : String(err) }],
          isError: true
        }
      }

      let data: unknown
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        data = await res.json()
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Geocoding API error: ${err instanceof Error ? err.message : String(err)}` }],
          isError: true
        }
      }

      return {
        content: [{ type: 'text' as const, text: geocodeAddress.formatResult(data, params).text }]
      }
    }
  })

  useAgentTool({
    name: 'get_user_geolocation',
    description: 'Get the current geographic position of the user using the browser Geolocation API. Returns longitude, latitude, and accuracy (for geo_distance/bbox filters use lon,lat order). The user may be prompted to grant location permission.',
    annotations: { title: getUserGeolocationTitle[locale.value] ?? getUserGeolocationTitle.en, readOnlyHint: true },
    inputSchema: {
      type: 'object' as const,
      properties: {}
    },
    execute: async () => {
      if (!navigator.geolocation) {
        return {
          content: [{ type: 'text' as const, text: 'Geolocation is not supported by this browser.' }],
          isError: true
        }
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10_000,
            maximumAge: 60_000
          })
        })

        const { latitude, longitude, accuracy, altitude, altitudeAccuracy } = position.coords
        const parts = [
          `**Longitude**: ${longitude}`,
          `**Latitude**: ${latitude}`,
          `**Accuracy**: ${Math.round(accuracy)} m`
        ]
        if (altitude != null) {
          parts.push(`**Altitude**: ${altitude} m`)
          if (altitudeAccuracy != null) parts.push(`**Altitude accuracy**: ${Math.round(altitudeAccuracy)} m`)
        }

        return {
          content: [{ type: 'text' as const, text: parts.join('\n') }]
        }
      } catch (err) {
        const messages: Record<number, string> = {
          1: 'Location permission denied by user.',
          2: 'Position unavailable (location service error).',
          3: 'Geolocation request timed out.'
        }
        const code = (err as GeolocationPositionError | undefined)?.code
        const message = (code !== undefined && messages[code]) ||
          (err instanceof Error ? err.message : undefined) ||
          'Unknown geolocation error.'
        return {
          content: [{ type: 'text' as const, text: message }],
          isError: true
        }
      }
    }
  })
}
