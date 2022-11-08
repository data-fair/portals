import tinycolor from 'tinycolor2'

const isDark = (color) => tinycolor(color).getLuminance() < 0.4

// calculate a variant of a color with radability guaranteed readability
// default background is #FAFAFA the light grey background
const contrastColorCache = {}
const contrastColor = (color1, color2 = '#FAFAFA', color3) => {
  if (!color1) return
  const cacheKey = JSON.stringify([color1, color2, color3])
  if (contrastColorCache[cacheKey]) return contrastColorCache[cacheKey]
  const c = tinycolor(color1)
  const dark = isDark(color2)
  while (!tinycolor.isReadable(c, color2, { level: 'AA', size: 'small' }) || !tinycolor.isReadable(c, color3 || color2, { level: 'AA', size: 'small' })) {
    if (dark) {
      c.brighten(1)
    } else {
      c.darken(1)
    }
  }
  contrastColorCache[cacheKey] = c.toString()
  return contrastColorCache[cacheKey]
}

export default () => ({
  getters: {
    backgroundColor (state, getters, rootState) {
      return (color, dark) => {
        if (!rootState.config) return
        if (dark === undefined) dark = isDark(color)
        // a dark background will have white text
        if (dark) return contrastColor(color, '#FFFFFF')
        // on a light background we must ensure contrast with the readable version of the primary color and dark grey texts
        else return contrastColor(color, getters.readablePrimaryColor, '#424242')
      }
    },
    bodyBackgroundColor (state, getters, rootState) {
      if (!rootState.config) return
      if (rootState.config.backgroundColor === 'white' || !rootState.config.backgroundColor) return '#FFFFFF'
      if (rootState.config.backgroundColor === 'lightGrey') return '#FAFAFA'
      if (rootState.config.backgroundColor === 'secondaryBackground') return getters.secondaryBackgroundColor
    },
    primaryColor (state, getters, rootState) {
      return rootState.config && rootState.config.themeColor
    },
    secondaryColor (state, getters, rootState) {
      return rootState.config && (rootState.config.secondaryColor || getters.primaryColor)
    },
    readablePrimaryColor (state, getters, rootState) {
      return contrastColor(getters.primaryColor)
    },
    secondaryBackgroundColor (state, getters, rootState) {
      return rootState.config && rootState.config.secondaryBackgroundColor ? getters.backgroundColor(rootState.config.secondaryBackgroundColor, false) : '#FFFFFF'
    },
    primaryColorDark (state, getters) {
      return isDark(getters.primaryColor)
    },
    appBarMainColor (state, getters, rootState) {
      const appBarColor = rootState.config.appBarColor || 'primary'
      if (appBarColor.startsWith('secondary')) return getters.secondaryColor
      if (appBarColor.startsWith('primary')) return getters.primaryColor
      if (appBarColor === 'grey') return '#424242'
      if (appBarColor === 'white') return '#FFFFFF'
      return appBarColor
    },
    appBarMainColorDark (state, getters) {
      return isDark(getters.appBarMainColor)
    },
    headerColor (state, getters, rootState) {
      if (rootState.config.headerColor === 'page' || !rootState.config.headerColor) return getters.bodyBackgroundColor
      if (rootState.config.headerColor === 'appBar') return 'transparent'
    },
    headerColorDark (state, getters) {
      if (getters.headerColor === 'transparent') return getters.appBarMainColorDark
      return false
    },
    footerColorRaw (state, getters, rootState) {
      const color = rootState.config.footerColor
      if (color === 'primary') return getters.primaryColor
      if (color === 'secondary') return getters.secondaryColor
      if (color === 'grey' || !color) return '#424242'
      if (color === 'lightGrey') return '#FAFAFA'
      if (color === 'white') return '#FFFFFF'
      if (color === 'secondaryBackground') return getters.secondaryBackgroundColor
      return color
    },
    footerColorDark (state, getters, rootState) {
      return isDark(getters.footerColorRaw)
    },
    footerColor (state, getters, rootState) {
      return getters.backgroundColor(getters.footerColorRaw)
    },
    contactFooterColorRaw (state, getters, rootState) {
      const color = rootState.config.contactFooterColor
      if (color === 'primary') return getters.primaryColor
      if (color === 'secondary') return getters.secondaryColor
      if (color === 'grey' || !color) return '#424242'
      if (color === 'lightGrey') return '#FAFAFA'
      if (color === 'white') return '#FFFFFF'
      if (color === 'secondaryBackground') return getters.secondaryBackgroundColor
      return color
    },
    contactFooterColorDark (state, getters, rootState) {
      return isDark(getters.contactFooterColorRaw)
    },
    contactFooterColor (state, getters, rootState) {
      return getters.backgroundColor(getters.contactFooterColorRaw)
    },
    personalNavigationColor (state, getters, rootState) {
      if (rootState.config.personalNavigationColor === 'primary' || !rootState.config.personalNavigationColor) return getters.primaryColor
      if (rootState.config.personalNavigationColor === 'secondary') return getters.secondaryColor
      if (rootState.config.personalNavigationColor === 'grey' || !rootState.config.footerColor) return '#424242'
      if (rootState.config.personalNavigationColor === 'white') return '#FFFFFF'
      return rootState.config.personalNavigationColor
    },
    personalNavigationColorDark (state, getters, rootState) {
      return rootState.config && isDark(getters.personalNavigationColor)
    },
    secondaryColorDark (state, getters, rootState) {
      return rootState.config && isDark(getters.secondaryColor)
    },
    darkReadablePrimary10 (state, getters, rootState) {
      return tinycolor(getters.readablePrimaryColor).darken(10).toHexString()
    },
    topicColor (state, getters, rootState) {
      return (topic) => {
        if (rootState.config.topicsBackgroundColor === 'primary') return getters.primaryColor
        if (rootState.config.topicsBackgroundColor === 'secondary') return getters.secondaryColor
        return topic.color || '#f5f5f5'
      }
    },
    readableTopicColor (state, getters, rootState) {
      return (topic) => contrastColor(getters.topicColor(topic))
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
    actionCardBackgroundColor (state, getters, rootState) {
      return (horizontal = false) => {
        if (!rootState.config) return
        const bgColor = horizontal ? rootState.config.actionCardHorinzontalBackgroundColor : rootState.config.actionCardBackgroundColor
        if (bgColor === 'white' || !bgColor) return '#FFFFFF'
        if (bgColor === 'lightGrey') return '#FAFAFA'
        if (bgColor === 'secondaryBackground') return getters.secondaryBackgroundColor
      }
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
      const contrastPrimaryColor = getters.backgroundColor(getters.primaryColor)
      const contrastSecondaryColor = getters.backgroundColor(getters.secondaryColor)

      if (rootState.config.appBarColor === 'primaryGradient1' && getters.primaryColorDark) {
        color1 = contrastPrimaryColor
        color2 = tinycolor(contrastPrimaryColor).darken(20).toHexString()
      }
      if (rootState.config.appBarColor === 'primaryGradient1' && !getters.primaryColorDark) {
        color1 = tinycolor(contrastPrimaryColor).brighten(20).toHexString()
        color2 = contrastPrimaryColor
      }
      if (rootState.config.appBarColor === 'secondaryGradient1' && getters.secondaryColorDark) {
        color1 = contrastSecondaryColor
        color2 = tinycolor(contrastSecondaryColor).darken(20).toHexString()
      }
      if (rootState.config.appBarColor === 'secondaryGradient1' && !getters.secondaryColorDark) {
        color1 = tinycolor(contrastSecondaryColor).brighten(20).toHexString()
        color2 = contrastSecondaryColor
      }
      if (rootState.config.appBarColor === 'primarySecondaryGradient' && getters.primaryColorDark) {
        color1 = contrastPrimaryColor
        color2 = getters.backgroundColor(getters.secondaryColor, true)
      }
      if (rootState.config.appBarColor === 'primarySecondaryGradient' && !getters.primaryColorDark) {
        color1 = contrastPrimaryColor
        color2 = getters.backgroundColor(getters.secondaryColor, false)
      }
      if (rootState.config.appBarColor === 'secondaryPrimaryGradient' && getters.secondaryColorDark) {
        color1 = contrastSecondaryColor
        color2 = getters.backgroundColor(getters.primaryColor, true)
      }
      if (rootState.config.appBarColor === 'secondaryPrimaryGradient' && !getters.secondaryColorDark) {
        color1 = contrastSecondaryColor
        color2 = getters.backgroundColor(getters.primaryColor, false)
      }
      if (color1 && color2) {
        if (rootState.config.appBarTransparency) {
          color1 = tinycolor(color1).setAlpha(0.90).toRgbString()
          color2 = tinycolor(color2).setAlpha(0.90).toRgbString()
        }
        return `
      .theme--light.v-app-bar.main-app-bar.v-toolbar.v-sheet {
        background: linear-gradient(90deg, ${color1} 20%, ${color2} 100%);
      }
      `
      } else {
        let color = getters.backgroundColor(getters.appBarMainColor)
        if (rootState.config.appBarTransparency) {
          color = tinycolor(color).setAlpha(0.90).toRgbString()
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
        const transparentBg = tinycolor(getters.footerColor).setAlpha(0.8).toRgbString()
        return `
        #app .v-footer.main-footer .container {
          background:linear-gradient(90deg, transparent 0, ${transparentBg} 30% 70%, transparent 100%);
        }
        #app .v-footer.main-footer>.v-card {
          background-image: url(${rootGetters.footerBackgroundUrl});
          background-position: bottom ${rootState.config.footerBackgroundImage};
          background-repeat: ${rootState.config.footerBackgroundImage.startsWith('repeat') ? rootState.config.footerBackgroundImage : 'no-repeat'};
        }
        `
      }
      return ''
    },
    personalNavigationStyle (state, getters, rootState) {
      const darkened = tinycolor(getters.personalNavigationColor).darken(10).toHexString()
      const brightened = tinycolor(getters.personalNavigationColor).brighten(10).toHexString()
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
          height: 3px;
          bottom: 0;
          left: 0;
          background-color: ${getters.readablePrimaryColor};
          transform-origin: bottom left;
          transition: transform 0.25s ease-out;
        }
        .page-element a:hover:after,
        p>a:hover:after,
        .underline-link:hover:after,
        .underline-link-hover:after {
          transform: scaleX(1);
          transform-origin: bottom left;
          background-color: ${getters.darkReadablePrimary10};
        }
        .underline-link.underline-link-partial:after {
          transform: scaleX(0.2);
        }
        .underline-link.underline-link-partial:hover:after,
        .underline-link-hover.underline-link-partial:after {
          transform: scaleX(0.4);
        }
        `
      } else if (getters.buttonOptions.includes('alwaysUnderline')) {
        style += `
        .underline-link {
          text-decoration: underline;
        }`
      }
      return style
    },
    gradientDescStyle (state, getters) {
      return (height, bgColor) => `
      .card-gradient-desc${height} {
        position: relative;
      }
      .card-gradient-desc${height}:before {
        content:'';
        position:absolute;
        width:100%;
        height:${height}px;
        left:0;
        top:0;
        background:linear-gradient(transparent 0, transparent ${Math.round(((height - 40) / height) * 100)}%, ${bgColor});
      }
      `
    },
    fullConfigStyle (state, getters, rootState) {
      return (applyFonts, htmlOverflow) => {
        return `
html {
  overflow-y: ${htmlOverflow} !important;
}
      
.v-application#app.theme--light#app {
  background: ${getters.bodyBackgroundColor};
}
      
.v-btn.primary.theme--light.v-btn--has-bg {
  background: linear-gradient(90deg, ${getters.readablePrimaryColor} 0%, ${getters.darkReadablePrimary10} 100%);
}
.v-application#app.theme--light .v-btn.primary.v-btn--has-bg {
  border: 1px solid ${getters.darkReadablePrimary10} !important;
}
.v-btn.secondary.theme--light.v-btn--has-bg {
  background-color: ${contrastColor(getters.secondaryColor)} !important;
}

/* Apply fonts */
${getters.assetFontFace('bodyFont')}
${getters.assetFontFace('headingsFont')}
${applyFonts ? getters.fontsStyle : ''}
${getters.linksStyle}

/* some police tuning */
.v-application#app a:not(.v-tab):not(.v-list-item):not(.v-card--link) {
  color: ${getters.readablePrimaryColor};
}
.v-application#app a:not(.v-tab):not(.v-list-item):not(.v-card--link):hover {
  color: ${getters.darkReadablePrimary10};
}
.v-application#app .area--dark a,
.v-application#app .area--dark a:not(.v-tab):not(.v-list-item):not(.v-card--link),
.v-application#app .area--dark a:not(.v-tab):not(.v-list-item):not(.v-card--link):hover,
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
.v-application#app .theme--dark.v-list a {
  color: white;
}
.v-application#app .area--light a:not(.v-tab):not(.v-list-item),
.v-application#app .area--light h3,
.v-application#app .area--light span,
.v-application#app .area--light .v-tabs-bar.primary .v-tab--active {
  color: ${getters.readablePrimaryColor}!important;
}
.v-application#app .primary--text {
  color: ${getters.readablePrimaryColor}!important;
}
.v-application#app .primary-darker--text {
  color: ${getters.darkReadablePrimary10}!important;
}
.v-application#app .secondary--text {
  color: ${contrastColor(getters.secondaryColor)}!important;
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
.v-application#app .v-chip.v-chip--label {
  border-radius: ${getters.radius}px !important;
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
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-bottom-left-radius: ${getters.radius}px;
  border-bottom-right-radius: ${getters.radius}px;
}
.v-application#app .v-sheet.v-card.v-sheet--shaped {
  border-top-left-radius: 24px;
  border-bottom-right-radius: 24px;
}
.v-application#app .theme--light.v-sheet.primary-outlined {
  border: 2px solid ${getters.readablePrimaryColor};
}

/* used to display descriptions in cards with bottom gradient */
${getters.gradientDescStyle(170, getters.actionCardBackgroundColor(false))}
${getters.gradientDescStyle(130, getters.actionCardBackgroundColor(false))}
${getters.gradientDescStyle(90, getters.actionCardBackgroundColor(true))}
${getters.gradientDescStyle(70, getters.infoCardBackgroundColor)}

/* footer style */
${getters.footerStyle}

/* home page style */
#app .nav-home-search input::placeholder {
  color: ${getters.readablePrimaryColor};
  font-weight: bold;
}
#app .nav-home-search .v-input__icon--append button {
  color: ${getters.readablePrimaryColor};
}
        `
      }
    }
  }
})
