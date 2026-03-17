import {defineField, defineType} from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',

  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'edition',
      type: 'string',
    }),
    defineField({
      name: 'year',
      type: 'string',
    }),
    defineField({
      name: 'description',
      type: 'portableText',
    }),
    defineField({
      name: 'gallery',
      type: 'gallery',
      description: 'Diese Bilder werden in voller Bildschirmhöhe unterhalb der Comments angezeigt,',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'credits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'role', title: 'Role', type: 'string'}),
            defineField({
              name: 'people',
              title: 'People',
              type: 'array',
              of: [{type: 'string'}],
              options: {
                layout: 'tags',
              },
              description:
                '⚠️ Festival Namen hinzufügen und dann ENTER dücken, sodass die Eingabe als Tag auftaucht.',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'slug',
      title: 'url',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title,
      }
    },
  },
})
