import {defineField, defineType} from 'sanity'

export const site = defineType({
  name: 'site',
  title: 'Site',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),

    defineField({
      name: 'googleDescription',
      title: 'Google Search Description',
      type: 'string',
      description:
        'This text will be displayed under the website link in the Google search results.',
    }),

    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),

    defineField({
      name: 'socials',
      title: 'Socials',
      type: 'array',

      of: [
        {
          type: 'object',
          fields: [
            {name: 'platform', title: 'Platform', type: 'string'},
            {name: 'link', title: 'url', type: 'string'},
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Site'}),
  },
})
