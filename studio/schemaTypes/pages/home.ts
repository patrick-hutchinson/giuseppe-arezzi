import {defineField, defineType} from 'sanity'

export const home = defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  fields: [
    defineField({
      name: 'announcement',
      title: 'Announcement',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'introduction',
      title: 'Introduction',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'awards',
      type: 'object',
      fields: [
        {name: 'year', type: 'string'},
        {name: 'text', type: 'string'},
      ],
    }),
    defineField({
      name: 'acquisitions',
      type: 'object',
      fields: [
        {name: 'year', type: 'string'},
        {name: 'text', type: 'string'},
      ],
    }),
    defineField({
      name: 'clients',
      title: 'Clients',
      type: 'portableText',
    }),
    defineField({
      name: 'print',
      title: 'Print',
      type: 'object',
      fields: [
        {name: 'title', type: 'string'},
        {name: 'media', type: 'mediaAsset'},
      ],
    }),
    defineField({
      name: 'web',
      title: 'Web',
      type: 'object',
      fields: [
        {name: 'title', type: 'string'},
        {name: 'media', type: 'mediaAsset'},
        {name: 'url', type: 'string'},
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Advert Banner',
      }
    },
  },
})
