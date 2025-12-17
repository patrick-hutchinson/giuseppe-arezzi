import type {StructureResolver} from 'sanity/structure'

import {DashboardIcon} from '@sanity/icons'
import {MasterDetailIcon} from '@sanity/icons'

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      // Singletons
      S.listItem()
        .title('Site')
        .icon(DashboardIcon)
        .child(S.document().schemaType('site').documentId('site')),

      S.divider(),

      // Pages
      S.listItem()
        .title('Pages')
        .icon(MasterDetailIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.listItem().title('Home').child(S.document().schemaType('home').documentId('home')),
            ]),
        ),
    ])
