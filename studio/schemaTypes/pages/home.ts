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
      type: 'portableText',
    }),
    defineField({
      name: 'acquisitions',
      type: 'portableText',
    }),
    defineField({
      name: 'clients',
      type: 'portableText',
    }),
    defineField({
      name: 'collaborators',
      type: 'portableText',
    }),
    defineField({
      name: 'print',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'title', type: 'string'},
            {name: 'gallery', type: 'gallery'},
            {name: 'url', type: 'string'},
          ],
        },
      ],
    }),
    defineField({
      name: 'web',
      type: 'portableText',
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
