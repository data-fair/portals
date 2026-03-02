import { type Portal } from '#types/portal/index.ts'
import { type IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types'

export const indexDefinition = (portal: Portal, index: string): IndicesCreateRequest => ({
  index,
  mappings: {
    properties: {
      // search_as_you_type will add words shingles for higher scores then search terms are closed by and edge ngram to search for token prefixes
      // it is costly, restricted to high value fields title and description
      title: {
        type: 'search_as_you_type',
        analyzer: 'custom_french'
      },
      description: {
        type: 'search_as_you_type',
        analyzer: 'custom_french'
      },
      // TODO: categories ? resource type ?
      // content has a much simpler full-text indexing
      content: {
        type: 'text',
        analyzer: 'custom_french',
      }
    }
  },
  settings: {
    analysis: {
      filter: {
        french_elision: {
          type: 'elision',
          articles_case: true,
          articles: [
            'l', 'm', 't', 'qu', 'n', 's',
            'j', 'd', 'c', 'jusqu', 'quoiqu',
            'lorsqu', 'puisqu'
          ]
        },
        french_stop: {
          type: 'stop',
          stopwords: '_french_'
        },
        french_stemmer: {
          type: 'stemmer',
          language: 'light_french'
        }
      },
      analyzer: {
        // copy of https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-lang-analyzer.html#french-analyzer
        // but insensitive to diacritics
        custom_french: {
          type: 'custom',
          tokenizer: 'standard',
          filter: [
            'french_elision',
            'lowercase',
            'french_stop',
            'french_stemmer',
            'asciifolding'
          ]
        }
      }
    }
  }
})
