import Vue from 'vue'

export default () => ({
  getters: {
    backgroundColor (state, getters, rootState) {
      if (!rootState.config) return
      if (rootState.config.backgroundColor === 'white' || !rootState.config.backgroundColor) return '#FFFFFF'
      if (rootState.config.backgroundColor === 'lightGrey') return '#FAFAFA'
      if (rootState.config.backgroundColor === 'secondaryBackground') return getters.secondaryBackgroundColor
    },
    secondaryColor (state, getters, rootState) {
      if (!rootState.config) return
      return rootState.config.secondaryColor || rootState.config.themeColor
    },
    readableThemeColor (state, getters, rootState) {
      if (!rootState.config) return
      return Vue.prototype.$readableColor(rootState.config.themeColor)
    },
    backgroundableThemeColor (state, getters, rootState) {
      if (!rootState.config) return
      return Vue.prototype.$readableColor(rootState.config.themeColor, getters.readableThemeColor)
    },
    readableSecondaryColor (state, getters, rootState) {
      if (!rootState.config) return
      return Vue.prototype.$readableColor(getters.secondaryColor)
    },
    backgroundableSecondaryColor (state, getters, rootState) {
      if (!rootState.config) return
      return Vue.prototype.$readableColor(getters.secondaryColor, getters.readableThemeColor)
    },
    secondaryBackgroundColor (state, getters, rootState) {
      if (!rootState.config) return
      return Vue.prototype.$readableColor(rootState.config.secondaryBackgroundColor || '#FFFFFF', getters.readableThemeColor)
    },
    themeColorDark (state, getters, rootState) {
      if (!rootState.config) return
      return Vue.prototype.$color(rootState.config.themeColor).getLuminance() < 0.4
    },
    appBarMainColor (state, getters, rootState) {
      const appBarColor = rootState.config.appBarColor || 'primary'
      if (appBarColor.startsWith('secondary')) return getters.secondaryColor
      if (appBarColor.startsWith('primary')) return rootState.config.themeColor
      if (appBarColor === 'grey') return '#424242'
      if (appBarColor === 'white') return '#FFFFFF'
      return appBarColor
    },
    appBarMainColorDark (state, getters, rootState) {
      return Vue.prototype.$color(getters.appBarMainColor).getLuminance() < 0.4
    },
    headerColor (state, getters, rootState) {
      if (rootState.config.headerColor === 'page' || !rootState.config.headerColor) return getters.backgroundColor
      if (rootState.config.headerColor === 'appBar') return 'transparent'
    },
    headerColorDark (state, getters, rootState) {
      if (getters.headerColor === 'transparent') return getters.appBarMainColorDark
      return false
    },
    footerColor (state, getters, rootState) {
      if (rootState.config.footerColor === 'primary') return rootState.config.themeColor
      if (rootState.config.footerColor === 'secondary') return getters.secondaryColor
      if (rootState.config.footerColor === 'grey' || !rootState.config.footerColor) return '#424242'
      if (rootState.config.footerColor === 'lightGrey' || !rootState.config.footerColor) return '#FAFAFA'
      if (rootState.config.footerColor === 'white') return '#FFFFFF'
      if (rootState.config.footerColor === 'secondaryBackground') return getters.secondaryBackgroundColor
      return rootState.config.footerColor
    },
    footerColorDark (state, getters, rootState) {
      if (!rootState.config) return
      return Vue.prototype.$color(getters.footerColor).getLuminance() < 0.4
    },
    personalNavigationColor (state, getters, rootState) {
      if (rootState.config.personalNavigationColor === 'primary' || !rootState.config.personalNavigationColor) return rootState.config.themeColor
      if (rootState.config.personalNavigationColor === 'secondary') return getters.secondaryColor
      if (rootState.config.personalNavigationColor === 'grey' || !rootState.config.footerColor) return '#424242'
      if (rootState.config.personalNavigationColor === 'white') return '#FFFFFF'
      return rootState.config.personalNavigationColor
    },
    personalNavigationColorDark (state, getters, rootState) {
      if (!rootState.config) return
      return Vue.prototype.$color(getters.personalNavigationColor).getLuminance() < 0.4
    },
    secondaryColorDark (state, getters, rootState) {
      if (!rootState.config) return
      return Vue.prototype.$color(getters.secondaryColor).getLuminance() < 0.4
    },
    darkPrimary10 (state, getters, rootState) {
      return Vue.prototype.$color(rootState.config.themeColor).darken(10).toHexString()
    },
    darkReadablePrimary10 (state, getters, rootState) {
      return Vue.prototype.$color(getters.readableThemeColor).darken(10).toHexString()
    },
    lightPrimary10 (state, getters, rootState) {
      return Vue.prototype.$color(rootState.config.themeColor).brighten(10).toHexString()
    },
    lightPrimary20 (state, getters, rootState) {
      return Vue.prototype.$color(rootState.config.themeColor).brighten(20).toHexString()
    },
    elevation (state, getters, rootState) {
      if (!('elevation' in rootState.config)) return 1
      return rootState.config.elevation
    },
    appBarElevation (state, getters) {
      return Math.min(getters.elevation * 2, 6)
    },
    radius (state, getters, rootState) {
      if (!('radius' in rootState.config)) return 4
      return rootState.config.radius
    },
    actionCardOptions (state, getters, rootState) {
      return rootState.config.actionCardOptions || ['outlined', 'hoverElevate']
    },
    actionCardBackgroundColor (state, getters, rootState) {
      if (!rootState.config) return
      if (rootState.config.actionCardBackgroundColor === 'white' || !rootState.config.actionCardBackgroundColor) return '#FFFFFF'
      if (rootState.config.actionCardBackgroundColor === 'lightGrey') return '#FAFAFA'
      if (rootState.config.actionCardBackgroundColor === 'secondaryBackground') return getters.secondaryBackgroundColor
    },
    infoCardOptions (state, getters, rootState) {
      return rootState.config.infoCardOptions || ['outlined']
    },
    infoCardProps (state, getters) {
      return {
        elevation: getters.infoCardOptions.includes('elevate') ? getters.elevation : 0,
        class: getters.infoCardOptions.includes('outlined') ? 'also-outlined' : '',
        style: `background-color: ${getters.infoCardBackgroundColor}`
      }
    },
    infoCardBackgroundColor (state, getters, rootState) {
      if (!rootState.config) return
      if (rootState.config.infoCardBackgroundColor === 'white' || !rootState.config.infoCardBackgroundColor) return '#FFFFFF'
      if (rootState.config.infoCardBackgroundColor === 'lightGrey') return '#FAFAFA'
      if (rootState.config.infoCardBackgroundColor === 'secondaryBackground') return getters.secondaryBackgroundColor
    },
    buttonOptions (state, getters, rootState) {
      return rootState.config.buttonOptions || []
    },
    hoverInverse (state, getters) {
      return getters.buttonOptions.includes('hoverInverse')
    },
    kpiOptions (state, getters, rootState) {
      return rootState.config.kpiOptions || ['outlined', 'shaped']
    },
    kpiBackgroundColor (state, getters, rootState) {
      if (!rootState.config) return
      if (rootState.config.kpiBackgroundColor === 'white' || !rootState.config.kpiBackgroundColor) return '#FFFFFF'
      if (rootState.config.kpiBackgroundColor === 'lightGrey') return '#FAFAFA'
      if (rootState.config.kpiBackgroundColor === 'secondaryBackground') return getters.secondaryBackgroundColor
    },
    fontFamily (state, getters, rootState) {
      return (key) => {
        if (!rootState.config || !rootState.config[key]) return '"Nunito", serif'
        let family = `"${rootState.config[key].name}"`
        if (rootState.config[key].category) family += ', ' + rootState.config[key].category
        return family
      }
    },
    assetFontFace (state, getters, rootState) {
      return (key) => {
        if (!rootState.config[key] || rootState.config[key].source !== 'assets') return ''
        const asset = rootState.config.assets[rootState.config[key].name]
        if (!asset) return
        const format = asset.name.toLowerCase().endsWith('.woff2') ? 'woff2' : 'woff'
        const assetUrl = `${rootState.publicUrl}/api/v1/portals/${rootState.portal._id}/assets/${rootState.config[key].name}?draft=${rootState.draft}&hash=${asset.hash}`
        return `@font-face {
    font-family: '${rootState.config[key].name}';
    src: url('${assetUrl}') format('${format}');
    font-weight: normal;
    font-style: normal;
}
`
      }
    },
    fontsStyle (state, getters, rootState) {
      const bodyFontFamily = getters.fontFamily('bodyFont')
      const headingsFontFamily = getters.fontFamily('headingsFont')
      return `
    .v-application#app {
    font-family: ${bodyFontFamily} !important;
    }
    .v-application#app .text-subtitle-1, .v-application#app .text-subtitle-2, .v-application#app .text-body-1, .v-application#app .text-button, .v-application#app .text-caption, .v-application#app .text-overline  {
    font-family: ${bodyFontFamily} !important;
    }
    .v-application#app .text-h1, .v-application#app .text-h2, .v-application#app .text-h3, .v-application#app .text-h4, .v-application#app .text-h5, .v-application#app .text-h6 {
    font-family: ${headingsFontFamily} !important;
    }

    /* older typography classes */
    .v-application#app .subheading, .v-application#app .body-2, .v-application#app .body-1, .v-application#app .button, .v-application#app .caption, .v-application#app .overline {
    font-family: ${bodyFontFamily} !important;
    }
    .v-application#app .display-4, .v-application#app .display-3, .v-application#app .display-2, .v-application#app .display-1, .v-application#app .headline, .v-application#app .title {
    font-family: ${headingsFontFamily} !important;
    }
      `
    },
    appBarStyle (state, getters, rootState) {
      // various styles of the app bar
      let color1, color2
      if (rootState.config.appBarColor === 'primaryGradient1' && getters.themeColorDark) {
        color1 = getters.lightPrimary10
        color2 = Vue.prototype.$color(rootState.config.themeColor).darken(20).toHexString()
      }
      if (rootState.config.appBarColor === 'primaryGradient1' && !getters.themeColorDark) {
        color1 = getters.lightPrimary20
        color2 = getters.darkPrimary10
      }
      if (rootState.config.appBarColor === 'secondaryGradient1' && getters.secondaryColorDark) {
        color1 = Vue.prototype.$color(getters.secondaryColor).brighten(10).toHexString()
        color2 = Vue.prototype.$color(getters.secondaryColor).darken(20).toHexString()
      }
      if (rootState.config.appBarColor === 'secondaryGradient1' && !getters.secondaryColorDark) {
        color1 = Vue.prototype.$color(getters.secondaryColor).brighten(20).toHexString()
        color2 = Vue.prototype.$color(getters.secondaryColor).darken(10).toHexString()
      }
      if (rootState.config.appBarColor === 'primarySecondaryGradient' && getters.themeColorDark) {
        color1 = rootState.config.themeColor
        color2 = getters.readableSecondaryColor
      }
      if (rootState.config.appBarColor === 'primarySecondaryGradient' && !getters.themeColorDark) {
        color1 = rootState.config.themeColor
        color2 = getters.backgroundableSecondaryColor
      }
      if (rootState.config.appBarColor === 'secondaryPrimaryGradient' && getters.secondaryColorDark) {
        color1 = getters.secondaryColor
        color2 = getters.readableThemeColor
      }
      if (rootState.config.appBarColor === 'secondaryPrimaryGradient' && !getters.secondaryColorDark) {
        color1 = getters.secondaryColor
        color2 = getters.backgroundableThemeColor
      }
      if (color1 && color2) {
        if (rootState.config.appBarTransparency) {
          color1 = Vue.prototype.$color(color1).setAlpha(0.90).toRgbString()
          color2 = Vue.prototype.$color(color2).setAlpha(0.90).toRgbString()
        }
        return `
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
        background: linear-gradient(90deg, ${color1} 20%, ${color2} 100%);
      }
      `
      } else {
        let color = getters.appBarMainColor
        if (rootState.config.appBarTransparency) {
          color = Vue.prototype.$color(color).setAlpha(0.85).toRgbString()
        }
        return `
        .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
          background: ${color};
        }
        `
      }
    },
    footerStyle (state, getters, rootState, rootGetters) {
      if (rootGetters.footerBackgroundUrl && rootState.config.footerBackgroundImage && rootState.config.footerBackgroundImage !== 'none') {
        const transparentBg = Vue.prototype.$color(getters.footerColor).setAlpha(0.8).toRgbString()
        return `
        #app .v-footer .container {
          background:linear-gradient(90deg, transparent 0, ${transparentBg} 30% 70%, transparent 100%);
        }
        #app .v-footer>.v-card {
          background-image: url(${rootGetters.footerBackgroundUrl});
          background-position: bottom ${rootState.config.footerBackgroundImage};
          background-repeat: ${rootState.config.footerBackgroundImage.startsWith('repeat') ? rootState.config.footerBackgroundImage : 'no-repeat'};
        }
        `
      }
      return ''
    },
    personalNavigationStyle (state, getters, rootState) {
      const darkened = Vue.prototype.$color(getters.personalNavigationColor).darken(10).toHexString()
      const brightened = Vue.prototype.$color(getters.personalNavigationColor).brighten(10).toHexString()
      let color1, color2
      if (getters.personalNavigationColorDark) {
        color1 = darkened
        color2 = brightened
      } else {
        color1 = brightened
        color2 = darkened
      }
      return `
    .navigation-left {
    background: linear-gradient(90deg, ${color1} 0%, ${color2} 100%);
    }
    .v-application#app.theme--light .navigation-left {
    border-right: 1px solid ${color1} !important;
    }
    `
    },
    linksStyle (state, getters) {
      let style = `
      .v-application#app a {
        text-decoration: none;
      }
`
      if (getters.buttonOptions.includes('hoverUnderline')) {
        // see https://www.30secondsofcode.org/css/s/hover-underline-animation
        style += `
        p>a:not(.v-btn),
        .underline-link {
          display: inline-block;
          position: relative;
        }
        p>a:not(.v-btn):after,
        .underline-link:after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: ${getters.readableThemeColor};
          transform-origin: bottom right;
          transition: transform 0.25s ease-out;
        }
        .page-element a:hover:after,
        p>a:hover:after,
        .underline-link:hover:after,
        .underline-link-hover:after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }`
      } else if (getters.buttonOptions.includes('alwaysUnderline')) {
        style += `
        .underline-link {
          text-decoration: underline;
        }`
      }
      return style
    },
    fullConfigStyle (state, getters, rootState) {
      return (applyFonts, htmlOverflow) => {
        return `
html {
  overflow-y: ${htmlOverflow} !important;
}
      
.v-application#app.theme--light#app {
  background: ${getters.backgroundColor};
}
      
.v-btn.primary.theme--light {
  background: linear-gradient(90deg, ${getters.readableThemeColor} 0%, ${getters.darkReadablePrimary10} 100%);
}
.v-application#app.theme--light .v-btn.primary.v-btn--has-bg {
  border: 1px solid ${getters.darkReadablePrimary10} !important;
}

/* Apply fonts */
${getters.assetFontFace('bodyFont')}
${getters.assetFontFace('headingsFont')}
${applyFonts ? getters.fontsStyle : ''}
${getters.linksStyle}

/* some police tuning */
.v-application#app a {
  color: ${getters.readableThemeColor};
}
.v-application#app .area--dark a,
.v-application#app .area--dark h3,
.v-application#app .area--dark span {
  color: white;
}
.v-application#app .v-btn:not(.v-btn--outlined).primary,
.v-application#app .v-btn:not(.v-btn--outlined).secondary,
.v-application#app .v-btn:not(.v-btn--outlined).accent,
.v-application#app .v-btn:not(.v-btn--outlined).success,
.v-application#app .v-btn:not(.v-btn--outlined).error,
.v-application#app .v-btn:not(.v-btn--outlined).warning,
.v-application#app .v-btn:not(.v-btn--outlined).info {
  color: white;
}
.v-application#app .area--light a,
.v-application#app .area--light h3,
.v-application#app .area--light span,
.v-application#app .area--light .v-tabs-bar.primary .v-tab--active {
  color: ${getters.readableThemeColor}!important;
}
.v-application#app .primary--text {
  color: ${getters.readableThemeColor}!important;
}
.v-application#app .secondary--text {
  color: ${getters.readableSecondaryColor}!important;
}
      
/* style of the main app bar */
${getters.appBarStyle}
     
/* style of the personal navigation bar */
${getters.personalNavigationStyle}

/* default radius */
.v-application#app .v-sheet.v-card,
.v-application#app .v-text-field--outlined:not(.v-text-field--rounded),
.v-application#app .v-text-field--solo:not(.v-text-field--rounded),
.v-application#app .v-btn:not(.v-btn--rounded):not(.v-btn--text):not(.v-btn--fab):not(.v-btn--icon) {
  border-radius: ${getters.radius}px;
}
.v-application#app .v-btn-toggle > .v-btn.v-btn:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.v-application#app .v-btn-toggle > .v-btn.v-btn:last-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.v-application#app .v-menu__content {
  border-bottom-left-radius: ${getters.radius}px;
  border-bottom-right-radius: ${getters.radius}px;
}
.v-application#app .v-sheet.v-card.v-sheet--shaped {
  border-top-left-radius: 24px;
  border-bottom-right-radius: 24px;
}
.v-application#app .theme--light.v-sheet.primary-outlined {
  border: 2px solid ${getters.readableThemeColor};
}

/* used to display descriptions in cards with bottom gradient */
.card-gradient-desc170 {
  position: relative;
}
.card-gradient-desc170:before {
  content:'';
  position:absolute;
  width:100%;
  height:170px;
  left:0;
  top:0;
  background:linear-gradient(transparent 0, transparent 70%, ${getters.actionCardBackgroundColor});
}
.card-gradient-desc130 {
  position: relative;
}
.card-gradient-desc130:before {
  content:'';
  position:absolute;
  width:100%;
  height:130px;
  left:0;
  top:0;
  background:linear-gradient(transparent 0, transparent 50%, ${getters.actionCardBackgroundColor});
}
/* footer style */
${getters.footerStyle}
        `
      }
    }
  }
})
