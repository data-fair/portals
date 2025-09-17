<!-- eslint-disable vue/no-parsing-error -->
<template>
  <xml>
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
      xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
    >
      <!-- <url
        v-for="page in sitemap"
        :key="page.to"
      >
        <loc v-text="fullURL(page.to)" />
        <lastmod
          v-if="page.updatedAt"
          v-text="page.updatedAt"
        />
        <priority
          v-if="page.priority"
          v-text="page.priority"
        />
      </url> -->
    </urlset>
  </xml>
</template>

<script setup lang="ts">

// Guidelines for sitemap.xml
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=fr#xml

// Taille : 50 Mo (sans compression) ou 50 000 URLs maximum.
// Encodage : UTF-8
// Les liens doivent être des URLs absolues (avec https://)

// Google ignore les balises <priority> et <changefreq>
// La valeur <lastmod> doit être cohérente et refléter la dernière mise à jour importante de la page : une mise à jour du contenu principal, des données structurées ou des liens

</script>
