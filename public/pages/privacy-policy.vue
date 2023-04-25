<template>
  <v-container>
    <page-title text="Politique de confidentialité" />
    <p>Vous pouvez vous opposer au suivi de votre navigation sur ce site web. Cela protégera votre vie privée, mais empêchera également le propriétaire d'apprendre de vos actions et de créer une meilleure expérience pour vous et les autres utilisateurs.</p>

    <v-switch
      v-if="config.analytics && config.analytics.type !== 'matomo'"
      :input-value="!$cookies.get('df_portal_track_opt_out')"
      :true-value="true"
      label="Autoriser la mesure d'audience"
      @change="toggle"
    />

    <section-title text="Quelles informations collectons-nous ?" />
    <p>Nous recueillons des informations lorsque vous vous inscrivez ou connectez sur notre site ou mettez à jour votre profil. Nous recueillons également des informations lorsque vous naviguez entre les différentes pages de notre site web.</p>

    <p>Lors de l'inscription sur notre site ou la mise à jour de votre profil, le cas échéant, vous pouvez être invité à entrer votre: prénom, nom, adresse e-mail, numéro de téléphone.</p>

    <section-title text="A quoi nous servent vos informations ?" />
    <p>Les informations que nous recueillons auprès de vous peuvent être utilisées pour améliorer notre site et personnaliser votre expérience. Ces données nous aide à mieux répondre à vos besoins individuels et vous faire des propositions commerciales.</p>

    <p>Vos informations, qu'elles soient publiques ou privées, ne seront pas vendus, échangés, transférés ou remis à une autre société pour quelque raison que ce soit, sans votre consentement, sauf dans le but exprès de livrer le produit ou le service acheté demandé, pour administrer un concours, une promotion, un sondage ou une autre caractéristique du site ou d'envoyer des courriels périodiques.</p>

    <section-title text="Comment protégeons-nous vos informations ?" />
    <p>Nous mettons en œuvre plusieurs mesures de sécurité pour maintenir la sécurité de vos informations personnelles lorsque vous ajoutez, modifiez, ou accédez à vos renseignements personnels.</p>

    <p>Nous utilisons un serveur sécurisé. Toutes les informations sur la plate-forme transitent via le protocole Secure Socket Layer (SSL). Nos bases de données ne sont accessibles que par les personnes autorisées avec des droits d'accès spéciaux à nos systèmes, et sont tenus de garder les informations confidentielles.</p>

    <section-title text="Est-ce que nous utilisons des cookies ?" />
    <p>Oui. Les cookies sont de petits fichiers qu'un site ou son prestataire de services transfert sur votre ordinateur via votre navigateur Web (si vous les autorisez) et qui permettent aux sites ou aux fournisseurs de services de reconnaître votre navigateur et de capturer et mémoriser certaines informations.</p>

    <p>Nous utilisons des cookies pour stocker les sessions utilisateur. Ces cookies sont utilisés uniquement pour les utilisateurs connectés. Nous utilisont également des cookies pour collecter des statistiques de navigation sur notre site, ces cookies sont utilisés pour tous les utilisateurs.</p>

    <p>Si vous préférez, vous pouvez choisir d'être averti par votre ordinateur chaque fois qu'un cookie est envoyé, ou vous pouvez choisir de désactiver tous les cookies via les paramètres de votre navigateur, mais vous ne serez alors pas en mesure de vous connecter à la plate-forme.</p>

    <section-title text="Politique de confidentialité en ligne seulement" />
    <p>Cette politique de confidentialité en ligne s'applique uniquement aux informations collectées sur notre site et non aux informations recueillies hors ligne.</p>

    <section-title text="Votre consentement" />
    <p>En utilisant notre site, vous consentez à notre politique de confidentialité des données.</p>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
  head () {
    return {
      title: 'Politique de confidentialité - ' + this.config.title,
      meta: [{ hid: 'description', name: 'description', content: 'Quelles informations sont collectées, à quoi elles servent et ce que nous faisons pour les protéger.' }]
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
