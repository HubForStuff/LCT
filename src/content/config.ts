import { defineCollection, z } from 'astro:content';

const programs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['expansion', 'partnerships', 'advisory']),
    featured: z.boolean().default(false),
    image: z.string().optional(),
  }),
});

const competitions = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(['open', 'ongoing', 'closed']),
    deadline: z.date().optional(),
    prize: z.string().optional(),
    featured: z.boolean().default(false),
    image: z.string().optional(),
  }),
});

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    time: z.string().optional(),
    location: z.string(),
    type: z.enum(['workshop', 'talk', 'networking', 'fair']),
    featured: z.boolean().default(false),
    image: z.string().optional(),
  }),
});

export const collections = { programs, competitions, events };