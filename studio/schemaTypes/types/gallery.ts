import {defineType} from 'sanity'

export const gallery = defineType({
  name: 'gallery',
  title: 'Image & Video Gallery',
  type: 'array',
  of: [{type: 'imageAsset'}, {type: 'videoAsset'}],
  options: {layout: 'default'},
})
