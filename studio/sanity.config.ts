import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {structure} from './structure'
import {schema} from './schemaTypes'

import {muxInput} from 'sanity-plugin-mux-input'

export default defineConfig({
  name: 'default',
  title: 'giuseppe-arezzi-studio',

  projectId: 'opo1mysf',
  dataset: 'production',

  schema,

  plugins: [structureTool({structure}), visionTool(), muxInput()],
})
