import { type Portal } from '#types/portal/index.ts'
import { type IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types'

const indexName = (portalId: string) => `portal-search-${portalId}`

export const indexDefinition = (portal: Portal): IndicesCreateRequest => ({
  index: indexName(portal._id),
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

export const buildQuery = (query: string) => ({
  query: {
    bool: {
      should: [
        {
          multi_match: {
            query,
            type: 'bool_prefix',
            fields: [
              'title^3',
              'title._2gram^3',
              'title._3gram^3',
              'description^2',
              'description._2gram^2',
              'description._3gram^2'
            ],
            operator: 'and'
          }
        },
        {
          match: {
            content: {
              query
            }
          }
        }
      ]
    }
  },
  highlight: {
    pre_tags: ['<span class="search-highlight">'],
    post_tags: ['</span>'],
    fields: {
      title: { number_of_fragments: 0 },
      description: { number_of_fragments: 2, fragment_size: 100 },
      content: { number_of_fragments: 1, fragment_size: 100 }
    }
  }
})
