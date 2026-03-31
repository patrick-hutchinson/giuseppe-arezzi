import type {StructureResolver} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

import {DashboardIcon} from '@sanity/icons'
import {MasterDetailIcon} from '@sanity/icons'

// Define singleton document IDs here
const singletons = ['site', 'home', 'page', 'print']

// Add other types you want to hide from Desk here
const hiddenTypes = [...singletons, 'mux.videoAsset']

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

      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Projects',
        S,
        context,
      }),

      // Everything else (exclude hidden types and the ones we added above)
      ...S.documentTypeListItems().filter(
        (listItem) =>
          !hiddenTypes.includes(listItem.getId()!) &&
          !['project'].includes(listItem.getId()!) &&
          !['eventType', 'colorPair', 'venue', 'speaker', 'event'].includes(listItem.getId()!),
      ),
    ])
