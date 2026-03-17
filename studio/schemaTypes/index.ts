import {type SchemaTypeDefinition} from 'sanity'

import {site} from './site'
import {home} from './pages/home'

import {imageAsset} from './types/imageAsset'
import {videoAsset} from './types/videoAsset'
import {mediaAsset} from './types/mediaAsset'
import {gallery} from './types/gallery'

import {portableText} from './types/portableText'
import {link} from './types/link'
import {page} from './types/page'
import {project} from './project'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [
    //pages
    site,
    home,
    project,

    // types
    imageAsset,
    videoAsset,
    mediaAsset,
    gallery,
    link,
    portableText,
    page,
  ],
}
