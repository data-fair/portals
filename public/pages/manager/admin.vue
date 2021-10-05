<template lang="html">
  <v-container fluid>
    <v-row v-if="portals">
      <v-col
        cols="12"
        md="6"
        lg="4"
      >
        <v-card>
          <v-card-title primary-title>
            <v-icon>mdi-earth</v-icon>&nbsp;&nbsp;Portails publiés sur un domaine
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="portal in publicPortals" :key="portal._id">
                <v-list-item-content>
                  <v-list-item-title>
                    {{ portal.owner.name }} - {{ portal.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle>Adresse : <a :href="portal.link" target="_blank">{{ portal.link }}</a></v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon color="primary" @click="currentPortal = portal; newHost = portal.host; showPublishDialog = true;">
                    mdi-earth
                  </v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="6"
        lg="4"
      >
        <v-card>
          <v-card-title primary-title>
            <v-icon>mdi-lock</v-icon>&nbsp;&nbsp;Portails pas encore publiés
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="portal in privatePortals" :key="portal._id">
                <v-list-item-content>
                  <v-list-item-title>
                    {{ portal.owner.name }} - {{ portal.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle>Adresse : <a :href="portal.link">{{ portal.link }}</a></v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-icon color="primary" @click="currentPortal = portal; newHost = portal.host; showPublishDialog = true;">
                    mdi-earth
                  </v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="showPublishDialog"
      fullscreen
    >
      <v-card v-if="currentPortal">
        <v-card-title primary-title>
          <h3 class="headline mb-0">
            Publier ce portail
          </h3>
        </v-card-title>
        <v-card-text>
          <p>
            Publiez ce portail en tant que administrateur de la plateforme en définissant le domaine public.
            Ce domaine peut être un sous domaine du votre, ou bien complètement distinct, du moment que la règle DNS est bien définie.
          </p>
          <v-form style="max-width: 400px;">
            <v-text-field
              v-model="newHost"
              name="host"
              label="Domaine"
              outlined
            />
          </v-form>
          <template v-if="newHost">
            <p>
              Il faut configurer une règle DNS pour pointer sur l'IP de la machine ou data-fair-portals est déployé (règle DNS de type "A record").
            </p>
            <p>
              Il faut configurer votre reverse-proxy pour que le traffic entrant sur ce domaine soit redirigé vers votre installation de data-fair-portals.
            </p>
            <p>
              Pour une exposition sécurisée par un certificat, c'est également au reverse-proxy de le supporter.
            </p>
            <p>
              Ci-dessous un exemple de Ingress Kubernetes qui déclare la redirection et qui va automatiquement créer un certificat (ingress-controller et cert-manager doivent être configurés dans le cluster) :
            </p>
            <code style="width: 100%;">
              <pre>---

# Portal: {{ currentPortal.title }} ({{ currentPortal._id }})
# Owner: {{ currentPortal.owner.name }} ({{ currentPortal.owner.type }}:{{ currentPortal.owner.id }})
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: portal-{{ newHost.replace(/\./g, '-') }}
  annotations:
    kubernetes.io/tls-acme: "true"
    # Remove matched prefix from all rules
    nginx.ingress.kubernetes.io/rewrite-target: /$1
spec:
  tls:
    - hosts:
        - {{ newHost }}
      secretName: portal-{{ newHost.replace(/\./g, '-') }}
  rules:
    - host: {{ newHost }}
      http:
        paths:
          - path: /simple-directory/(.*)
            backend:
              serviceName: simple-directory
              servicePort: 8080
          - path: /data-fair/(.*)
            backend:
              serviceName: data-fair-cache
              servicePort: 80
          - path: /notify/(.*)
            backend:
              serviceName: notify
              servicePort: 8080
          - path: /?(.*)
            backend:
              serviceName: data-fair-portals
              servicePort: 8080
              </pre>
            </code>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showPublishDialog = false">
            Annuler
          </v-btn>
          <v-btn color="primary" @click="patchHost(); showPublishDialog = false">
            Publier
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  export default {
    layout: 'manager',
    middleware: 'superadmin-required',
    data() {
      return {
        portals: null,
        showPublishDialog: false,
        currentPortal: null,
        newHost: null,
      }
    },
    computed: {
      publicPortals() {
        return this.portals && this.portals.filter(p => !!p.host)
      },
      privatePortals() {
        return this.portals && this.portals.filter(p => !p.host)
      },
    },
    async mounted() {
      this.refresh()
    },
    methods: {
      async refresh() {
        this.portals = await this.$axios.$get('api/v1/portals', { params: { size: 10000 } })
      },
      async patchHost() {
        await this.$axios.put(`api/v1/portals/${this.currentPortal._id}/host`, this.newHost,
                              { headers: { 'Content-Type': 'text/plain' } })
        this.refresh()
      },
    },
  }
</script>

<style lang="css">
</style>
