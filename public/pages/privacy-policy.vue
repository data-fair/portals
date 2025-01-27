<template>
  <v-container>
    <page-title text="Politique de confidentialité" />
    <p><i>Mise à jour le 04/10/2023</i></p>

    <template v-if="config.analytics && config.analytics.type !== 'none'">
      <p>Vous pouvez vous opposer au suivi de votre navigation sur ce site web. Cela protégera votre vie privée, mais empêchera également le propriétaire d'apprendre de vos actions et de créer une meilleure expérience pour vous et les autres utilisateurs.</p>
      <v-switch
        :input-value="!$cookies.get('df_portal_track_opt_out')"
        :true-value="true"
        label="Autoriser la mesure d'audience"
        @change="toggle"
      />
    </template>

    <p>L'ensemble de ce site relève des législations françaises et internationales sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents iconographiques et photographiques.</p>

    <section-title text="Déclaration CNIL" />
    <p> La collecte d'informations que nous effectuons a fait l'objet d'une déclaration à la CNIL, sous le numéro 2058016.</p>

    <section-title text="Quelles informations collectons-nous ?" />
    <p>Nous recueillons des informations lorsque vous vous inscrivez ou connectez sur notre site ou mettez à jour votre profil. Nous recueillons également des informations lorsque vous naviguez entre les différentes pages de notre site web.</p>

    <p>Lors de l'inscription sur notre site ou la mise à jour de votre profil, le cas échéant, vous pouvez être invité à entrer vos : prénom, nom, adresse e-mail, numéro de téléphone.</p>

    <section-title text="À quoi nous servent vos informations ?" />
    <p>Les informations que nous recueillons auprès de vous peuvent être utilisées pour améliorer notre site et personnaliser votre expérience. Ces données nous aident à mieux répondre à vos besoins individuels et vous faire des propositions commerciales.</p>

    <p>Vos informations, qu'elles soient publiques ou privées, ne seront pas vendues, échangées, transférées ou remises à une autre société pour quelque raison que ce soit, sans votre consentement, sauf dans le but exprès de livrer le produit ou le service acheté demandé, pour administrer un concours, une promotion, un sondage ou une autre caractéristique du site, ou d'envoyer des e-mails périodiques.</p>

    <p>L'adresse e-mail que vous fournissez pour l'enregistrement peut être occasionnellement utilisée pour vous envoyer des informations sur les mises à jour de la plateforme, de nos produits ou divers services.</p>

    <section-title text="Comment protégeons-nous vos informations ?" />
    <p>Nous mettons en œuvre plusieurs mesures de sécurité pour maintenir la sécurité de vos informations personnelles lorsque vous ajoutez, modifiez, ou accédez à vos renseignements personnels.</p>

    <p>Nous utilisons un serveur sécurisé. Toutes les informations sur la plateforme transitent via le protocole Secure Socket Layer (SSL). Nos bases de données ne sont accessibles que par les personnes autorisées avec des droits d'accès spéciaux à nos systèmes, et qui sont tenues de garder les informations confidentielles.</p>

    <section-title text="Est-ce que nous utilisons des cookies ?" />
    <p>Oui. Les cookies sont de petits fichiers qu'un site ou son prestataire de services transfère sur votre ordinateur via votre navigateur web (si vous les autorisez) et qui permettent aux sites ou aux fournisseurs de services de reconnaître votre navigateur et de capturer et mémoriser certaines informations.</p>

    <p>Nous utilisons des cookies pour stocker les sessions utilisateurs. Ces cookies sont utilisés uniquement pour les utilisateurs connectés. Nous utilisons également des cookies pour collecter des statistiques de navigation sur notre site, ces cookies sont utilisés pour tous les utilisateurs.</p>

    <p>Si vous préférez, vous pouvez choisir d'être averti par votre ordinateur chaque fois qu'un cookie est envoyé, ou vous pouvez choisir de désactiver tous les cookies via les paramètres de votre navigateur, mais vous ne serez alors pas en mesure de vous connecter à la plateforme.</p>

    <section-title text="Est-ce que nous divulguons des informations à des tiers ?" />
    <p>Non, mais nous pouvons divulguer vos informations lorsque nous croyons que cela est nécessaire pour se conformer à la loi, ou protéger nos droits, propriétés ou sécurité, ou ceux des autres.</p>

    <section-title text="California Online Privacy Protection Act Compliance" />
    <p>Parce que nous connaissons la valeur de votre vie privée, nous avons fait le nécessaire pour être en conformité avec la COPPA. Nous ne redistribuerons pas vos renseignements personnels à des tiers sans votre consentement.</p>

    <p>Dans le cadre de la COPPA, tous les utilisateurs de notre site peuvent apporter des modifications à leurs informations à tout moment en se connectant à la plateforme et en allant sur leur page profil.</p>

    <section-title text="Politique de confidentialité en ligne seulement" />
    <p>Cette politique de confidentialité en ligne s'applique uniquement aux informations collectées sur notre site et non aux informations recueillies hors ligne.</p>

    <section-title text="Votre consentement" />
    <p>En utilisant notre site, vous consentez à notre politique de confidentialité des données.</p>

    <section-title text="Changements relatifs à notre politique de confidentialité" />
    <p>Si nous décidons de changer notre politique de confidentialité, nous afficherons ces modifications sur cette page, nous vous enverrons un e-mail vous informant de tout changement, et nous mettrons à jour la date de modification de la politique de confidentialité ci-dessus.</p>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
  head () {
    const title = 'Politique de confidentialité - ' + this.config.title
    const description = 'Quelles informations sont collectées, à quoi elles servent et ce que nous faisons pour les protéger.'
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:url', property: 'og:url', content: this.url },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:description', property: 'og:description', content: description },
        { hid: 'og:type', property: 'og:type', content: 'website' }
      ]
    }
  },
  computed: {
    ...mapState(['config'])
  },
  methods: {
    toggle () {
      if (!this.$cookies.get('df_portal_track_opt_out')) {
        this.$cookies.set('df_portal_track_opt_out', '1', { maxAge: 60 * 60 * 24 * 365, sameSite: true, path: '/' })
      } else {
        this.$cookies.remove('df_portal_track_opt_out', { path: '/' })
      }
      this.$router.go()
    }
  }
}
</script>
